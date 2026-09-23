-- ============================================================================
-- DRAFT — NOT APPLIED. Phase A (measurement booking), slice A4.
-- Needs Abram's OK + a fresh backup (see migrations/README-booking-phaseA.md)
-- before it is run against any real database.
--
-- Purpose: durable calendar-sync state + optimistic-concurrency revision on
-- public.bookings, used by lib/booking/lifecycle.js via lib/booking/supabase-store.js.
--
-- Additive only:
--   * 7 new columns: 2 with defaults (calendar_sync_status 'unknown', revision 0),
--     5 nullable without defaults → existing reads/writes are unaffected.
--   * NO backfill. Existing rows become calendar_sync_status='unknown' and
--     revision=0 ("not checked yet"). Nothing is marked 'synced' automatically.
--   * No existing column, index, policy or row value is changed.
--
-- Postgres ≥ 11: ADD COLUMN with a constant default is metadata-only (no table
-- rewrite). The CHECK constraint is validated against existing rows, which all
-- hold the default 'unknown', so it cannot fail.
--
-- Rollback: 20260923_booking_calendar_sync.down.sql
-- ============================================================================

begin;

-- Don't queue behind a long-running lock on a live table; fail fast instead.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.bookings
  add column if not exists calendar_sync_status text default 'unknown'
    constraint bookings_calendar_sync_status_check
    check (calendar_sync_status in ('unknown', 'pending', 'synced', 'failed', 'absent')),
  add column if not exists calendar_sync_error text,
  add column if not exists calendar_synced_at timestamptz,
  add column if not exists revision integer not null default 0,
  -- Fix R15: server-issued HMAC ownership proofs (lib/booking/ownership.js). NULL on
  -- every existing row: historical rows are NOT trusted automatically (no backfill).
  add column if not exists ownership_proof text,
  add column if not exists calendar_event_proof text,
  -- Fix R7: set just before a Google insert; cleared once the outcome is definite.
  add column if not exists calendar_op_started_at timestamptz;

comment on column public.bookings.calendar_sync_status is
  'Google Calendar reconciliation state (lib/booking/lifecycle.js): unknown = pre-Phase-A row, never checked; pending = state changed, sync not done; synced; failed (see calendar_sync_error); absent = event confirmed deleted.';
comment on column public.bookings.calendar_sync_error is
  'Sanitised last calendar sync error (no tokens/emails), or null.';
comment on column public.bookings.calendar_synced_at is
  'Time of the last successful calendar reconciliation.';
comment on column public.bookings.ownership_proof is
  'HMAC(BOOKING_OWNERSHIP_SECRET, row|id) written by lifecycle.create() or admin trust_calendar_event. NULL = unverified (anon-insertable) row: no customer-driven Google Calendar change.';
comment on column public.bookings.calendar_event_proof is
  'HMAC(BOOKING_OWNERSHIP_SECRET, event|id|calendar_event_id) for a non-derived (legacy) event id, written only by admin trust_calendar_event. NULL = the stored event id is never sent to Google.';
comment on column public.bookings.calendar_op_started_at is
  'When a Google Calendar insert for this booking was started and its outcome is not yet definite (timeout/abort). While set, a cancellation must reserve the stable id instead of reporting it absent; cleared only when Google state rules out a late insert, never by time.';
comment on column public.bookings.revision is
  'Optimistic-concurrency counter, +1 on every lifecycle state change. 0 = pre-Phase-A row.';

commit;

-- PostgREST (Supabase REST) caches the schema; without this the API keeps
-- answering PGRST204 "column not found" for the new columns until its next reload.
notify pgrst, 'reload schema';
