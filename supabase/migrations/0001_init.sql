-- ============================================================
-- TimeLog: initial schema, triggers, and Row Level Security
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- 1. PROFILES ------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by any authenticated user"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Manually promote the first admin after signup, e.g.:
-- update public.profiles set role = 'admin' where email = 'you@example.com';

-- 2. PROJECTS --------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color_hex text not null default '#6366f1',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Projects are readable by any authenticated user"
  on public.projects for select
  using (auth.role() = 'authenticated');

create policy "Only admins can insert projects"
  on public.projects for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Only admins can update projects"
  on public.projects for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Only admins can delete projects"
  on public.projects for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 3. TIME ENTRIES ------------------------------------------------
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  entry_date date not null default current_date,
  start_time time,
  end_time time,
  duration_minutes integer not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.time_entries enable row level security;

create policy "Time entries are readable by any authenticated user"
  on public.time_entries for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own time entries"
  on public.time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own time entries"
  on public.time_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own time entries"
  on public.time_entries for delete
  using (auth.uid() = user_id);

-- Helpful index for dashboard filtering
create index if not exists time_entries_date_idx on public.time_entries (entry_date);
create index if not exists time_entries_project_idx on public.time_entries (project_id);
create index if not exists time_entries_user_idx on public.time_entries (user_id);

-- 4. SEED 5 STARTER PROJECTS (edit names/colors as needed) -------
insert into public.projects (name, color_hex) values
  ('Project Alpha', '#6366f1'),
  ('Project Beta', '#22c55e'),
  ('Project Gamma', '#f59e0b'),
  ('Project Delta', '#ec4899'),
  ('Project Epsilon', '#06b6d4')
on conflict do nothing;
