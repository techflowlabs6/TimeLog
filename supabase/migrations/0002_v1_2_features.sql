-- ============================================================
-- TimeLog v1.2: Per-project budgets + Audit log
-- Run this in the Supabase SQL editor after 0001_init.sql
-- ============================================================

-- 1. Add hour_budget_minutes column to projects (nullable = no budget set)
alter table public.projects
  add column if not exists hour_budget_minutes integer;

-- 2. AUDIT LOG TABLE
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "Only admins can read audit log"
  on public.audit_log for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Authenticated users can insert audit entries"
  on public.audit_log for insert
  with check (auth.role() = 'authenticated');

-- 3. AUDIT TRIGGER FUNCTION for time_entries
create or replace function public.audit_time_entry_changes()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.audit_log (actor_id, action, table_name, record_id, old_data, new_data)
    values (NEW.user_id, 'insert', 'time_entries', NEW.id, null, to_jsonb(NEW));
  elsif TG_OP = 'UPDATE' then
    insert into public.audit_log (actor_id, action, table_name, record_id, old_data, new_data)
    values (NEW.user_id, 'update', 'time_entries', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  elsif TG_OP = 'DELETE' then
    insert into public.audit_log (actor_id, action, table_name, record_id, old_data, new_data)
    values (OLD.user_id, 'delete', 'time_entries', OLD.id, to_jsonb(OLD), null);
  end if;
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists time_entries_audit_trigger on public.time_entries;
create trigger time_entries_audit_trigger
  after insert or update or delete on public.time_entries
  for each row execute procedure public.audit_time_entry_changes();

-- 4. Indexes for audit log
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_idx on public.audit_log (actor_id);
create index if not exists audit_log_record_idx on public.audit_log (record_id);
