# Booking Phase A: migration runbook (DRAFT, nothing applied)

Branch `feat/booking-lifecycle-phase-a`. Every step below needs **Abram's explicit OK** before anyone runs it against a real database. Schema facts come from `projects/measurement-booking/phaseA-inventory.md` §7 (read Sep 23 2026). Re-check them right before applying.

| File | What | Phase A? |
|---|---|---|
| `20260923_booking_calendar_sync.up.sql` | Adds `calendar_sync_status` (text, default `'unknown'`, CHECK unknown/pending/synced/failed/absent), `calendar_sync_error` (text), `calendar_synced_at` (timestamptz), `revision` (int not null default 0), `ownership_proof` (text, NULL) and `calendar_event_proof` (text, NULL) (R15). No backfill. | **Yes** |
| `20260923_booking_calendar_sync.down.sql` | Drops only those 6 columns (the CHECK constraint goes with the column). | Yes (rollback) |
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
Stop if any of the 6 columns or `bookings_calendar_sync_status_check` already exist with a different definition.

## 1. Backup (right before applying)
a) Row count plus a fingerprint, so you can prove afterwards that no booking changed:
```sql
select count(*) as n,
       md5(string_agg(id::text || ':' || coalesce(status,'') || ':' || coalesce(preferred_date,'') || ':' ||
                      coalesce(preferred_time,'') || ':' || coalesce(calendar_event_id,'') || ':' ||
                      coalesce(updated_at::text,''), ',' order by id)) as fingerprint
from public.bookings;
```
b) A full table copy, which covers the columns that later lifecycle writes will touch (status, dates, notes, `calendar_event_id`, `updated_at`):
```sql
-- Via psql / bbs-sql.sh (client-side file):
\copy (select * from public.bookings order by created_at) to 'bookings_backup_20260923.csv' with csv header
-- or in-DB snapshot:
create table public.bookings_backup_20260923 as select * from public.bookings;
```
If you use the in-DB snapshot, drop it once the release is verified. It holds customer PII, and RLS is *not* enabled on a table created this way. Enable RLS on it or keep it only briefly.

## 2. Apply order (revised after red-team R10: schema FIRST)
**Legacy mode cannot record durable sync failures.** Without the new columns, a Google failure or timeout is not stored anywhere. The CRM gets no red "Calendar sync failed" badge and no Retry for that booking, and the API only returns `calendarSync.recorded:false` for that one response. Legacy CAS guards on `updated_at` + `status` only, which is weaker than `revision` (red-team R11). So the new booking flow must **not** go live on the pre-migration schema. Legacy/auto fallback exists only as a safety net for rollback and emergencies.

1. Take the backup (§1).
2. Run `20260923_booking_calendar_sync.up.sql` **before** deploying the Phase A code. The migration is additive with defaults, so today's production code keeps working unchanged. It ends with `notify pgrst, 'reload schema'` so PostgREST sees the new columns.
3. Verify:
   ```sql
   select calendar_sync_status, count(*), min(revision), max(revision)
   from public.bookings group by 1;          -- expect only ('unknown', n, 0, 0)
   ```
   Then re-run the §1a fingerprint. It must be identical.
4. Deploy the Phase A code with `BOOKING_STORE_MODE=full`. A missing column then surfaces as an error (`db_error`), never a silent downgrade to legacy. Before that deploy, check old booking mutations are drained. See red-team R12 for the cutover question, which is still open for the boss/Abram.
5. Smoke check (with Abram's OK): one admin `retry_sync` on a test booking returns `calendarSync` with **no** `recorded:false`.

Do **not** deploy first and migrate later. That was the earlier order, and it runs the new flow in legacy mode, where a timeout-after-create racing a cancellation had no durable trace (R10). The adapter now CAS-checks even no-op legacy writes, but that stops the event leak, not the missing failure record.

Auto-mode fallback state lives in each store instance. Today that means per request, not per process (red-team R18). With `full` pinned, that detail no longer matters for rollout.

## 3. Rollback
- **Code only:** revert the deploy. The old routes ignore the new columns, and their defaults keep old-code inserts valid.
- **Schema:** change `BOOKING_STORE_MODE=full` to `legacy` (or unset it) and redeploy **first**. Remember that legacy mode records no sync failures (§2). Then run `20260923_booking_calendar_sync.down.sql`. Auto-mode instances fall back to legacy on their next write. Only sync state and revision values are lost. Bookings, statuses, dates and `calendar_event_id` are untouched.
- **Data restore:** only needed if something other than these columns changed. Compare against the §1a fingerprint and restore rows from §1b.

## 4. `bookings_anon_insert` (NOT Phase A)
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
| `auto` (default) | yes, until the first PGRST204/42703 | revision + updated_at, or updated_at + status in legacy | switches that store instance to legacy (per request today, see R18) |
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
