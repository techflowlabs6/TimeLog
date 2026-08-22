import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import StatCard from '../components/StatCard'
import HoursPieChart from '../components/HoursPieChart'
import PersonProjectBarChart from '../components/PersonProjectBarChart'
import { exportToCSV } from '../lib/exportUtils'

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

  function handleExportCSV() {
    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'person', label: 'Team Member' },
      { key: 'project', label: 'Project' },
      { key: 'hours', label: 'Hours' },
      { key: 'startTime', label: 'Start Time' },
      { key: 'endTime', label: 'End Time' },
      { key: 'notes', label: 'Notes' }
    ]

    const exportRows = filtered.map((e) => ({
      date: e.entry_date,
      person: profileMap[e.user_id]?.full_name || profileMap[e.user_id]?.email || 'Unknown',
      project: projectMap[e.project_id]?.name || 'Unknown',
      hours: (e.duration_minutes / 60).toFixed(2),
      startTime: e.start_time || 'N/A',
      endTime: e.end_time || 'N/A',
      notes: e.notes || ''
    }))

    const dateStr = new Date().toISOString().slice(0, 10)
    exportToCSV(`timelog_team_report_${dateStr}`, headers, exportRows)
  }

  function setPreset(type) {
    const today = new Date()
    if (type === 'all') {
      setDateFrom('')
      setDateTo('')
    } else if (type === 'today') {
      const d = toISODate(today)
      setDateFrom(d)
      setDateTo(d)
    } else if (type === 'week') {
      setDateFrom(toISODate(startOfWeek()))
      setDateTo(toISODate(today))
    } else if (type === 'month') {
      setDateFrom(toISODate(startOfMonth()))
      setDateTo(toISODate(today))
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-base-100">Team Dashboard</h1>
          <p className="text-xs sm:text-sm text-base-400 mt-1 font-medium">Real-time team hours across every project.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-base-850 hover:bg-base-800 text-accent border border-accent/30 hover:border-accent/60 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 shadow-xs hover:shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 sm:p-5 min-w-0 overflow-hidden">
        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap pb-3.5 mb-3.5 border-b border-base-800/70">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mr-0.5">Presets:</span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-base-850 hover:bg-accent/15 hover:text-accent border border-base-700 hover:border-accent/30 text-base-300 transition-all shadow-xs active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>From</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-400">
                <svg className="w-4 h-4 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>To</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-400">
                <svg className="w-4 h-4 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
              />
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Project</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-400">
                <svg className="w-4 h-4 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full min-w-0 bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-base-100 outline-none transition-colors appearance-none cursor-pointer shadow-xs"
              >
                <option value="all">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-base-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {(dateFrom || dateTo || projectFilter !== 'all') && (
            <div className="col-span-2 sm:col-span-1">
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setProjectFilter('all') }}
                className="w-full text-xs font-semibold text-accent hover:text-accent-soft transition-colors py-2 px-3 border border-accent/25 hover:border-accent/50 rounded-xl bg-accent/10 shadow-xs"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 min-w-0">
        <StatCard
          label="Total hours"
          value={fmtH(totalMinutesAllTime)}
          sublabel="All-time tracked"
          variant="indigo"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="This week"
          value={fmtH(totalMinutesWeek)}
          sublabel="Current week"
          variant="emerald"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label="This month"
          value={fmtH(totalMinutesMonth)}
          sublabel="Current month"
          variant="sky"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Active team"
          value={`${activeMembersCount} / ${activeProjectsCount}`}
          sublabel="Members / Projects"
          variant="amber"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {loading ? (
        <div className="text-xs text-base-400 font-mono py-12 text-center card">loading metrics…</div>
      ) : (
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            <HoursPieChart title="Hours by project" data={byProject} />
            <HoursPieChart title="Hours by person" data={byPerson} />
          </div>
          <PersonProjectBarChart rows={barRows} projects={projects} />
        </div>
      )}
    </div>
  )
}
