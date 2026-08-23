import { supabase } from './supabaseClient'

const LOCAL_PROJECTS_KEY = 'timelog_local_projects_v2'
const LOCAL_PROFILES_KEY = 'timelog_local_profiles_v2'
const LOCAL_ENTRIES_KEY = 'timelog_local_entries_v2'
const LOCAL_ROADMAP_KEY = 'timelog_local_roadmap_v2'

export const ALL_ADMIN_PERMISSIONS = [
  { key: 'manage_projects', label: 'Project Management', description: 'Create, archive, color-tag, and delete team projects' },
  { key: 'manage_roadmap', label: 'Product Roadmap Milestones', description: 'Add new milestones, edit statuses, delete deliverables' },
  { key: 'manage_roles', label: 'Admin Role Administration', description: 'Grant or revoke admin access for any team member' },
  { key: 'view_all_analytics', label: 'Full Team Analytics', description: 'Access contributor matrices and productivity metrics' },
  { key: 'export_data', label: 'Advanced Data Export', description: 'Export full team CSV timesheet reports' },
  { key: 'edit_entries', label: 'Timesheet Moderation', description: 'Edit notes and adjust logged records across the team' }
]

export const DEFAULT_PROFILES = [
  {
    id: 'usr-1',
    full_name: 'Naveen Reddy',
    email: 'nrkb1998@gmail.com',
    role: 'admin',
    permissions: ALL_ADMIN_PERMISSIONS.map(p => p.key)
  },
  {
    id: 'usr-2',
    full_name: 'Sushma K.',
    email: 'sushma@fashion.com',
    role: 'admin',
    permissions: ALL_ADMIN_PERMISSIONS.map(p => p.key)
  },
  {
    id: 'usr-3',
    full_name: 'Alex Chen',
    email: 'alex@design.io',
    role: 'member',
    permissions: []
  },
  {
    id: 'usr-4',
    full_name: 'Priya Patel',
    email: 'priya@techflowlabs.com',
    role: 'member',
    permissions: []
  }
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

// ── Ensure Remote Database Foreign Keys Always Exist ───────────
let _syncedSupabaseSchema = false
async function ensureRemoteForeignKeys() {
  if (_syncedSupabaseSchema) return
  _syncedSupabaseSchema = true

  try {
    for (const proj of DEFAULT_PROJECTS) {
      await supabase.from('projects').upsert({
        id: proj.id,
        name: proj.name,
        color_hex: proj.color_hex,
        is_active: true
      }, { onConflict: 'id' })
    }

    for (const prof of DEFAULT_PROFILES) {
      await supabase.from('profiles').upsert({
        id: prof.id,
        full_name: prof.full_name,
        email: prof.email,
        role: prof.role,
        permissions: prof.permissions || []
      }, { onConflict: 'id' })
    }
  } catch (e) {}
}

// ── Multi-Account Data Fetcher ────────────────────────────────
export async function fetchAllData() {
  initLocalStorageIfEmpty()
  ensureRemoteForeignKeys()

  try {
    const [entriesRes, projectsRes, profilesRes] = await Promise.all([
      supabase.from('time_entries').select('*').order('entry_date', { ascending: false }),
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('profiles').select('*')
    ])

    const remoteEntries = entriesRes.data || []
    const remoteProjects = projectsRes.data || []
    const remoteProfiles = profilesRes.data || []

    const profileMap = new Map()
    DEFAULT_PROFILES.forEach(p => profileMap.set(p.id, p))
    getLocal(LOCAL_PROFILES_KEY, []).forEach(p => profileMap.set(p.id, p))
    remoteProfiles.forEach(p => profileMap.set(p.id, p))

    const projectMap = new Map()
    DEFAULT_PROJECTS.forEach(p => projectMap.set(p.id, p))
    getLocal(LOCAL_PROJECTS_KEY, []).forEach(p => projectMap.set(p.id, p))
    remoteProjects.forEach(p => projectMap.set(p.id, p))

    const entryMap = new Map()
    const fallbackSeed = generateSeedEntries()
    
    if (remoteEntries.length > 0) {
      remoteEntries.forEach(e => entryMap.set(e.id, e))
    } else {
      fallbackSeed.forEach(e => entryMap.set(e.id, e))
    }

    getLocal(LOCAL_ENTRIES_KEY, []).forEach(e => {
      if (!entryMap.has(e.id)) {
        entryMap.set(e.id, e)
      }
    })

    const finalEntries = Array.from(entryMap.values()).sort((a, b) => {
      return (b.entry_date || '').localeCompare(a.entry_date || '')
    })

    return {
      entries: finalEntries,
      projects: Array.from(projectMap.values()),
      profiles: Array.from(profileMap.values())
    }
  } catch (e) {
    console.warn('Supabase fetch exception, using local store:', e)
  }

  return {
    entries: getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries()),
    projects: getLocal(LOCAL_PROJECTS_KEY, DEFAULT_PROJECTS),
    profiles: getLocal(LOCAL_PROFILES_KEY, DEFAULT_PROFILES)
  }
}

// ── Profile Role & Permissions Management (Direct DB Persistence) ──
export async function updateUserProfileRole(userId, newRole, customPermissions = null) {
  initLocalStorageIfEmpty()

  const permissions = customPermissions || (
    newRole === 'admin' ? ALL_ADMIN_PERMISSIONS.map(p => p.key) : []
  )

  const localProfiles = getLocal(LOCAL_PROFILES_KEY, DEFAULT_PROFILES)
  const existingLocal = localProfiles.find(p => p.id === userId)

  // 1. Direct upsert to Supabase profiles table
  try {
    let remoteProfile = null
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},email.eq.${existingLocal?.email || ''}`)
        .maybeSingle()
      remoteProfile = data
    } catch (e) {}

    const targetId = remoteProfile?.id || userId
    const payload = {
      id: targetId,
      full_name: remoteProfile?.full_name || existingLocal?.full_name || 'Team Member',
      email: remoteProfile?.email || existingLocal?.email || '',
      role: newRole,
      permissions
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()

    if (!error && data) {
      const updated = localProfiles.map(p =>
        p.id === userId || p.id === targetId || (p.email && p.email === data.email)
          ? { ...p, ...data, role: newRole, permissions }
          : p
      )
      setLocal(LOCAL_PROFILES_KEY, updated)
      return { data, error: null }
    }
  } catch (e) {
    console.warn('Remote Supabase role upsert exception:', e)
  }

  // 2. Local store update fallback
  const updated = localProfiles.map(p => (p.id === userId ? { ...p, role: newRole, permissions } : p))
  setLocal(LOCAL_PROFILES_KEY, updated)

  return { data: { id: userId, role: newRole, permissions }, error: null }
}

export async function fetchProjects() {
  initLocalStorageIfEmpty()
  try {
    const { data } = await supabase.from('projects').select('*').order('created_at')
    if (data && data.length > 0) {
      const pMap = new Map()
      DEFAULT_PROJECTS.forEach(p => pMap.set(p.id, p))
      data.forEach(p => pMap.set(p.id, p))
      return Array.from(pMap.values())
    }
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

// ── Multi-Account Save Entry ──────────────────────────────────
export async function saveTimeEntry(entry) {
  initLocalStorageIfEmpty()

  if (entry.user_id) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team Member',
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: user.email === 'nrkb1998@gmail.com' ? 'admin' : 'member',
            permissions: user.email === 'nrkb1998@gmail.com' ? ALL_ADMIN_PERMISSIONS.map(p => p.key) : []
          },
          { onConflict: 'id' }
        )
      }
    } catch (e) {}
  }

  if (entry.project_id) {
    try {
      const proj = DEFAULT_PROJECTS.find(p => p.id === entry.project_id)
      if (proj) {
        await supabase.from('projects').upsert({
          id: proj.id,
          name: proj.name,
          color_hex: proj.color_hex,
          is_active: true
        }, { onConflict: 'id' })
      }
    } catch (e) {}
  }

  let savedData = null

  try {
    const { data, error } = await supabase.from('time_entries').insert(entry).select().single()
    if (!error && data) {
      savedData = data
    }
  } catch (e) {}

  const newEntry = savedData || {
    ...entry,
    id: entry.id || `ent-${Date.now()}`,
    created_at: new Date().toISOString()
  }

  const current = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  const updated = [newEntry, ...current.filter(e => e.id !== newEntry.id)]
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
    id: project.id || `proj-${Date.now()}`,
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
    is_completed: item.status === 'shipped',
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
