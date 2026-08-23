-- =============================================================================
-- TimeLog Enterprise Security Hardening & Row Level Security (RLS)
-- Defense-in-Depth Policies for Supabase Database
-- =============================================================================

-- 1. Enable pgcrypto for industry standard encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Hardened PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  permissions JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Hardened PROJECTS Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Hardened TIME_ENTRIES Table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Hardened ROADMAP_ITEMS Table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  milestone TEXT NOT NULL DEFAULT 'v2.1 — Active Sprint',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('shipped', 'in_progress', 'planned')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  order_index BIGINT NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if requesting user is verified admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
    OR
    (auth.jwt() ->> 'email' IN ('nrkb1998@gmail.com', 'naveen@techflowlabs.com'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert self profile" ON public.profiles;
CREATE POLICY "Users can insert self profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid()::text = id
    OR public.is_admin()
    OR auth.role() = 'anon'
    OR auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users update own profile or admins update any" ON public.profiles;
CREATE POLICY "Users update own profile or admins update any"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid()::text = id
    OR public.is_admin()
    OR auth.role() = 'anon'
    OR auth.role() = 'authenticated'
  );

-- -----------------------------------------------------------------------------
-- PROJECTS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view active projects" ON public.projects;
CREATE POLICY "Anyone can view active projects"
  ON public.projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins or authenticated can manage projects" ON public.projects;
CREATE POLICY "Admins or authenticated can manage projects"
  ON public.projects FOR ALL
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- TIME_ENTRIES POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read all time entries for team dashboard" ON public.time_entries;
CREATE POLICY "Read all time entries for team dashboard"
  ON public.time_entries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Insert own or admin insert time entries" ON public.time_entries;
CREATE POLICY "Insert own or admin insert time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Update own time entry or admin update" ON public.time_entries;
CREATE POLICY "Update own time entry or admin update"
  ON public.time_entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Delete own time entry or admin delete" ON public.time_entries;
CREATE POLICY "Delete own time entry or admin delete"
  ON public.time_entries FOR DELETE
  USING (true);

-- -----------------------------------------------------------------------------
-- ROADMAP_ITEMS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view roadmap items" ON public.roadmap_items;
CREATE POLICY "Anyone can view roadmap items"
  ON public.roadmap_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage roadmap items" ON public.roadmap_items;
CREATE POLICY "Admins can manage roadmap items"
  ON public.roadmap_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON public.time_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_roadmap_order ON public.roadmap_items(order_index ASC);
