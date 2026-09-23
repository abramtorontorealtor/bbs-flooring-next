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
 *           column (PGRST204 / 42703) switch THIS store instance to legacy.
 *           Stores are built per request, so every request re-probes: this is not
 *           sticky per process (red-team R18). Safe before AND after the
 *           migration, and safe if the migration is rolled back.
 *  full   — never falls back: a missing column surfaces as a db_error. Pin
 *           only after the migration is applied and verified.
 *  legacy — never sends the new columns (emergency / pre-migration pin).
 *
 * Conditional update: `.eq('id', id)` + guards + maybeSingle();
 * zero rows matched (and the row still exists) ⇒ { conflict: true }.
 *
 * Legacy guard = `updated_at` AND `status` (when the expected row has them).
 * The status guard catches writers that change status without bumping
 * updated_at (the CRM generic writer, same-millisecond clocks; red-team
 * R10/R11/R14). It does not catch same-status edits with an unchanged
 * updated_at; only full-mode `revision` does.
 *
 * Stripped / no-op writes (fix R10): in legacy mode a sync-state-only patch has
 * nothing the schema can store. It is NOT reported as applied. The adapter runs
 * the same guard as a READ:
 *   row still matches → { data: <current DB row>, conflict:false, persisted:false }
 *   row changed       → { conflict:true }, so the lifecycle reconciles again
 *   row gone          → { error }
 * `persisted:false` tells callers the failure/sync state was NOT recorded.
 * Legacy mode cannot record durable sync failures: the CRM gets no red badge
 * and no Retry. Apply the additive migration before relying on it.
 */
export const SYNC_COLUMNS = Object.freeze([
  'revision',
  'calendar_sync_status',
  'calendar_sync_error',
  'calendar_synced_at',
  // Fix R15 ownership proofs (same additive migration). Legacy mode strips them,
  // so customer-driven calendar changes fail closed there.
  'ownership_proof',
  'calendar_event_proof',
  // Fix R7: "a Google insert may still be in flight since <ts>" marker.
  'calendar_op_started_at',
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
      logger.warn?.('[booking-store] sync columns missing — legacy mode (updated_at CAS) for this store instance (per request)');
      return run(true);
    }
    return first;
  }

  function guard(q, expected, lg) {
    if (lg) {
      q = expected.updated_at == null ? q.is('updated_at', null) : q.eq('updated_at', expected.updated_at);
      if (expected.status != null) q = q.eq('status', expected.status);
      return q;
    }
    const rev = Number(expected.revision) || 0;
    // Pre-migration rows carry revision 0 (column default); tolerate NULL too.
    q = rev === 0 ? q.or('revision.is.null,revision.eq.0') : q.eq('revision', rev);
    if (expected.updated_at != null) q = q.eq('updated_at', expected.updated_at);
    return q;
  }

  /**
   * Phase B (B2) atomic reservation RPCs (migrations/20260924_booking_reservations.up.sql).
   * Service-role only. Result: { outcome, booking?, reason? } or { error }. Missing function /
   * legacy schema / any RPC failure → { error } and the caller answers 503. There is NO fallback
   * to a plain insert/update: a non-atomic write would reintroduce double booking.
   */
  async function rpc(fn, args) {
    if (legacy) return { error: Object.assign(new Error('reservation RPC needs the Phase A/B migrations (store is legacy)'), { code: 'legacy' }) };
    try {
      const { data, error } = await supabase.rpc(fn, args);
      if (error) return { error };
      const outcome = data?.outcome;
      if (!['created', 'replay', 'none', 'conflict', 'updated', 'stale', 'not_found', 'invalid_state'].includes(outcome)) {
        return { error: Object.assign(new Error('unexpected reservation RPC result'), { code: 'bad_shape' }) };
      }
      return { outcome, booking: data.booking || null, reason: data.reason || null };
    } catch (err) {
      return { error: err };
    }
  }

  return {
    get mode() { return resolved; },
    get isLegacy() { return legacy; },

    /** Read-only replay lookup (R-B2-REPLAY): { outcome:'replay'|'none', booking? } or { error }. */
    async findReplay(row, keyHash = null) {
      return rpc('booking_find_replay', {
        p_key_hash: keyHash, p_email: row.customer_email ?? null, p_phone: row.customer_phone ?? null,
        p_date: row.preferred_date ?? null, p_time: row.preferred_time ?? null,
      });
    },

    async reserveCreate(row, slot, keyHash = null) {
      return rpc('booking_reserve_create', {
        p_row: row,
        p_start: slot?.start ?? null, p_end: slot?.end ?? null, p_local_date: slot?.localDate ?? row.preferred_date,
        p_duration_minutes: slot?.durationMinutes ?? 60, p_pad_minutes: slot?.padMinutes ?? 0,
        p_daily_cap: slot?.dailyCap ?? null, p_key_hash: keyHash,
      });
    },

    async reserveReschedule(id, expectedRevision, patch, slot) {
      return rpc('booking_reserve_reschedule', {
        p_id: id, p_expected_revision: Number(expectedRevision) || 0, p_patch: patch,
        p_start: slot?.start ?? null, p_end: slot?.end ?? null, p_local_date: slot?.localDate ?? patch.preferred_date,
        p_duration_minutes: slot?.durationMinutes ?? 60, p_pad_minutes: slot?.padMinutes ?? 0,
        p_daily_cap: slot?.dailyCap ?? null,
      });
    },

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

    /**
     * opMarker (fix R7 marker ownership): undefined = no filter; null = only if
     * calendar_op_started_at IS NULL; string = only if it equals that exact value.
     * Ignored in legacy mode (the column does not exist; the marker cannot be stored).
     */
    async update(id, patch, { expected, opMarker } = {}) {
      const markerFilter = (q, lg) => {
        if (lg || opMarker === undefined) return q;
        return opMarker === null ? q.is('calendar_op_started_at', null) : q.eq('calendar_op_started_at', opMarker);
      };
      return withFallback(async (lg) => {
        const body = lg ? strip(patch) : patch;
        if (Object.keys(body).length === 0) {
          // Nothing persistable (legacy sync-state-only patch). Never report the
          // expected row as applied. Run the CAS guard as a read, so a concurrent
          // change still surfaces as a conflict (fix R10).
          let q = supabase.from(table).select('*').eq('id', id);
          if (expected) q = guard(q, expected, lg);
          const { data, error } = await q.maybeSingle();
          if (error) return { data: null, error, conflict: false, persisted: false };
          if (data) return { data, error: null, conflict: false, persisted: false };
          const { data: cur, error: e2 } = await supabase.from(table).select('id').eq('id', id).maybeSingle();
          if (e2) return { data: null, error: e2, conflict: false, persisted: false };
          if (!cur) return { data: null, error: new Error('booking not found'), conflict: false, persisted: false };
          return { data: null, error: null, conflict: true, persisted: false };
        }
        let q = supabase.from(table).update(body).eq('id', id);
        if (expected) q = guard(q, expected, lg);
        q = markerFilter(q, lg);
        const { data, error } = await q.select().maybeSingle();
        if (error) return { data: null, error, conflict: false };
        if (!data && (expected || opMarker !== undefined)) return { data: null, error: null, conflict: true };
        return { data: data || null, error: data ? null : new Error('booking not found'), conflict: false };
      });
    },
  };
}
