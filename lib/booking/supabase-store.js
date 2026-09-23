/**
 * Supabase adapter for lib/booking/lifecycle.js (`db` dependency).
 *
 * Two schema modes:
 *
 *  legacy — pre-migration schema. `revision`, `calendar_sync_status`,
 *           `calendar_sync_error`, `calendar_synced_at` do not exist: they are
 *           stripped from every write and optimistic concurrency (CAS) guards
 *           on `updated_at`.
 *  full   — after migrations/20260923_booking_calendar_sync.up.sql. All fields
 *           persisted; CAS guards on `revision` AND `updated_at` (when known).
 *           The double guard keeps CAS correct while old/legacy-mode instances
 *           are still running during a rollout: they bump updated_at but not
 *           revision, and would otherwise be invisible to a revision-only guard.
 *
 * Mode selection (safest first): `opts.mode` → env `BOOKING_STORE_MODE`
 * ('auto' | 'full' | 'legacy') → 'auto'. Unknown values → 'auto'.
 *  auto   — feature-detect: try the full row; if PostgREST reports a missing
 *           column (PGRST204 / 42703) switch to legacy for the life of the
 *           process (sticky; a redeploy re-probes). Safe before AND after the
 *           migration, and safe if the migration is rolled back.
 *  full   — never falls back: a missing column surfaces as a db_error. Pin
 *           only after the migration is applied and verified.
 *  legacy — never sends the new columns (emergency / pre-migration pin).
 *
 * Conditional update: `.eq('id', id)` + guards + maybeSingle();
 * zero rows matched (and the row still exists) ⇒ { conflict: true }.
 */
export const SYNC_COLUMNS = Object.freeze([
  'revision',
  'calendar_sync_status',
  'calendar_sync_error',
  'calendar_synced_at',
]);

export const STORE_MODES = Object.freeze(['auto', 'full', 'legacy']);

/** BOOKING_STORE_MODE → mode; anything unrecognised is 'auto'. */
export function resolveStoreMode(env = (typeof process !== 'undefined' ? process.env : {}) || {}) {
  const v = String(env.BOOKING_STORE_MODE || '').trim().toLowerCase();
  return STORE_MODES.includes(v) ? v : 'auto';
}

export function isMissingColumn(error) {
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
 * @param {{ mode?: 'auto'|'full'|'legacy', table?: string, logger?: object }} [opts]
 */
export function createSupabaseBookingStore(supabase, { mode, table = 'bookings', logger = console } = {}) {
  const resolved = STORE_MODES.includes(mode) ? mode : resolveStoreMode();
  let legacy = resolved === 'legacy';
  const canFallBack = resolved === 'auto';

  async function withFallback(run) {
    const first = await run(legacy);
    if (!legacy && canFallBack && isMissingColumn(first.error)) {
      legacy = true;
      logger.warn?.('[booking-store] sync columns missing — legacy mode (updated_at CAS) until redeploy');
      return run(true);
    }
    return first;
  }

  function guard(q, expected, lg) {
    if (lg) {
      return expected.updated_at == null ? q.is('updated_at', null) : q.eq('updated_at', expected.updated_at);
    }
    const rev = Number(expected.revision) || 0;
    // Pre-migration rows carry revision 0 (column default); tolerate NULL too.
    q = rev === 0 ? q.or('revision.is.null,revision.eq.0') : q.eq('revision', rev);
    if (expected.updated_at != null) q = q.eq('updated_at', expected.updated_at);
    return q;
  }

  return {
    get mode() { return resolved; },
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
        if (expected) q = guard(q, expected, lg);
        const { data, error } = await q.select().maybeSingle();
        if (error) return { data: null, error, conflict: false };
        if (!data && expected) return { data: null, error: null, conflict: true };
        return { data: data || null, error: data ? null : new Error('booking not found'), conflict: false };
      });
    },
  };
}
