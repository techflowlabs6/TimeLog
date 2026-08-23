-- ============================================================
-- TimeLog v2.1: Roadmap Table & Multi-Account Cross-Team Policies
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Ensure time_entries and profiles are readable by all authenticated and anon users
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;

-- Universal select policies so all team members can view team hours & registered profiles on the Dashboard
drop policy if exists "Allow select all profiles" on public.profiles;
create policy "Allow select all profiles" on public.profiles for select using (true);

drop policy if exists "Allow upsert profiles" on public.profiles;
create policy "Allow upsert profiles" on public.profiles for all using (true) with check (true);

drop policy if exists "Allow select all projects" on public.projects;
create policy "Allow select all projects" on public.projects for select using (true);

drop policy if exists "Allow manage projects" on public.projects;
create policy "Allow manage projects" on public.projects for all using (true) with check (true);

drop policy if exists "Allow select all time entries" on public.time_entries;
create policy "Allow select all time entries" on public.time_entries for select using (true);

drop policy if exists "Allow manage time entries" on public.time_entries;
create policy "Allow manage time entries" on public.time_entries for all using (true) with check (true);

-- 2. Create ROADMAP ITEMS table
create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  project_id text,
  project_name text not null default 'General',
  milestone text not null default 'v2.1 — Current Sprint',
  title text not null,
  description text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'shipped')),
  is_completed boolean not null default false,
  order_index integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roadmap_items enable row level security;

drop policy if exists "Allow select all roadmap items" on public.roadmap_items;
create policy "Allow select all roadmap items" on public.roadmap_items for select using (true);

drop policy if exists "Allow manage roadmap items" on public.roadmap_items;
create policy "Allow manage roadmap items" on public.roadmap_items for all using (true) with check (true);

-- 3. Seed Starter Roadmap Items
insert into public.roadmap_items (project_name, milestone, title, description, status, is_completed, order_index) values
  ('Design System & UI', 'v2.0 — Prism Aura', 'Dual-Engine Dark/Light Obsidian Theme System', 'Complete high contrast neon & crisp executive light styles', 'shipped', true, 1),
  ('Design System & UI', 'v2.0 — Prism Aura', 'Top Navigation Header & Command Search (⌘K)', 'Quick route switcher and system status telemetry', 'shipped', true, 2),
  ('French Grammar App', 'v2.1 — Multi-Account & Analytics', 'Registered Team Analytics & Hours Breakdown', 'Live person-to-project contribution matrices on Dashboard', 'in_progress', false, 3),
  ('Client Portal v2', 'v2.1 — Multi-Account & Analytics', 'Multi-Account Database Sync & Auto Profile Creation', 'Ensure all team member logins save real-time hours to Supabase', 'in_progress', true, 4),
  ('API Infrastructure', 'v2.2 — Automation & Budgets', 'Per-Project Hour Budgets & Over-Capacity Alerts', 'Set target hours per project with warning thresholds', 'planned', false, 5),
  ('Brand & Marketing', 'v2.2 — Automation & Budgets', 'Automated Weekly Slack & Email Summary Reports', 'Scheduled digest of team productivity and project breakdown', 'planned', false, 6)
on conflict do nothing;
