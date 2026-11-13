-- Automated follow-up opt-outs (CASL unsubscribe) for the lead-followup cron.
-- One row per lower-cased email. Any row = never auto-email that address again.
create table if not exists public.email_suppressions (
  email       text primary key,
  reason      text not null default 'unsubscribe',
  source      text,
  created_at  timestamptz not null default now()
);
alter table public.email_suppressions enable row level security;
-- service role only (cron + unsubscribe route use the admin client); no anon policies on purpose.
