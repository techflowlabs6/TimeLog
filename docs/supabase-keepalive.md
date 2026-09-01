# Supabase Keep-Alive & Pause Prevention Guide

## Why is this needed?
Supabase Free Tier projects automatically pause after **7 consecutive days of inactivity** (no queries or API requests). 

To prevent your TimeLog backend from pausing:
1. **In-App Automatic Daily Heartbeat**: Whenever the TimeLog web application is opened or running, it automatically executes a lightweight heartbeat ping once every 24 hours to the `system_heartbeat_logs` table.
2. **Interactive Telemetry Dashboard**: On the `/status` (System Status) page, you can monitor the real-time keepalive health and trigger manual pings at any time with a single click.
3. **Optional Scheduled GitHub Action**: The repository includes a GitHub Action (`.github/workflows/supabase-keepalive.yml`) that runs daily at 06:00 UTC as a redundant safeguard even if nobody opens the app for weeks.

---

## 1. Running the Database Migration in Supabase
Run the following SQL in your **Supabase Dashboard -> SQL Editor**:

```sql
-- 1. Create Heartbeat Logs Table
create table if not exists public.system_heartbeat_logs (
  id uuid primary key default gen_random_uuid(),
  pinged_at timestamptz not null default now(),
  ping_date date not null default current_date,
  source text not null default 'app_heartbeat',
  status text not null default 'active',
  client_info jsonb default '{}'::jsonb,
  notes text default 'Automatic daily keepalive heartbeat'
);

-- 2. Create Indexes
create index if not exists idx_heartbeat_ping_date on public.system_heartbeat_logs (ping_date desc);
create index if not exists idx_heartbeat_pinged_at on public.system_heartbeat_logs (pinged_at desc);

-- 3. Row Level Security (RLS)
alter table public.system_heartbeat_logs enable row level security;

create policy "Allow insert heartbeats for all clients"
  on public.system_heartbeat_logs for insert
  with check (true);

create policy "Allow select heartbeats for all clients"
  on public.system_heartbeat_logs for select
  using (true);

-- 4. Auto-pruning helper (optional: keeps last 90 days of logs)
create or replace function public.prune_old_heartbeats()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.system_heartbeat_logs
  where pinged_at < now() - interval '90 days';
end;
$$;

-- 5. Seed Initial Heartbeat
insert into public.system_heartbeat_logs (source, status, notes)
values ('migration_seed', 'active', 'Initial heartbeat created during keepalive table initialization')
on conflict do nothing;
```

---

## 2. In-App Behavior
- **Frequency**: At most 1 write per calendar day per browser session.
- **Cache**: Uses `localStorage` (`timelog_keepalive_last_date`) to prevent duplicate writes during frequent page reloads.
- **Real-Time UI**: Visit `/status` to view recent heartbeat records and telemetry.
