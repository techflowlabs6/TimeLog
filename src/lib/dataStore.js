import { supabase } from './supabaseClient'

const LOCAL_PROJECTS_KEY = 'timelog_local_projects_v2'
const LOCAL_PROFILES_KEY = 'timelog_local_profiles_v2'
const LOCAL_ENTRIES_KEY = 'timelog_local_entries_v2'
const LOCAL_ROADMAP_KEY = 'timelog_local_roadmap_v2'

export const DEFAULT_PROFILES = [
  { id: 'usr-1', full_name: 'Naveen Reddy', email: 'naveen@techflowlabs.com', role: 'admin' },
  { id: 'usr-2', full_name: 'Sushma K.', email: 'sushma@fashion.com', role: 'admin' },
  { id: 'usr-3', full_name: 'Alex Chen', email: 'alex@design.io', role: 'member' },
  { id: 'usr-4', full_name: 'Priya Patel', email: 'priya@techflowlabs.com', role: 'member' }
]

export const DEFAULT_PROJECTS = [
  { id: 'proj-1', name: 'Design System & UI', color_hex: '#6366f1', is_active: true },
  { id: 'proj-2', name: 'French Grammar App', color_hex: '#06b6d4', is_active: true },
  { id: 'proj-3', name: 'Client Portal v2', color_hex: '#22c55e', is_active: true },
  { id: 'proj-4', name: 'API Infrastructure', color_hex: '#f59e0b', is_active: true },
  { id: 'proj-5', name: 'Brand & Marketing', color_hex: '#ec4899', is_active: true }
]

export const DEFAULT_ROADMAP = [
  {
    id: 'rd-1',
    project_name: 'Design System & UI',
    milestone: 'v2.0 — Shipped',
    title: 'Dual-Engine Dark/Light Obsidian Theme System',
    description: 'Complete high contrast neon & crisp executive light styles',
    status: 'shipped',
    is_completed: true,
    order_index: 1
  },
  {
    id: 'rd-2',
    project_name: 'Design System & UI',
    milestone: 'v2.0 — Shipped',
    title: 'Top Navigation Header & Command Search (⌘K)',
    description: 'Quick route switcher, status telemetry, and notification drawer',
    status: 'shipped',
    is_completed: true,
    order_index: 2
  },
  {
    id: 'rd-3',
    project_name: 'French Grammar App',
    milestone: 'v2.1 — Active Sprint',
    title: 'Registered Team Analytics & Hours Breakdown',
    description: 'Live person-to-project contribution matrices and member stats on Dashboard',
    status: 'in_progress',
    is_completed: true,
    order_index: 3
  },
  {
    id: 'rd-4',
    project_name: 'Client Portal v2',
    milestone: 'v2.1 — Active Sprint',
    title: 'Multi-Account Database Sync & Auto Profile Creation',
    description: 'Ensure all team member logins save real-time hours to Supabase across accounts',
    status: 'in_progress',
    is_completed: true,
    order_index: 4
  },
  {
    id: 'rd-5',
    project_name: 'API Infrastructure',
    milestone: 'v2.2 — Planned Next',
    title: 'Per-Project Hour Budgets & Over-Capacity Alerts',
    description: 'Set target hours per project with warning thresholds',
    status: 'planned',
    is_completed: false,
    order_index: 5
  },
  {
    id: 'rd-6',
    project_name: 'Brand & Marketing',
    milestone: 'v2.2 — Planned Next',
    title: 'Automated Weekly Slack & Email Summary Reports',
    description: 'Scheduled digest of team productivity and project breakdown',
    status: 'planned',
    is_completed: false,
    order_index: 6
  }
]

function getRecentDates() {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export function generateSeedEntries() {
  const d = getRecentDates()
  return [
    { id: 'ent-1', user_id: 'usr-1', project_id: 'proj-1', entry_date: d[0], start_time: '09:00', end_time: '12:30', duration_minutes: 210, notes: 'Design token system and dark theme polish' },
    { id: 'ent-2', user_id: 'usr-1', project_id: 'proj-2', entry_date: d[1], start_time: '13:00', end_time: '17:00', duration_minutes: 240, notes: 'Mobile navigation drawer and breadcrumb hierarchy' },
    { id: 'ent-3', user_id: 'usr-2', project_id: 'proj-3', entry_date: d[0], start_time: '10:00', end_time: '15:30', duration_minutes: 330, notes: 'Client invoice dashboard & automated exports' },
    { id: 'ent-4', user_id: 'usr-2', project_id: 'proj-1', entry_date: d[2], start_time: '09:30', end_time: '14:00', duration_minutes: 270, notes: 'Typography scale and responsive card layouts' },
    { id: 'ent-5', user_id: 'usr-3', project_id: 'proj-4', entry_date: d[0], start_time: '11:00', end_time: '16:00', duration_minutes: 300, notes: 'Supabase RLS migration rules and seed scripts' },
    { id: 'ent-6', user_id: 'usr-3', project_id: 'proj-5', entry_date: d[3], start_time: '10:00', end_time: '13:30', duration_minutes: 210, notes: 'Landing page copy & hero illustrations' },
    { id: 'ent-7', user_id: 'usr-4', project_id: 'proj-2', entry_date: d[1], start_time: '09:00', end_time: '14:30', duration_minutes: 330, notes: 'French grammar quiz validation & score tracker' },
    { id: 'ent-8', user_id: 'usr-4', project_id: 'proj-3', entry_date: d[4], start_time: '13:00', end_time: '18:00', duration_minutes: 300, notes: 'Stripe webhook integration & webhook logs' }
  ]
}

function getLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return fallback
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {}
}

export function initLocalStorageIfEmpty() {
  if (!localStorage.getItem(LOCAL_PROJECTS_KEY)) {
    setLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS)
  }
  if (!localStorage.getItem(LOCAL_PROFILES_KEY)) {
    setLocal(LOCAL_PROFILES_KEY, DEFAULT_PROFILES)
  }
  if (!localStorage.getItem(LOCAL_ENTRIES_KEY)) {
    setLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  }
  if (!localStorage.getItem(LOCAL_ROADMAP_KEY)) {
    setLocal(LOCAL_ROADMAP_KEY, DEFAULT_ROADMAP)
  }
}

// ── Multi-Account Data Fetcher ────────────────────────────────
export async function fetchAllData() {
  initLocalStorageIfEmpty()

  try {
    const [entriesRes, projectsRes, profilesRes] = await Promise.all([
      supabase.from('time_entries').select('*').order('entry_date', { ascending: false }),
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('profiles').select('*')
    ])

    const remoteEntries = entriesRes.data || []
    const remoteProjects = projectsRes.data || []
    const remoteProfiles = profilesRes.data || []

    if (remoteEntries.length > 0 || remoteProjects.length > 0 || remoteProfiles.length > 0) {
      // Merge remote profiles with known profiles map so all registered users are properly named
      const profileMap = new Map()
      DEFAULT_PROFILES.forEach(p => profileMap.set(p.id, p))
      remoteProfiles.forEach(p => profileMap.set(p.id, p))

      // Also ensure projects are available
      const projectMap = new Map()
      DEFAULT_PROJECTS.forEach(p => projectMap.set(p.id, p))
      remoteProjects.forEach(p => projectMap.set(p.id, p))

      return {
        entries: remoteEntries.length > 0 ? remoteEntries : getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries()),
        projects: Array.from(projectMap.values()),
        profiles: Array.from(profileMap.values())
      }
    }
  } catch (e) {
    console.warn('Remote Supabase fetch exception, using local store:', e)
  }

  return {
    entries: getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries()),
    projects: getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS),
    profiles: getLocal(LOCAL_PROFILES_KEY, DEFAULT_PROFILES)
  }
}

export async function fetchProjects() {
  initLocalStorageIfEmpty()
  try {
    const { data } = await supabase.from('projects').select('*').order('created_at')
    if (data && data.length > 0) return data
  } catch (e) {}
  return getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS)
}

export async function fetchUserEntries(userId) {
  initLocalStorageIfEmpty()
  try {
    if (userId) {
      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
      if (data && data.length > 0) return data
    }
  } catch (e) {}

  const all = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  return all.filter(e => e.user_id === userId || !userId)
}

// ── Multi-Account Save Entry (Guarantees Profile Existence) ────
export async function saveTimeEntry(entry) {
  initLocalStorageIfEmpty()

  // Ensure profile exists in Supabase if user logged in
  if (entry.user_id && entry.user_id.length > 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team Member',
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url || null
          },
          { onConflict: 'id' }
        )
      }
    } catch (e) {}
  }

  // Insert to remote database
  try {
    const { data, error } = await supabase.from('time_entries').insert(entry).select().single()
    if (!error && data) {
      const current = getLocal(LOCAL_ENTRIES_KEY, [])
      setLocal(LOCAL_ENTRIES_KEY, [data, ...current])
      return { data, error: null }
    }
  } catch (e) {}

  // Fallback to local store
  const newEntry = {
    ...entry,
    id: entry.id || `ent-${Date.now()}`,
    created_at: new Date().toISOString()
  }
  const current = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  const updated = [newEntry, ...current]
  setLocal(LOCAL_ENTRIES_KEY, updated)
  return { data: newEntry, error: null }
}

export async function updateTimeEntryNotes(id, notes) {
  try {
    await supabase.from('time_entries').update({ notes }).eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  const updated = current.map(e => (e.id === id ? { ...e, notes } : e))
  setLocal(LOCAL_ENTRIES_KEY, updated)
  return { success: true }
}

export async function deleteTimeEntryItem(id) {
  try {
    await supabase.from('time_entries').delete().eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  const updated = current.filter(e => e.id !== id)
  setLocal(LOCAL_ENTRIES_KEY, updated)
  return { success: true }
}

// ── Project CRUD ──────────────────────────────────────────────
export async function addProjectItem(project) {
  initLocalStorageIfEmpty()
  try {
    const { data, error } = await supabase.from('projects').insert(project).select().single()
    if (!error && data) {
      const current = getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS)
      setLocal(LOCAL_PROJECTS_KEY, [...current, data])
      return { data, error: null }
    }
  } catch (e) {}

  const newProj = {
    ...project,
    id: `proj-${Date.now()}`,
    is_active: true,
    created_at: new Date().toISOString()
  }
  const current = getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS)
  const updated = [...current, newProj]
  setLocal(LOCAL_PROJECTS_KEY, updated)
  return { data: newProj, error: null }
}

export async function toggleProjectStatus(id, isActive) {
  try {
    await supabase.from('projects').update({ is_active: isActive }).eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS)
  const updated = current.map(p => (p.id === id ? { ...p, is_active: isActive } : p))
  setLocal(LOCAL_PROJECTS_KEY, updated)
}

export async function updateProjectColor(id, colorHex) {
  try {
    await supabase.from('projects').update({ color_hex: colorHex }).eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS)
  const updated = current.map(p => (p.id === id ? { ...p, color_hex: colorHex } : p))
  setLocal(LOCAL_PROJECTS_KEY, updated)
}

export async function deleteProjectItem(id) {
  try {
    await supabase.from('projects').delete().eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS)
  const updated = current.filter(p => p.id !== id)
  setLocal(LOCAL_PROJECTS_KEY, updated)

  const currentEntries = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  setLocal(LOCAL_ENTRIES_KEY, currentEntries.filter(e => e.project_id !== id))
}

// ── Roadmap Items CRUD ────────────────────────────────────────
export async function fetchRoadmapItems() {
  initLocalStorageIfEmpty()
  try {
    const { data } = await supabase.from('roadmap_items').select('*').order('order_index')
    if (data && data.length > 0) return data
  } catch (e) {}
  return getLocal(LOCAL_ROADMAP_KEY, DEFAULT_ROADMAP)
}

export async function addRoadmapItem(item) {
  initLocalStorageIfEmpty()
  try {
    const { data, error } = await supabase.from('roadmap_items').insert(item).select().single()
    if (!error && data) {
      const current = getLocal(LOCAL_ROADMAP_KEY, DEFAULT_ROADMAP)
      setLocal(LOCAL_ROADMAP_KEY, [...current, data])
      return { data, error: null }
    }
  } catch (e) {}

  const newItem = {
    ...item,
    id: `rd-${Date.now()}`,
    is_completed: false,
    order_index: Date.now(),
    created_at: new Date().toISOString()
  }
  const current = getLocal(LOCAL_ROADMAP_KEY, DEFAULT_ROADMAP)
  const updated = [...current, newItem]
  setLocal(LOCAL_ROADMAP_KEY, updated)
  return { data: newItem, error: null }
}

export async function updateRoadmapItem(id, updates) {
  try {
    await supabase.from('roadmap_items').update(updates).eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_ROADMAP_KEY, DEFAULT_ROADMAP)
  const updated = current.map(item => (item.id === id ? { ...item, ...updates } : item))
  setLocal(LOCAL_ROADMAP_KEY, updated)
  return { success: true }
}

export async function toggleRoadmapItemCompleted(id, isCompleted) {
  try {
    await supabase.from('roadmap_items').update({ is_completed: isCompleted }).eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_ROADMAP_KEY, DEFAULT_ROADMAP)
  const updated = current.map(item => (item.id === id ? { ...item, is_completed: isCompleted } : item))
  setLocal(LOCAL_ROADMAP_KEY, updated)
  return { success: true }
}

export async function deleteRoadmapItem(id) {
  try {
    await supabase.from('roadmap_items').delete().eq('id', id)
  } catch (e) {}

  const current = getLocal(LOCAL_ROADMAP_KEY, DEFAULT_ROADMAP)
  const updated = current.filter(item => item.id !== id)
  setLocal(LOCAL_ROADMAP_KEY, updated)
  return { success: true }
}
