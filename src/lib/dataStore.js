import { supabase } from './supabaseClient'

const LOCAL_PROJECTS_KEY = 'timelog_local_projects_v2'
const LOCAL_PROFILES_KEY = 'timelog_local_profiles_v2'
const LOCAL_ENTRIES_KEY = 'timelog_local_entries_v2'

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

function isDevBypass() {
  if (typeof window === 'undefined') return false
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    !!localStorage.getItem('timelog_dev_session')
  )
}

// Local storage helpers
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
}

// Data operations with automatic Supabase + Local Dev fallback
export async function fetchAllData() {
  initLocalStorageIfEmpty()
  const isDev = isDevBypass()

  try {
    const [entriesRes, projectsRes, profilesRes] = await Promise.all([
      supabase.from('time_entries').select('*'),
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('profiles').select('*')
    ])

    const hasRemoteData =
      (entriesRes.data && entriesRes.data.length > 0) ||
      (projectsRes.data && projectsRes.data.length > 0)

    if (hasRemoteData && !isDev) {
      return {
        entries: entriesRes.data || [],
        projects: projectsRes.data || [],
        profiles: profilesRes.data || []
      }
    }
  } catch (e) {
    console.warn('Supabase fetch returned error, falling back to local dataset:', e)
  }

  // Fallback to local store
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
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
    if (data && data.length > 0) return data
  } catch (e) {}

  const all = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  return all.filter(e => e.user_id === userId || !userId)
}

export async function saveTimeEntry(entry) {
  initLocalStorageIfEmpty()
  // Try remote insert
  try {
    const { data, error } = await supabase.from('time_entries').insert(entry).select().single()
    if (!error && data) {
      // Also sync to local
      const current = getLocal(LOCAL_ENTRIES_KEY, [])
      setLocal(LOCAL_ENTRIES_KEY, [data, ...current])
      return { data, error: null }
    }
  } catch (e) {}

  // Local fallback
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

  // Cascade delete entries
  const currentEntries = getLocal(LOCAL_ENTRIES_KEY, generateSeedEntries())
  setLocal(LOCAL_ENTRIES_KEY, currentEntries.filter(e => e.project_id !== id))
}
