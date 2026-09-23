-- ============================================================================
-- DRAFT — NOT APPLIED. Rollback for 20260923_booking_calendar_sync.up.sql.
--
-- Drops ONLY the six columns the up migration added (and, with them, the
-- bookings_calendar_sync_status_check constraint and column comments).
-- Every other column, row, index and RLS policy is untouched.
--
-- DATA LOSS NOTE: sync state + revision values are discarded. Bookings,
-- statuses, dates and calendar_event_id are NOT affected. Take the backup in
-- README-booking-phaseA.md §1b first if the sync history matters.
--
-- Safe with the Phase A code deployed ONLY when BOOKING_STORE_MODE is unset or
-- 'auto' (the adapter falls back to legacy/updated_at mode on PGRST204/42703).
-- If it is pinned to 'full', set it to 'legacy' (or unset) and redeploy FIRST.
-- ============================================================================

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.bookings
  drop column if exists calendar_sync_status,
  drop column if exists calendar_sync_error,
  drop column if exists calendar_synced_at,
  drop column if exists revision,
  drop column if exists ownership_proof,
  drop column if exists calendar_event_proof;

commit;

notify pgrst, 'reload schema';
