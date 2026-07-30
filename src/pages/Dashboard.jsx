import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import StatCard from '../components/StatCard'
import HoursPieChart from '../components/HoursPieChart'
import PersonProjectBarChart from '../components/PersonProjectBarChart'

function startOfWeek() {
  const d = new Date()
  const day = d.getDay() || 7
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day + 1)
  return d
}
function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [entriesRes, projectsRes, profilesRes] = await Promise.all([
        supabase.from('time_entries').select('*'),
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('profiles').select('*')
      ])
      setEntries(entriesRes.data || [])
      setProjects(projectsRes.data || [])
      setProfiles(profilesRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (dateFrom && e.entry_date < dateFrom) return false
      if (dateTo && e.entry_date > dateTo) return false
      if (projectFilter !== 'all' && e.project_id !== projectFilter) return false
      return true
    })
  }, [entries, dateFrom, dateTo, projectFilter])

  const projectMap = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects])
  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles])

  const byProject = useMemo(() => {
    const totals = {}
    filtered.forEach((e) => {
      totals[e.project_id] = (totals[e.project_id] || 0) + e.duration_minutes
    })
    return projects
      .filter((p) => totals[p.id])
      .map((p) => ({ name: p.name, minutes: totals[p.id], color: p.color_hex }))
  }, [filtered, projects])

  const personColors = ['#7c9eff', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7', '#ef4444', '#84cc16']

  const byPerson = useMemo(() => {
    const totals = {}
    filtered.forEach((e) => {
      totals[e.user_id] = (totals[e.user_id] || 0) + e.duration_minutes
    })
    return Object.entries(totals).map(([userId, minutes], i) => ({
      name: profileMap[userId]?.full_name || profileMap[userId]?.email || 'Unknown',
      minutes,
      color: personColors[i % personColors.length]
    }))
  }, [filtered, profileMap])

  const barRows = useMemo(() => {
    const byUser = {}
    filtered.forEach((e) => {
      const person = profileMap[e.user_id]?.full_name || profileMap[e.user_id]?.email || 'Unknown'
      const projectName = projectMap[e.project_id]?.name || 'Unknown'
      byUser[person] = byUser[person] || { person }
      byUser[person][projectName] = (byUser[person][projectName] || 0) + e.duration_minutes
    })
    return Object.values(byUser)
  }, [filtered, profileMap, projectMap])

  const totalMinutesAllTime = entries.reduce((s, e) => s + e.duration_minutes, 0)
  const weekStart = toISODate(startOfWeek())
  const monthStart = toISODate(startOfMonth())
  const totalMinutesWeek = entries
    .filter((e) => e.entry_date >= weekStart)
    .reduce((s, e) => s + e.duration_minutes, 0)
  const totalMinutesMonth = entries
    .filter((e) => e.entry_date >= monthStart)
    .reduce((s, e) => s + e.duration_minutes, 0)

  const activeProjectsCount = projects.filter((p) => p.is_active).length
  const activeMembersCount = new Set(entries.map((e) => e.user_id)).size

  const fmtH = (m) => (m / 60).toFixed(1) + 'h'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-base-100">Team Dashboard</h1>
          <p className="text-sm text-base-400 mt-1">Hours across every project and every person, in real time.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6 card p-4">
        <div>
          <div className="label-eyebrow mb-1">From</div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 focus:border-accent outline-none"
          />
        </div>
        <div>
          <div className="label-eyebrow mb-1">To</div>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 focus:border-accent outline-none"
          />
        </div>
        <div>
          <div className="label-eyebrow mb-1">Project</div>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 focus:border-accent outline-none"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {(dateFrom || dateTo || projectFilter !== 'all') && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setProjectFilter('all') }}
            className="text-xs text-base-400 hover:text-accent transition-colors px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total hours (all-time)" value={fmtH(totalMinutesAllTime)} />
        <StatCard label="Hours this week" value={fmtH(totalMinutesWeek)} />
        <StatCard label="Hours this month" value={fmtH(totalMinutesMonth)} />
        <StatCard label="Active members / projects" value={`${activeMembersCount} / ${activeProjectsCount}`} />
      </div>

      {loading ? (
        <div className="text-sm text-base-400 font-mono">loading data…</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <HoursPieChart title="Hours by project" data={byProject} />
            <HoursPieChart title="Hours by person" data={byPerson} />
          </div>
          <PersonProjectBarChart rows={barRows} projects={projects} />
        </>
      )}
    </div>
  )
}
