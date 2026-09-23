# Booking Phase A: migration runbook (DRAFT, nothing applied)

Branch `feat/booking-lifecycle-phase-a`. Every step below needs **Abram's explicit OK** before anyone runs it against a real database. Schema facts come from `projects/measurement-booking/phaseA-inventory.md` §7 (read Sep 23 2026). Re-check them right before applying.

| File | What | Phase A? |
|---|---|---|
| `20260923_booking_calendar_sync.up.sql` | Adds `calendar_sync_status` (text, default `'unknown'`, CHECK unknown/pending/synced/failed/absent), `calendar_sync_error` (text), `calendar_synced_at` (timestamptz), `revision` (int not null default 0). No backfill. | **Yes** |
| `20260923_booking_calendar_sync.down.sql` | Drops only those 4 columns (the CHECK constraint goes with the column). | Yes (rollback) |
| `20260923_bookings_anon_insert_tighten.sql` | Drops the unused `bookings_anon_insert` (`with_check true`) RLS policy. Option B (a constrained policy) is included, commented out. | **NO**, it needs Abram's separate review |

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
Stop if any of the 4 columns or `bookings_calendar_sync_status_check` already exist with a different definition.

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
**Legacy mode cannot record durable sync failures.** Without the four new columns, a Google failure or timeout is not stored anywhere. The CRM gets no red "Calendar sync failed" badge and no Retry for that booking, and the API only returns `calendarSync.recorded:false` for that one response. Legacy CAS guards on `updated_at` + `status` only, which is weaker than `revision` (red-team R11). So the new booking flow must **not** go live on the pre-migration schema. Legacy/auto fallback exists only as a safety net for rollback and emergencies.

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
