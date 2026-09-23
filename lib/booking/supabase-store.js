/**
 * Supabase adapter for lib/booking/lifecycle.js (`db` dependency).
 *
 * Tolerant of the pre-migration schema: `revision`, `calendar_sync_status`,
 * `calendar_sync_error`, `calendar_synced_at` do not exist in production until
 * the A4 migration is applied. In 'auto' mode (default) the adapter tries the
 * full row first; if PostgREST reports a missing column (PGRST204 / 42703) it
 * switches to legacy mode for the life of the process: those fields are
 * stripped and optimistic concurrency guards on `updated_at` instead of
 * `revision`.
 *
 * Conditional update: `.eq('id', id).eq(<guard>, expected.<guard>)` + maybeSingle();
 * zero rows matched (and the row still exists) ⇒ { conflict: true }.
 */
export const SYNC_COLUMNS = Object.freeze([
  'revision',
  'calendar_sync_status',
  'calendar_sync_error',
  'calendar_synced_at',
]);

function isMissingColumn(error) {
  if (!error) return false;
  const code = String(error.code || '');
  if (code === 'PGRST204' || code === '42703') return true;
  return /column .*(does not exist|could not find)|could not find the .* column/i.test(String(error.message || ''));
}

function strip(obj) {
  const out = { ...obj };
  for (const c of SYNC_COLUMNS) delete out[c];
  return out;
}

/**
 * @param {object} supabase  service-role client (getSupabaseAdminClient()).
 * @param {{ mode?: 'auto'|'full'|'legacy', table?: string }} [opts]
 */
export function createSupabaseBookingStore(supabase, { mode = 'auto', table = 'bookings' } = {}) {
  let legacy = mode === 'legacy';
  const canFallBack = mode === 'auto';

  async function withFallback(run) {
    const first = await run(legacy);
    if (!legacy && canFallBack && isMissingColumn(first.error)) {
      legacy = true;
      return run(true);
    }
    return first;
  }

  return {
    get isLegacy() { return legacy; },

    async insert(row) {
      return withFallback(async (lg) => {
        const { data, error } = await supabase.from(table).insert(lg ? strip(row) : row).select().single();
        return { data: data || null, error: error || null };
      });
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      return { data: data || null, error: error || null };
    },

    async update(id, patch, { expected } = {}) {
      return withFallback(async (lg) => {
        const body = lg ? strip(patch) : patch;
        if (Object.keys(body).length === 0) {
          // Nothing persistable in legacy mode (sync-state only) — report as applied.
          return { data: { ...(expected || {}), ...patch }, error: null, conflict: false };
        }
        let q = supabase.from(table).update(body).eq('id', id);
        if (expected) {
          const col = lg ? 'updated_at' : 'revision';
          const val = lg ? expected.updated_at : (Number(expected.revision) || 0);
          if (!lg && !expected.revision) {
            // Legacy row (revision NULL/0) — match either.
            q = q.or('revision.is.null,revision.eq.0');
          } else {
            q = val == null ? q.is(col, null) : q.eq(col, val);
          }
        }
        const { data, error } = await q.select().maybeSingle();
        if (error) return { data: null, error, conflict: false };
        if (!data && expected) return { data: null, error: null, conflict: true };
        return { data: data || null, error: data ? null : new Error('booking not found'), conflict: false };
      });
    },
  };
}
