# Booking Phase B (B1–B4): release / review package (DRAFT)

Branch `feat/booking-phase-b`, worktree `/home/ubuntu/bbs-wt-booking-b`, on top of accepted B1 `e119924` (itself on Phase A `0521250`).
Local only: nothing pushed, deployed, migrated, or sent. No `next build/dev` on this host.

## What changed
| Slice | Change | Key files |
|---|---|---|
| B2 SQL | Atomic reservation RPCs: one advisory lock for the single measurement resource. Overlap + buffer + daily cap computed from the text date/time columns in America/Toronto. JS parity: untimed = whole local day, spring-gap time = whole day, fall-back ambiguous = earlier instant. The 24 h same-contact dedupe runs inside the lock. Owner-scoped idempotency table (sha256 of contact + client key). Reschedule = revision CAS + self-exclusion only; a conflict writes nothing. Service-role only, search_path pinned. | `migrations/20260924_booking_reservations.{up,down}.sql` |
| B2 JS | `lib/booking/reservation.js`: owner-scoped key hash, slot gate. Customer requests get the policy check → 400 `invalid_slot`. Fresh availability (DB + configured calendars) close to commit: outage → 503 retriable, taken → 409 with sanitized refreshed options. Admin reschedule = deliberate **logged policy override** (occupancy still enforced). Store adapters call the RPCs with **no fallback** to a plain insert/update. The lifecycle routes create and every reschedule path (customer, admin, legacy `/api/booking/reschedule`) through the reservation. A replay returns the original booking: `duplicate:true`, no email, no calendar call, no conversion. The JS 24 h dedupe pre-check was removed (now inside the lock). | `lib/booking/{reservation,lifecycle,handlers,server,supabase-store}.js` |
| B3 | Shared `SlotPicker`: real availability (no-store), up to 3 earliest + **See more times**, ET labels, dates built from calendar components (no locale shift), stale time cleared, 409 override, neutral loading/error, tap-to-call, 44 px targets, `type="button"` everywhere. Used in the free-measurement, quote-booking and manage/reschedule clients. Copy per PLAN B3: H1, support line, **Free. No obligation.**, **Choose a preferred appointment time**, **Request My Free Consultation**, success with actual date/time. Removed "Spots are limited", preset "Next Available", and static "Same-Week" booking claims (free-measurement + quote-booking only). Metadata/canonical unchanged. | `lib/booking/picker-model.js`, `components/booking/SlotPicker.jsx`, the 3 clients, `app/free-measurement/page.jsx` |
| B4 | "Ask for a different time" inline panel → existing `/api/contact` with source `measurement_alternate_time` and a structured message. No booking row, no calendar event, no conversion. The contact route (behaviour otherwise unchanged) now returns a persistence receipt `saved:true` + id, identity-link failure after the insert is non-fatal (it used to be a 500 that caused duplicate resubmits), no DB → 503, and 500s carry generic text. Spam still gets a fake 200 but **no receipt**, so the panel says "please call". CRM/cron/digest: no source filter excludes it (CRM shows the `[measurement alternate time]` tag; the lead-followup cron only targets `abandoned_checkout`/quote sources). | `lib/booking/alternate-time.js`, `components/booking/AlternateTimePanel.jsx`, `lib/contact/contact-handler.js`, `app/api/contact/route.js` |

## Evidence (local)
- `npm test`: see the final hand-back (UTC and Asia/Tokyo).
- B2 logic: `tests/booking/reservation.test.mjs`. Covers:
  - simultaneous create (one wins, one 409);
  - 409 sanitized options;
  - Google busy block near commit;
  - 400 / 503;
  - owner-scoped replay without email/calendar;
  - reschedule conflict keeps the original;
  - self-exclusion only;
  - admin override + legacy path;
  - cancelled bookings free their slot;
  - identical reschedule is a no-op.

  These run over an in-memory model (`tests/booking/fakes.mjs`) with a promise mutex. That is **logic, not Postgres proof**.
- B2 SQL: `projects/measurement-booking/phaseB-B2-local-sql-check.mjs` → `phaseB-B2-local-sql-evidence.json`. Real PostgreSQL 18.3 via PGlite, synthetic rows. Covers:
  - intervals, including a **384-case JS↔SQL parity sweep** over both 2026 DST transition days;
  - overlap, cap, replay, dedupe, reschedule conflict/self/stale, cancelled rows;
  - role privileges (anon/authenticated denied, service_role allowed);
  - down + re-apply.
- B3/B4: `tests/booking/phaseb-ui.test.mjs`. Covers the picker model, copy (no scarcity words), dates, failure mapping, the alternate builder/receipt, the **real** `/api/contact` core (fake Supabase), and UI source guards.

## Explicitly unproven / external checks (none executed)
1. **Concurrent sessions against real Postgres.** PGlite is single-connection and ran sequentially, so it proves the SQL logic, **not** the advisory-lock behaviour under simultaneous sessions. Needs a Supabase branch (Abram's OK: new environment) or any real local Postgres server (none on this host). Suggested check: two sessions each call `booking_reserve_create` for overlapping slots inside `begin … pg_sleep(2) … commit`; expect exactly one `created`.
2. **Supabase specifics:** PostgREST `rpc()` argument names/shape, the `service_role` grant, RLS on `booking_idempotency`, and `jsonb_populate_record` against the real `bookings` column types. Apply both drafts on a Supabase branch.
3. **Preview (hydrated browser):** picker behaviour on mobile/keyboard/screen reader; 409 flow keeps contact details; the alternate panel inside the booking `<form>` never submits it; ET labels under a non-Toronto browser time zone; the manage-page reschedule with a token.
4. **Launch settings still undecided (exposed, not decided here):**
   - which calendars block measurement time (`BOOKING_AVAILABILITY_CALENDAR_IDS`; none are read until it is set);
   - visit duration (default 60) and buffer (default 0);
   - whether 5 PM stays;
   - daily cap (default none);
   - **single measurement resource**: one lock for everything. This is provisional; a second crew needs a per-resource lock.
   - Numeric scarcity stays OFF.
5. **Residuals by design:**
   - Google and Postgres cannot share a transaction: a manual Google edit between the fresh check and the commit is not caught (confirmation stays manual).
   - An idempotency replay returns the original booking even if the retry picked another slot (double-click semantics).
   - Admin off-policy reschedules skip the Google freshness check (DB occupancy is still enforced) and are logged.
   - Before the B2 migration, create/reschedule **fail closed (503)**. Rollout order: Phase A migration → B2 migration → deploy.
   - `/api/contact` returning `.select('id')` after insert needs SELECT on `contact_leads` for the client in use (service role in production; the anon fallback would fail → 500, conservative).

## Rollout (all need Abram's OK)
Phase A rollout (runbook `README-booking-phaseA.md`) first. Then: backup → apply `20260924_booking_reservations.up.sql` → verify the functions/grants (`\df public.booking_*`, `has_function_privilege('anon', …)` = false) → deploy → a preview smoke test (one create, one conflicting create → 409, one reschedule, one alternate-time request). Rollback: deploy the pre-B2 code **first**, then `…down.sql` (it drops only the B2 objects; booking rows are untouched).

## Review checklist
- [ ] RPC SQL: lock scope, overlap/cap, dedupe semantics, CAS, privileges, search_path, dynamic column list (only existing `bookings` columns; `id` excluded from updates)
- [ ] JS: no non-atomic fallback path; 400/409/503 bodies contain no PII/calendar data; replay has no side effects
- [ ] Idempotency: hash includes normalised contact; a guessed key under other contact details matches nothing
- [ ] Admin override: logged, surfaced (`policyOverride:true`), occupancy still enforced
- [ ] Picker: 3 + See more, no scarcity, ET, stale time cleared, no calendar-nav form submit
- [ ] Copy: truthful; no sample/quote/discount/visit-length promises added
- [ ] Alternate time: no booking/conversion; success only on `saved:true`; duplicate-submit guard; form kept on failure
- [ ] Contact route: other sources unchanged apart from the receipt, the non-fatal identity step and generic errors
