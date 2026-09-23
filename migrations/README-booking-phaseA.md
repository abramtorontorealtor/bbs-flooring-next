# Booking Phase A: migration runbook (DRAFT, nothing applied)

Branch `feat/booking-lifecycle-phase-a`. Every step below needs **Abram's explicit OK** before anyone runs it against a real database. Schema facts come from `projects/measurement-booking/phaseA-inventory.md` §7 (read Sep 23 2026). Re-check them right before applying.

| File | What | Phase A? |
|---|---|---|
| `20260923_booking_calendar_sync.up.sql` | Adds `calendar_sync_status` (text, default `'unknown'`, CHECK unknown/pending/synced/failed/absent), `calendar_sync_error` (text), `calendar_synced_at` (timestamptz), `revision` (int not null default 0), `ownership_proof` (text, NULL), `calendar_event_proof` (text, NULL) (R15) and `calendar_op_started_at` (timestamptz, NULL) (R7). 7 columns; only `calendar_sync_status` and `revision` have defaults. No backfill. | **Yes** |
| `20260923_booking_calendar_sync.down.sql` | Drops only those 7 columns (the CHECK constraint goes with the column). | Yes (rollback) |
| `20260923_bookings_anon_insert_tighten.sql` | Drops the unused `bookings_anon_insert` (`with_check true`) RLS policy. Option B (a constrained policy) is included, commented out. | **Launch prerequisite** since fix-3 (R15, §8). Still needs Abram's explicit OK |

## 0. Pre-flight (read-only)
```sql
-- Confirm the columns don't exist yet and nothing else collides.
select column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'bookings'
order by ordinal_position;

select conname, pg_get_constraintdef(oid) from pg_constraint
where conrelid = 'public.bookings'::regclass;

select server_version();   -- expect ≥ 11 (ADD COLUMN ... DEFAULT is metadata-only)
```
Stop if any of the 7 columns or `bookings_calendar_sync_status_check` already exist with a different definition.

## 1. Backup (right before applying): private only (red-team R17)
a) Row count plus a fingerprint, so you can prove afterwards that no booking changed:
```sql
select count(*) as n,
       md5(string_agg(id::text || ':' || coalesce(status,'') || ':' || coalesce(preferred_date,'') || ':' ||
                      coalesce(preferred_time,'') || ':' || coalesce(calendar_event_id,'') || ':' ||
                      coalesce(updated_at::text,''), ',' order by id)) as fingerprint
from public.bookings;
```
b) A full copy **outside any API-exposed schema**. The table holds names, addresses, phone numbers, lookup tokens and calendar ids.
- Preferred: client-side CSV on the operator box, owner-only permissions:
  ```bash
  umask 077
  psql "$DB_URL" -c "\copy (select * from public.bookings order by created_at) to 'bookings_backup_20260923.csv' with csv header"
  chmod 600 bookings_backup_20260923.csv   # never commit, never upload; shred once the release is verified
  ```
- Only if an in-DB copy is required: a **private** schema with no grants to `anon`/`authenticated`, created and locked down in ONE transaction (nothing exposed at commit):
  ```sql
  begin;
  create schema if not exists backup_private;
  revoke all on schema backup_private from public, anon, authenticated;
  create table backup_private.bookings_20260923 as select * from public.bookings;
  revoke all on backup_private.bookings_20260923 from public, anon, authenticated;
  commit;
  -- verify: select has_table_privilege('anon','backup_private.bookings_20260923','select'); -- false
  ```
  Never `create table public.… as select`. CTAS in `public` inherits no RLS and may be readable through the REST API. Drop the copy once the release is verified.

## 2. Apply order / controlled cutover (red-team R10, R11, R12, R15)
**Full revision mode is REQUIRED for launch (R11).** Legacy mode guards on `updated_at`+`status`, which is not DB-monotonic. It records no sync failures, stores no ownership proofs (so customer calendar changes fail closed) and no in-flight marker. `auto`/`legacy` exist only for emergency rollback.

Old (pre-Phase-A) deployments write `calendar_event_id` and `status` without any guard and create random-id events (R12). Mixed old/new instances cannot be fenced by row CAS. So the cutover is a **short controlled window**, not a rolling mix:

1. Take the private backup (§1) and the fingerprint (§1a). Snapshot `pg_policies` for `bookings`.
2. Review the anon-insert logs, then apply `20260923_bookings_anon_insert_tighten.sql` (§8, launch prerequisite). Old code does not use the anon insert, so this is safe first.
3. Run `20260923_booking_calendar_sync.up.sql` (additive; old code keeps working). Verify:
   ```sql
   select calendar_sync_status, count(*), min(revision), max(revision),
          count(ownership_proof) as proofs, count(calendar_op_started_at) as markers
   from public.bookings group by 1;   -- expect ('unknown', n, 0, 0, 0, 0)
   ```
   Re-run the §1a fingerprint. It must be identical.
4. Set env in Vercel **before** the deploy: `BOOKING_STORE_MODE=full`, `BOOKING_OWNERSHIP_SECRET` (≥32 random chars, server-only), `SUPABASE_SERVICE_ROLE_KEY` present.
5. Quiet window (e.g. late evening, no booking form traffic expected). Deploy Phase A and promote only after the preview checks (see `phaseA-verification-harness.md`). Vercel routes new requests to the new deployment. Old instances can still finish requests already in flight, so wait for the function max duration (verify it in the Vercel project; do not assume 10 s) before step 6.
6. Run the §7 non-canonical status query and the §8 unverified-row list. Triage per row (verify / retry) with Abram. No bulk trust, no bulk repair.
7. Smoke check (Abram OK): one admin `retry_sync` on a test booking returns `calendarSync` without `recorded:false`.

Do **not** deploy first and migrate later (that runs the new flow in legacy mode, R10).

## 3. Rollback (red-team R12: what you actually get back)
- **Code rollback reintroduces the known baseline defects:** false success on a failed insert, customer actions that never touch Calendar, admin cancel clearing the id without a confirmed delete, and the CRM writing booking status directly. Roll back only for a Phase A defect worse than those, and prefer a forward fix.
- **Code only:** revert the deploy. The old code ignores the new columns (their defaults keep old inserts valid). Rows written by Phase A keep their proofs and markers; if you later redeploy Phase A they are still valid, **if** `BOOKING_OWNERSHIP_SECRET` is unchanged.
- **Anon-insert policy:** re-create it only if a real consumer broke, using the snapshot: `create policy bookings_anon_insert on public.bookings as permissive for insert to public with check (true);`. This reopens R15, so Phase A code must not be live at the same time.
- **Schema:** switch `BOOKING_STORE_MODE` off `full` and redeploy **first**, then run the down migration. It drops the 7 columns, which loses sync state, revision, ownership proofs (all rows become unverified again) and in-flight markers. Check `select count(*) from bookings where calendar_op_started_at is not null` first: those rows have an unresolved Google create. Resolve them (Retry) before dropping.
- **Data restore:** only if something other than these columns changed. Compare against the §1a fingerprint and restore single rows from the private §1b copy.

## 4. `bookings_anon_insert`: LAUNCH PREREQUISITE (R15, see §8)
Snapshot the policy before any change:
```sql
select policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename = 'bookings';
```
Grep (Sep 23): nothing in app/, components/, lib/, scripts/ or public/ inserts into `bookings` as anon. The only insert is the service-role `lifecycle.create()`. Details and rationale are in the SQL header. The draft's rollback needs the original `roles` value from this snapshot.

## 5. Store mode (tolerant → revision CAS)
`lib/booking/supabase-store.js`, `createSupabaseBookingStore(supabase, { mode })`. Mode comes from `opts.mode`, then the env var `BOOKING_STORE_MODE`, then `auto`.

| Mode | Writes sync columns | CAS guard | On missing column |
|---|---|---|---|
| `auto` (default) | yes, until the first PGRST204/42703 | revision + updated_at, or updated_at + status in legacy | switches that store instance to legacy. Stores are built per request, so every request re-probes: this is **not** sticky per process (R18) |
| `full` | yes | `revision` (`is null or = 0` for pre-migration rows) **and** `updated_at` | returns the error, which the lifecycle reports as `db_error` |
| `legacy` | never (sync-only writes become a guarded read → `persisted:false` / `calendarSync.recorded:false`) | `updated_at` + `status` | n/a |

In full mode the guard also checks `updated_at`. During a rolling deploy, an old or legacy-mode instance bumps `updated_at` but not `revision`, so without that check its writes would not register as conflicts. `send-followup` writes only `next_follow_up_date` and bumps neither, so it never conflicts. Tests: `tests/booking/supabase-store.test.mjs` runs both schemas under auto/full/legacy, including a lifecycle end-to-end run over the real adapter.

## 6. Calendar handle fencing (red-team R7/R8, fix-2): no schema change
No new column is needed. The existing `calendar_event_id` carries the extra meaning:

- **Cancelled rows can keep a legacy `calendar_event_id`** on purpose, as a tombstone. Before Phase A a cancel cleared it. Now a Google-assigned (pre-Phase-A) id stays on the row after cancellation, so a later Retry still deletes it if a delayed request restored it. A stable `bbs…` id is always derivable from the booking UUID, so it is still cleared.
- Every cancellation / Retry on a cancelled row deletes **all** candidates: the stored id, the derived stable id, and any id that request restored or created. It reports `absent` only when each one answers 2xx or 404/410.
- Stored ids are PATCHed **without** `status:'confirmed'`. A restore is sent only when Google says the event is cancelled **and** a re-read shows the booking still live at the same revision.
- A Google change whose sync-state write then fails reports `calendarSync.status:'failed'` (red badge + Retry), never `synced`.

Reports or scripts that treat "cancelled with a `calendar_event_id`" as a leaked event must check the event in Google instead. Residual window: if the sync budget runs out between a restore and its CAS re-read, the row is recorded `failed`, and the admin's Retry deletes every candidate.

## 7. Non-canonical booking statuses (red-team R14, fix-2): READ-ONLY audit, no repair
Before fix-2, the CRM's generic lead writer could set `bookings.status` to lead-pipeline values (`contacted`, `quoted`, `booked`, `lost`, …) from follow-up ✅ Done, LeadPlaybook outcomes and the lead buttons. It now logs those outcomes to `lead_follow_ups` (via `/api/admin/send-followup`, `skipEmail`) and never writes `bookings.status` (`lib/booking/crm-followup.js`). "Completed" goes through admin-action `complete`, and confirm/cancel only through Booking Actions. **No new column** was needed. The follow-up log and `next_follow_up_date` already exist and are already read by the CRM history panel.

Rows written before the fix may still hold such statuses. The lifecycle now skips them (`skipped/unrecognised_status`, no Google call, no deletion, fix-1), so they are safe but stuck: Confirm/Reschedule/Cancel still work on them, but Retry does nothing. Run this **read-only** query (do NOT run any UPDATE from it) and review the result with Abram:
```sql
-- READ-ONLY. Bookings whose status is not one of the four lifecycle states.
select id, status, preferred_date, preferred_time, calendar_event_id,
       next_follow_up_date, updated_at, created_at,
       left(coalesce(notes, ''), 120) as notes_head,
       (select count(*) from public.lead_follow_ups f
         where f.lead_source = 'booking' and f.lead_id = b.id) as follow_up_logs
from public.bookings b
where status is null
   or status not in ('pending', 'confirmed', 'cancelled', 'completed')
order by preferred_date nulls last, created_at;

-- Summary by value:
select coalesce(status, '<null>') as status, count(*)
from public.bookings
where status is null or status not in ('pending', 'confirmed', 'cancelled', 'completed')
group by 1 order by 2 desc;
```
**Proposed handling (per row, human decision, no bulk repair):**
- `contacted` / `quoted` / `booked` / `new` / null with a **future** `preferred_date` → most likely still a live appointment. Check the Google event. Restore the real state through the lifecycle (Confirm in the CRM if it was confirmed; leave it for a manual single-row decision if it was pending). The CRM Confirm button only shows for `pending`/`new` today, so a one-off single-row `status` correction to `pending`/`confirmed` needs Abram's OK and should be followed by a Retry sync.
- Same statuses with a **past** date → was the visit done? Mark it completed via admin-action `complete`, or cancel via Booking Actions if it never happened (the cancel emails the customer, so decide first).
- `lost` → the lead was lost. If an appointment exists, cancelling is a customer-facing action: Abram decides per row.
- Record each decision in the follow-up log, not in `status`.

## 8. Calendar authority + customer token exposure (red-team R15/R16, fix-3)
**Threat.** `bookings_anon_insert` lets anyone insert a row with an id, `lookup_token` and `calendar_event_id` of their choosing. The customer token then drives the server's Google credentials. A matching token or stable id proves nothing, because the attacker picked both.

**Design (minimal, fail closed).** `lib/booking/ownership.js`: HMAC proofs keyed by the server-only env `BOOKING_OWNERSHIP_SECRET` (≥32 chars).
- `lifecycle.create()` picks the booking UUID itself and writes `ownership_proof = HMAC(row|id)`. A direct anon insert cannot produce it.
- Derived stable id (`bbs…`): Google is touched only for a proven row, or when the actor is admin/server.
- Any other stored id (legacy Google id, or whatever a forged row claims): **no Google call for any actor** without `calendar_event_proof = HMAC(event|id|eventId)`. Only the admin action `trust_calendar_event` (with the exact stored id echoed back) writes that proof.
- Blocked → `calendarSync:{status:'failed', reason:'unverified_calendar_owner'}` (red badge), never synced/absent. The DB change (e.g. the customer's cancellation) still stands and emails still go.
- No secret, or legacy store mode (proof columns stripped) → nothing verifies. Customer-driven calendar changes fail closed. Server create and admin actions on stable ids still work.
- No service-role key → booking APIs, lookup and send-followup return **503** (`getServiceClientOrNull`, no anon fallback).

**R16.** Lookup requires a valid email and ≥10 phone digits. The email is matched literally (ILIKE wildcards escaped plus an exact JS re-check). The phone must equal the stored last 10 digits, so blank stored phones never match. `lookup-token` requires a UUID. Per-IP rate limits: lookup 5/15 min, token 30/15 min, customer-action 10/15 min. All customer responses use a DTO: no calendar ids, proofs, sync errors, notes, email/phone, revision or visitor id.

**Legacy reconciliation tradeoff (no auto-trust, no backfill).** Every pre-migration row has NULL proofs. Until an admin verifies it, a customer cancelling an old booking cancels it in the DB and emails normally, but the Google event stays. The CRM then shows a red "not verified" badge. Per row: open the event in Google Calendar, check it really is this customer's appointment, then use **Verify calendar event** (sends `trust_calendar_event`) followed by **Retry**. This is the price of not trusting rows an attacker could have written. Rows are few (see the §7 query / `select count(*) from bookings where status in ('pending','confirmed') and ownership_proof is null`).

**Rollout prerequisites (add to §2, all need Abram's OK):**
1. Snapshot `pg_policies`, then apply `20260923_bookings_anon_insert_tighten.sql` **before** the Phase A deploy (a live log review for unknown anon writers first). Dropping the policy stops new forged rows. It does **not** make old rows trustworthy; the proofs do that.
2. Set `BOOKING_OWNERSHIP_SECRET` (random ≥32 chars, server-only, never `NEXT_PUBLIC_`) and `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Rotating the secret un-trusts every row (they then need re-verification), so treat it like a signing key.
3. Keep `BOOKING_STORE_MODE=full`. In legacy mode proofs cannot be stored.

**Residual.** Rate limits are in-memory per serverless instance, so they are burst protection, not a global limit (a shared store like Upstash is out of scope). A leaked `lookup_token` still grants cancel/reschedule of that one real booking (the calendar change only applies to a proven row, which is intended). Lookup responses are uniform (404 on any mismatch) but not constant-time.

## 9. Delayed Google writes, ETag fencing, recovery visibility (red-team R7/R13/R19, fix-3)
**Basis.** Google Calendar "conditional modification" (developers.google.com/workspace/calendar/api/guides/version-resources): a write with `If-Match: <etag>` is refused with **412** if the event changed since that etag was read. An AbortSignal only stops *our* wait. A request Google already received may still commit afterwards, so an abort never proves anything.

**Design.**
- Every PATCH of an existing event is `GET` → `PATCH If-Match`. A restore (`status:'confirmed'`) is sent only after a re-read shows the booking is still live at the same revision, and it is also etag-conditional. A 412 → re-read and reconcile the latest row.
- Cancellation = DELETE, then a **fenced tombstone** (`PATCH {status:'cancelled', extendedProperties.private.bbs_fence:<fresh nonce>}`) on anything that exists. The nonce guarantees the resource changes even when it was already cancelled (a same-value PATCH is not documented to move the etag). Every PATCH is also refused locally when a GET returned no etag (never an unconditional write). The event changes, so its etag moves and every in-flight conditional write holding an older etag gets 412, including one committed after our abort. The tombstone is the last write, so it also overrides a conditional write that landed just before it. This does not rely on "a plain PATCH cannot resurrect" or on DELETE itself moving the etag.
- Inserts cannot be conditional, and **Google does not guarantee id-collision detection at creation time** (events.insert `id` field: "Due to the globally distributed nature of the system, we cannot guarantee that ID collisions will be detected at event creation time."). So no observation proves that an uncertain insert (timeout / abort / 5xx / process death) can never land later. Design:
  - Before every insert, the attempt writes its own unique token to `calendar_op_started_at` (claim-if-NULL, else overwrite; either way CAS on the booking revision: if the booking changed, no insert).
  - The token is cleared automatically **only** by the attempt that claimed it from NULL, after its **own** insert got a definite answer, and only if the marker still holds its token. A later or concurrent attempt's failure, definite or not, never clears an earlier uncertainty. Neither does time.
  - While a marker is set, cancel/Retry still sweeps every handle (delete + fence, and reserves a 404 stable id as best effort), but reports **failed** (`uncertain_calendar_create`), never absent/synced.
  - Resolution is explicit and human: the CRM **Resolve uncertain calendar create** button (admin action `resolve_calendar_uncertainty`, echoes the exact marker value; a newer attempt's marker is not cleared). The admin first searches Google Calendar for the customer and deletes any live event, then Resolve, then Retry → absent.
- Timeouts, aborts, network errors and 5xx are **ambiguous**. They are recorded `failed` (red + Retry), never synced/absent.
- R13: exhausted reconciliation passes record a durable `failed` ("press Retry"). There is **no** promise of automatic sync, because no worker exists. The CRM offers Retry for `failed`, for `pending`/`unknown` on live rows, and for cancelled rows with something to recover (stored id, in-flight marker, unfinished cancel).
- R19: the CRM stamps each cached admin-action response with `{receivedAt, revision}`. It is ignored once the bookings list was refetched after it, or the row's revision moved on, so the newest durable state always wins.

**Residual (honest distributed boundary).**
- No worker: convergence after an ambiguous outcome needs an admin Retry. The row stays red/amber until then, never green.
- **Provider-contract limitation (needs an explicit acceptance decision):** after an uncertain insert, a delayed copy may land even after a Retry/Resolve, because Google does not promise collision detection. Phase A does not claim otherwise. Mitigation: the booking stays red until an admin has checked Google Calendar and resolved it, and every later Retry on a cancelled booking still deletes the stable id. Once an admin has resolved it, a copy landing even later is not detected automatically (no worker).
- Sandbox checks (412 on a stale If-Match, PATCH merging `extendedProperties.private`, the fence moving the etag of an already-cancelled event, 409 on re-insert) validate the conditional-write fencing. They do **not** prove that an uncertain insert cannot land; finite tests cannot establish that.
- A restore or tombstone whose own call times out stays `failed` → Retry.
- An event edited by hand in Google changes its etag. Our next conditional write gets 412, re-reads, and re-applies the booking state, which overwrites the manual edit (same as before Phase A).
- Legacy schema cannot store the marker; full mode is required (§2).

## 10. Notification ordering and duplicate transitions (red-team R5/R6, fix-4)
- **R6:** confirming an already-confirmed booking, or rescheduling to the identical date+time+status, is a no-op: no revision bump, no email. The response carries `unchanged:true` and the CRM shows "already up to date". An explicit "resend confirmation" action is not part of Phase A.
- **R5:** right before sending a confirmation or reschedule email, the booking is re-read. If a newer change has superseded this one (cancelled, or rescheduled again), the email is skipped (`emailSuperseded:true`; the CRM says so). Cancellation and request-received emails always go.
- **Residual:** check-then-send is not atomic. A change that lands in the milliseconds between the re-read and the provider accepting the email can still let one obsolete email through. Full ordering needs a per-booking outbox, which is out of Phase A scope. The newest email still follows, so the customer's last message is correct.
