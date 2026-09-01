-- ============================================================
-- Migration: 0004_keepalive_heartbeat.sql
-- Purpose: Keep-Alive Heartbeat Logging System
-- Prevents Supabase Free Tier projects from pausing due to 7-day inactivity
-- ============================================================

-- 1. Create Heartbeat Logs Table
create table if not exists public.system_heartbeat_logs (
  id uuid primary key default gen_random_uuid(),
  pinged_at timestamptz not null default now(),
  ping_date date not null default current_date,
  source text not null default 'app_heartbeat', -- 'web_app', 'manual_ping', 'github_action', 'api'
  status text not null default 'active',
  client_info jsonb default '{}'::jsonb,
  notes text default 'Automatic daily keepalive heartbeat'
);

-- 2. Create Indexes for Quick Retrieval & Daily Checks
create index if not exists idx_heartbeat_ping_date on public.system_heartbeat_logs (ping_date desc);
create index if not exists idx_heartbeat_pinged_at on public.system_heartbeat_logs (pinged_at desc);

-- 3. Row Level Security (RLS)
alter table public.system_heartbeat_logs enable row level security;

-- Allow insert by any authenticated user or anonymous app visitor
create policy "Allow insert heartbeats for all clients"
  on public.system_heartbeat_logs for insert
  with check (true);

-- Allow reading heartbeats for system telemetry & status checking
create policy "Allow select heartbeats for all clients"
  on public.system_heartbeat_logs for select
  using (true);

-- 4. Auto-pruning helper (keeps last 90 days of logs to keep table lightweight)
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

-- 5. Seed Initial Heartbeat Ping
insert into public.system_heartbeat_logs (source, status, notes)
values ('migration_seed', 'active', 'Initial heartbeat created during keepalive table initialization')
on conflict do nothing;
