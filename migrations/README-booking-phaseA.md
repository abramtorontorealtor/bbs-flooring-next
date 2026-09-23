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

## 2. Apply order
1. Deploy the Phase A code **first**, leaving `BOOKING_STORE_MODE` unset (`auto`). Against today's schema the adapter detects the missing columns (PGRST204/42703) on first write and runs in legacy mode, with CAS on `updated_at`.
2. Take the backup (§1).
3. Run `20260923_booking_calendar_sync.up.sql`. It ends with `notify pgrst, 'reload schema'` so PostgREST sees the new columns.
4. Verify:
   ```sql
   select calendar_sync_status, count(*), min(revision), max(revision)
   from public.bookings group by 1;          -- expect only ('unknown', n, 0, 0)
   ```
   Then re-run the §1a fingerprint. It must be identical.
5. **Redeploy with the same commit** (or restart the functions). Auto mode is sticky per process: an instance that already fell back to legacy stays legacy until it restarts. New instances probe the full row, succeed, and switch to revision CAS.
6. Optional, after a clean day: set `BOOKING_STORE_MODE=full` to turn off the fallback. A missing column then surfaces as an error and is never silently downgraded.

Order does not matter for safety: auto mode works before and after the migration. Deploying code before migrating is simply the path that never has a window where the columns exist but no code uses them.

## 3. Rollback
- **Code only:** revert the deploy. The old routes ignore the new columns, and their defaults keep old-code inserts valid.
- **Schema:** if `BOOKING_STORE_MODE=full` is set, change it to `legacy` or unset it and redeploy **first**. Then run `20260923_booking_calendar_sync.down.sql`. Auto-mode instances fall back to legacy on their next write. Only sync state and revision values are lost. Bookings, statuses, dates and `calendar_event_id` are untouched.
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
| `auto` (default) | yes, until the first PGRST204/42703 | revision + updated_at, or updated_at in legacy | switches to legacy for the life of the process |
| `full` | yes | `revision` (`is null or = 0` for pre-migration rows) **and** `updated_at` | returns the error, which the lifecycle reports as `db_error` |
| `legacy` | never | `updated_at` | n/a |

In full mode the guard also checks `updated_at`. During a rolling deploy, an old or legacy-mode instance bumps `updated_at` but not `revision`, so without that check its writes would not register as conflicts. `send-followup` writes only `next_follow_up_date` and bumps neither, so it never conflicts. Tests: `tests/booking/supabase-store.test.mjs` runs both schemas under auto/full/legacy, including a lifecycle end-to-end run over the real adapter.
