-- ============================================================
-- TimeLog v2.0: Public Project Policies & Live Sample Data Seed
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Ensure projects are readable by anon and authenticated
drop policy if exists "Projects are readable by any authenticated user" on public.projects;
create policy "Projects are readable by all users"
  on public.projects for select
  using (true);

drop policy if exists "Profiles are readable by any authenticated user" on public.profiles;
create policy "Profiles are readable by all users"
  on public.profiles for select
  using (true);

drop policy if exists "Time entries are readable by any authenticated user" on public.time_entries;
create policy "Time entries are readable by all users"
  on public.time_entries for select
  using (true);

-- Allow authenticated users to insert/update their profiles & entries
drop policy if exists "Users can insert their own time entries" on public.time_entries;
create policy "Users can insert their own time entries"
  on public.time_entries for insert
  with check (true);

drop policy if exists "Users can update their own time entries" on public.time_entries;
create policy "Users can update their own time entries"
  on public.time_entries for update
  using (true);

drop policy if exists "Users can delete their own time entries" on public.time_entries;
create policy "Users can delete their own time entries"
  on public.time_entries for delete
  using (true);

-- 2. Seed Starter Projects
insert into public.projects (id, name, color_hex, is_active) values
  ('11111111-1111-4111-8111-111111111111', 'Design System & UI', '#6366f1', true),
  ('22222222-2222-4222-8222-222222222222', 'French Grammar App', '#06b6d4', true),
  ('33333333-3333-4333-8333-333333333333', 'Client Portal v2', '#22c55e', true),
  ('44444444-4444-4444-8444-444444444444', 'API Infrastructure', '#f59e0b', true),
  ('55555555-5555-4555-8555-555555555555', 'Brand & Marketing', '#ec4899', true)
on conflict (id) do update set name = excluded.name, color_hex = excluded.color_hex, is_active = excluded.is_active;

-- 3. Seed Starter Profiles
insert into public.profiles (id, full_name, email, role) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Naveen Reddy', 'naveen@techflowlabs.com', 'admin'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Sushma K.', 'sushma@fashion.com', 'admin'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Alex Chen', 'alex@design.io', 'member'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Priya Patel', 'priya@techflowlabs.com', 'member')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

-- 4. Seed Time Entries
insert into public.time_entries (user_id, project_id, entry_date, start_time, end_time, duration_minutes, notes) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', current_date, '09:00', '12:30', 210, 'Design token system and dark theme polish'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', current_date - 1, '13:00', '17:00', 240, 'Mobile navigation drawer and breadcrumb hierarchy'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '33333333-3333-4333-8333-333333333333', current_date, '10:00', '15:30', 330, 'Client invoice dashboard & automated exports'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '11111111-1111-4111-8111-111111111111', current_date - 2, '09:30', '14:00', 270, 'Typography scale and responsive card layouts'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '44444444-4444-4444-8444-444444444444', current_date, '11:00', '16:00', 300, 'Supabase RLS migration rules and seed scripts'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '55555555-5555-4555-8555-555555555555', current_date - 3, '10:00', '13:30', 210, 'Landing page copy & hero illustrations'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '22222222-2222-4222-8222-222222222222', current_date - 1, '09:00', '14:30', 330, 'French grammar quiz validation & score tracker'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '33333333-3333-4333-8333-333333333333', current_date - 4, '13:00', '18:00', 300, 'Stripe webhook integration & webhook logs');
