-- DRAFT — NOT APPLIED. Rollback of 20260924_booking_reservations.up.sql.
-- Switch the app off the reservation RPCs first (deploy the pre-B2 code); otherwise
-- every create/reschedule fails closed (503) once the functions are gone.
-- Drops only what the up migration created. Booking rows are untouched; the idempotency
-- keys are lost (a retry after rollback may create a duplicate: same as pre-B2 behaviour).
begin;
set local lock_timeout = '5s';
drop function if exists public.booking_reserve_reschedule(uuid, int, jsonb, timestamptz, timestamptz, text, int, int, int);
drop function if exists public.booking_reserve_create(jsonb, timestamptz, timestamptz, text, int, int, int, text);
drop function if exists public.booking_slot_problem(timestamptz, timestamptz, text, int, int, int, uuid);
drop function if exists public.booking_row_interval(text, text, int);
drop table if exists public.booking_idempotency;
commit;
