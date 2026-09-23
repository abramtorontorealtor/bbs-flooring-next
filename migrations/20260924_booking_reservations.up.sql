-- ============================================================================
-- DRAFT — NOT APPLIED. Phase B (measurement booking), slice B2.
-- Needs Abram's OK + backup (README-booking-phaseA.md §1) before any real DB.
-- Requires 20260923_booking_calendar_sync.up.sql (revision column) first.
--
-- Purpose: atomic server-side reservation for create + reschedule.
--   * One transaction-scoped advisory lock for the (single) measurement resource
--     serialises every reserve call, so check-overlap-then-write is atomic across
--     all dates (a reschedule touching two dates is covered by the same lock).
--   * Occupancy is computed from the authoritative text columns
--     (preferred_date / preferred_time, America/Toronto), exactly like the JS
--     availability core. No stored slot columns, so there is nothing to drift when
--     another writer changes the date. Untimed/unreadable time = the whole local day.
--   * Durable idempotency: booking_idempotency(key_hash → booking_id). The server
--     derives key_hash = sha256(owner contact ‖ client key), so a guessed key under
--     another person's contact never matches and discloses nothing.
--   * The pre-Phase-B 24 h same-contact/date/time dedupe is re-checked INSIDE the lock.
--
-- Additive only: 1 new table, 3 functions. No existing column/policy/row changes.
-- Functions are SECURITY INVOKER, EXECUTE granted to service_role only (it
-- bypasses RLS); anon/authenticated get nothing. search_path pinned.
-- Rollback: 20260924_booking_reservations.down.sql
-- ============================================================================

begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table if not exists public.booking_idempotency (
  key_hash   text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.booking_idempotency enable row level security;
-- No policies: only service_role (bypassrls) can read/write it.
revoke all on public.booking_idempotency from public, anon, authenticated;
grant select, insert, delete on public.booking_idempotency to service_role;

-- Local visit interval of a booking row, from its text columns (NULL = not a real date).
create or replace function public.booking_row_interval(p_date text, p_time text, p_duration_minutes int)
returns tstzrange
language plpgsql stable
set search_path = pg_catalog, public
as $$
declare
  m text[];
  h int;
  mi int;
  d date;
  s timestamptz;
begin
  if p_date is null or p_date !~ '^\d{4}-\d{2}-\d{2}$' then return null; end if;
  begin
    d := p_date::date;
  exception when others then
    return null;
  end;
  if to_char(d, 'YYYY-MM-DD') <> p_date then return null; end if;
  m := regexp_match(coalesce(p_time, ''), '^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$', 'i');
  if m is null then
    -- untimed / unreadable → whole local day (same as lib/booking/availability.js)
    return tstzrange((d::timestamp) at time zone 'America/Toronto',
                     ((d + 1)::timestamp) at time zone 'America/Toronto', '[)');
  end if;
  h := m[1]::int; mi := m[2]::int;
  if h < 1 or h > 12 or mi > 59 then
    return tstzrange((d::timestamp) at time zone 'America/Toronto',
                     ((d + 1)::timestamp) at time zone 'America/Toronto', '[)');
  end if;
  if upper(m[3]) = 'PM' and h <> 12 then h := h + 12; end if;
  if upper(m[3]) = 'AM' and h = 12 then h := 0; end if;
  s := (d::timestamp + make_interval(hours => h, mins => mi)) at time zone 'America/Toronto';
  return tstzrange(s, s + make_interval(mins => p_duration_minutes), '[)');
end;
$$;

-- Shared check under the lock: 'overlap' | 'cap_reached' | NULL (free).
create or replace function public.booking_slot_problem(
  p_start timestamptz, p_end timestamptz, p_local_date text,
  p_duration_minutes int, p_pad_minutes int, p_daily_cap int, p_exclude uuid)
returns text
language plpgsql stable
set search_path = pg_catalog, public
as $$
declare
  want tstzrange := tstzrange(p_start - make_interval(mins => coalesce(p_pad_minutes, 0)),
                              p_end + make_interval(mins => coalesce(p_pad_minutes, 0)), '[)');
  lo text := to_char(p_local_date::date - 1, 'YYYY-MM-DD');
  hi text := to_char(p_local_date::date + 1, 'YYYY-MM-DD');
begin
  if exists (
    select 1 from public.bookings b
    where b.status in ('pending', 'confirmed')
      and (p_exclude is null or b.id <> p_exclude)
      and b.preferred_date between lo and hi
      and public.booking_row_interval(b.preferred_date, b.preferred_time, p_duration_minutes) && want
  ) then
    return 'overlap';
  end if;
  if p_daily_cap is not null and (
    select count(*) from public.bookings b
    where b.status in ('pending', 'confirmed')
      and (p_exclude is null or b.id <> p_exclude)
      and b.preferred_date = p_local_date
  ) >= p_daily_cap then
    return 'cap_reached';
  end if;
  return null;
end;
$$;

-- Atomic create. p_row = server-built bookings row (unknown keys ignored, defaults kept).
-- Returns { outcome: 'created'|'replay'|'conflict', reason?, booking? }.
create or replace function public.booking_reserve_create(
  p_row jsonb, p_start timestamptz, p_end timestamptz, p_local_date text,
  p_duration_minutes int, p_pad_minutes int, p_daily_cap int, p_key_hash text)
returns jsonb
language plpgsql volatile
set search_path = pg_catalog, public
as $$
declare
  v_id uuid;
  v_row public.bookings;
  v_problem text;
  v_cols text;
  v_email text := lower(btrim(coalesce(p_row->>'customer_email', '')));
  v_phone text := regexp_replace(coalesce(p_row->>'customer_phone', ''), '\D', '', 'g');
begin
  perform pg_advisory_xact_lock(hashtextextended('bbs:measurement-resource', 0));

  if p_key_hash is not null then
    select k.booking_id into v_id from public.booking_idempotency k where k.key_hash = p_key_hash;
    if found then
      select * into v_row from public.bookings where id = v_id;
      return jsonb_build_object('outcome', 'replay', 'booking', to_jsonb(v_row));
    end if;
  end if;

  -- Same contact + date + time within 24 h, not cancelled (pre-Phase-B intent), now atomic.
  select * into v_row from public.bookings b
  where b.preferred_date = p_row->>'preferred_date'
    and coalesce(b.preferred_time, '') = coalesce(p_row->>'preferred_time', '')
    and b.status is distinct from 'cancelled'
    and b.created_at >= now() - interval '24 hours'
    and ((v_email <> '' and lower(btrim(coalesce(b.customer_email, ''))) = v_email)
      or (length(v_phone) >= 7 and regexp_replace(coalesce(b.customer_phone, ''), '\D', '', 'g') = v_phone))
  order by b.created_at
  limit 1;
  if found then
    if p_key_hash is not null then
      insert into public.booking_idempotency(key_hash, booking_id) values (p_key_hash, v_row.id)
      on conflict (key_hash) do nothing;
    end if;
    return jsonb_build_object('outcome', 'replay', 'booking', to_jsonb(v_row));
  end if;

  if p_start is not null then
    v_problem := public.booking_slot_problem(p_start, p_end, p_local_date,
      p_duration_minutes, p_pad_minutes, p_daily_cap, null);
    if v_problem is not null then
      return jsonb_build_object('outcome', 'conflict', 'reason', v_problem);
    end if;
  end if;

  select string_agg(quote_ident(c.column_name), ', ') into v_cols
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'bookings'
    and p_row ? c.column_name;
  execute format('insert into public.bookings (%s) select %s from jsonb_populate_record(null::public.bookings, $1) returning *',
                 v_cols, v_cols)
    using p_row into v_row;

  if p_key_hash is not null then
    insert into public.booking_idempotency(key_hash, booking_id) values (p_key_hash, v_row.id);
  end if;
  return jsonb_build_object('outcome', 'created', 'booking', to_jsonb(v_row));
end;
$$;

-- Atomic reschedule: CAS on revision, the booking's own old interval excluded, others kept.
-- Nothing is written unless the new interval is free. Returns
-- { outcome: 'updated'|'conflict'|'stale'|'not_found'|'invalid_state', reason?, booking? }.
create or replace function public.booking_reserve_reschedule(
  p_id uuid, p_expected_revision int, p_patch jsonb,
  p_start timestamptz, p_end timestamptz, p_local_date text,
  p_duration_minutes int, p_pad_minutes int, p_daily_cap int)
returns jsonb
language plpgsql volatile
set search_path = pg_catalog, public
as $$
declare
  v_row public.bookings;
  v_problem text;
  v_cols text;
begin
  perform pg_advisory_xact_lock(hashtextextended('bbs:measurement-resource', 0));
  select * into v_row from public.bookings where id = p_id for update;
  if not found then return jsonb_build_object('outcome', 'not_found'); end if;
  if coalesce(v_row.revision, 0) <> coalesce(p_expected_revision, 0) then
    return jsonb_build_object('outcome', 'stale', 'booking', to_jsonb(v_row));
  end if;
  if v_row.status not in ('pending', 'confirmed') then
    return jsonb_build_object('outcome', 'invalid_state', 'booking', to_jsonb(v_row));
  end if;
  if p_start is not null then
    v_problem := public.booking_slot_problem(p_start, p_end, p_local_date,
      p_duration_minutes, p_pad_minutes, p_daily_cap, p_id);
    if v_problem is not null then
      return jsonb_build_object('outcome', 'conflict', 'reason', v_problem);
    end if;
  end if;
  select string_agg(quote_ident(c.column_name), ', ') into v_cols
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'bookings'
    and p_patch ? c.column_name and c.column_name <> 'id';
  execute format('update public.bookings set (%s) = (select %s from jsonb_populate_record(null::public.bookings, $1)) where id = $2 returning *',
                 v_cols, v_cols)
    using p_patch, p_id into v_row;
  return jsonb_build_object('outcome', 'updated', 'booking', to_jsonb(v_row));
end;
$$;

revoke all on function public.booking_row_interval(text, text, int) from public, anon, authenticated;
revoke all on function public.booking_slot_problem(timestamptz, timestamptz, text, int, int, int, uuid) from public, anon, authenticated;
revoke all on function public.booking_reserve_create(jsonb, timestamptz, timestamptz, text, int, int, int, text) from public, anon, authenticated;
revoke all on function public.booking_reserve_reschedule(uuid, int, jsonb, timestamptz, timestamptz, text, int, int, int) from public, anon, authenticated;
grant execute on function public.booking_row_interval(text, text, int) to service_role;
grant execute on function public.booking_slot_problem(timestamptz, timestamptz, text, int, int, int, uuid) to service_role;
grant execute on function public.booking_reserve_create(jsonb, timestamptz, timestamptz, text, int, int, int, text) to service_role;
grant execute on function public.booking_reserve_reschedule(uuid, int, jsonb, timestamptz, timestamptz, text, int, int, int) to service_role;

commit;
