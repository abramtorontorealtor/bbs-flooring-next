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


## Review fixes after 4d1b1cf (reviewer findings + harness-found defects)
| Finding | Fix | Evidence |
|---|---|---|
| R-B2-REPLAY (blocking): same-request retry hit the availability pre-check → false 409; replay UI showed the unsaved new time | Read-only `booking_find_replay` RPC runs **before** the pre-check (fresh 24 h owner-scoped key, or same contact + date + time within 24 h; never a cancelled booking). The reservation RPC releases stale/cancelled keys under the lock. Public create/replay responses carry the **saved** `booking.{preferred_date, preferred_time, status}` and both clients display that (a changed replay is flagged "We already have your request…"). | `tests/booking/reservation.test.mjs` R-B2-REPLAY ×5 (3 fail on 4d1b1cf); PGlite `find_replay`/key-release checks; harness replay case |
| R-B2-ADMIN: admin off-policy skipped all occupancy checks | `availability.checkInterval()` checks the exact requested interval (or whole day) against live bookings (self excluded) and opaque Google events; transparent/cancelled/booking-owned are ignored. Busy → 409, DB outage → 503, Google failure → known blocks + manual confirmation. New nonexistent admin times (spring gap) → 400. | R-B2-ADMIN ×4 (3 fail pre-fix) |
| Contact receipt could hang on optional side effects | identify / email / Telegram run under injectable wall-clock budgets (1 s / 2.5 s / 1.5 s); the receipt returns regardless | "never-settling" test (the old code never finishes) |
| SlotPicker stale 409 override stuck (unavailable) | "Try again" dismisses that override; a new 409 shows again | harness 3b (fails on 51561e2) |
| AlternateTimePanel Enter submitted the booking form; tel link Enter | Enter is intercepted only on the panel's own `<input>`s (not IME composition, links, buttons or the textarea) | harness alt + fm Enter cases (the fm one POSTed a real booking on 51561e2) |
| QuoteBookingClient crashed at render (`Clock is not defined`, introduced in B3 wiring 1633ca4) | import restored; no-undef scan over every changed file is clean | harness qb (crash on 51561e2); `phaseB-browser-evidence/harness/eslint.undef.mjs` |
| Manage page showed the reschedule error twice | page-level alert hidden while rescheduling | harness view |
| Calendar a11y / touch | nav buttons 44×44 (were 32×32); day cells min 44 px tall; `aria-pressed` instead of the invalid `aria-selected` on buttons | class change + lint |

**Touch-size truth:** day-cell **width** is `1/7` of the calendar card (about 44–46 px at 390 px viewports, less on 320 px screens). Height is ≥ 44 px. The harness does not compile Tailwind, so real rendered sizes are a preview check.

## Evidence update
- `npm test`: 244/244 (UTC and Asia/Tokyo) at d4e7212; `git diff --check e119924..HEAD` clean; scoped eslint 0 problems.
- **Native PostgreSQL concurrency: PASS**, run by the parent (PostgreSQL 16.15, synthetic production-type fixture, 26 proven advisory-lock waits incl. 20 overlapping create races, same-key/no-key dedupe, cap, cross-date reschedule, grants, rollback/reapply; rerun at d46be70 including replay). See `projects/measurement-booking/phaseB-native-pg-{review.py,evidence.json}` and `phaseB-B2-B4-review.md`. The SQL is unchanged since.
- **Isolated browser harness: 54/54** (`projects/measurement-booking/phaseB-browser-evidence/`: `results.json`, `run-fixed.log`, pre-fix run `run-prefix-51561e2.log`, harness source under `harness/`).
  - Setup: real components built with Next's own SWC, headless Chromium, fake origin; **every non-harness request aborted (0 escaped)**; `/api/*` from fixtures; clock fixed.
  - Covers: 0/1/2/3/7 slots + See more; ET across Tokyo/Los Angeles; outage + Try again; stale-409 override; keyboard-only selection; mobile 390 px; alternate panel (Enter on inputs/textarea/tel link, 500 retry, double click, receipt vs no-receipt); free-measurement 409 keeps contact + refreshed options + same idempotency key + saved slot, replay with a changed slot, double submit, 503; quote-booking alternate with quote context; manage-page reschedule with token + 409.
  - Not covered: Tailwind is not compiled, so no visual/pixel verification. Decorative components (reviews banner, gallery, breadcrumbs, analytics) are stubbed. `next/navigation` is stubbed.

## Explicitly unproven / external checks (none executed)
1. ~~Concurrent sessions against real Postgres~~: **done** by the parent on native PostgreSQL 16.15 (see Evidence update). Supabase-hosted behaviour is still item 2.
2. **Supabase specifics:** PostgREST `rpc()` argument names/shape, the `service_role` grant, RLS on `booking_idempotency`, and `jsonb_populate_record` against the real `bookings` column types. Apply both drafts on a Supabase branch.
3. **Preview (styled, real Next runtime):** behaviour is covered by the isolated harness. Still open: rendered Tailwind layout and touch sizes on real phones (320–430 px), screen-reader announcement quality, real `next/navigation`/metadata, and real email/Telegram delivery for the alternate request (disabled or pointed at test destinations).
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
   - Admin off-policy reschedules check real occupancy (R-B2-ADMIN) but not the online schedule policy (logged, `policyOverride:true`).
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
