-- ============================================================================
-- PHASE A LAUNCH PREREQUISITE (red-team R15), APPROVAL-GATED.
-- DRAFT. Apply only with Abram's explicit OK, in the rollout order of
-- README-booking-phaseA.md §2 step 2: after the policy snapshot and anon-insert log
-- review, BEFORE the Phase A deploy. Phase A ownership proofs rely on no new
-- anon-forged rows. Dropping the policy does NOT make existing rows trusted (§8).
-- (Originally drafted as out of Phase A scope under boss decision 3; promoted to a
--  launch prerequisite in fix-3 once R15 showed forged rows could drive Calendar.)
--
-- Problem (phaseA-inventory.md §7): RLS policy `bookings_anon_insert` on
-- public.bookings is PERMISSIVE, cmd=INSERT, with_check = true. Anyone holding
-- the public anon key (it ships in every page's JS) can POST straight to
-- Supabase REST /rest/v1/bookings and insert arbitrary rows — bypassing the
-- /api/booking/confirm rate limit (3/15 min/IP), 24h dedupe, input validation,
-- and the lifecycle service (they could even set status='confirmed',
-- calendar_event_id, or — after the A4 migration — calendar_sync_status/revision).
--
-- Who inserts into bookings today (grep of the repo @ feat/booking-lifecycle-phase-a,
-- Sep 23 2026):
--   * lib/booking/supabase-store.js via lifecycle.create()  — service-role client
--     (getSupabaseAdminClient), which BYPASSES RLS. This is the only insert path.
--   * No `entities.Booking.create`, no browser `supabase.from('bookings').insert`,
--     no direct `/rest/v1/bookings` call anywhere in app/, components/, lib/,
--     scripts/, public/ (the only Booking entity calls are .list() and .update()
--     in AdminCRMClient.jsx, which run as the logged-in admin under
--     `admin_bookings_all`, not anon).
--   * Workspace scripts: no `rest/v1/bookings` references found.
-- ⇒ The anon INSERT policy is unused by the application.
--
-- Recommendation: OPTION A (drop). With no policy granting INSERT to anon /
-- authenticated non-admins, RLS denies those inserts; the service-role path
-- and the `admin_bookings_all` policy are unaffected.
--
-- OPTION B (keep a policy but constrain it) is NOT recommended: RLS cannot
-- enforce the rate limit or dedupe, so a "tightened" anon policy still lets
-- the public bypass the API; it only narrows which values they can write.
-- It is included (commented) solely in case Abram knows of an external anon
-- writer (e.g. an old Base44 form/embed) that must keep working.
--
-- Before applying: snapshot the current policy (README-booking-phaseA.md §4),
-- and confirm in Supabase logs/API gateway that no anon INSERTs to bookings
-- occurred recently (any hit = an unknown writer; stop and investigate).
-- ============================================================================

begin;
set local lock_timeout = '5s';

-- ── OPTION A (recommended): remove the unused anon insert grant ────────────
drop policy if exists bookings_anon_insert on public.bookings;

-- ── OPTION B (only if an anon writer must survive) — use INSTEAD of A ──────
-- create policy bookings_anon_insert on public.bookings
--   as permissive for insert to anon
--   with check (
--     status = 'pending'
--     and calendar_event_id is null
--     and coalesce(nullif(trim(customer_email), ''), null) is not null
--     and char_length(coalesce(notes, '')) <= 5000
--     -- after the A4 migration also:
--     -- and coalesce(calendar_sync_status, 'unknown') in ('unknown', 'pending')
--     -- and revision = 0
--   );

commit;

-- ── ROLLBACK (restores today's behaviour exactly) ──────────────────────────
-- drop policy if exists bookings_anon_insert on public.bookings;
-- create policy bookings_anon_insert on public.bookings
--   as permissive for insert to public with check (true);
-- roles: the parent owner's read of pg_policies (Sep 23 2026) shows roles = {public},
-- so `to public` above matches. Still compare against the §4 snapshot taken right before
-- applying, and use its value if it differs. Re-creating this policy reopens R15, so
-- Phase A code must not be live while it exists.
