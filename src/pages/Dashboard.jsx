import { useEffect, useMemo, useState } from 'react'
import { fetchAllData } from '../lib/dataStore'
import { useToast } from '../context/ToastContext'
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
  const toast = useToast()
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')

  async function load(quiet = false) {
    if (!quiet) setLoading(true)
    const data = await fetchAllData()
    setEntries(data.entries || [])
    setProjects(data.projects || [])
    setProfiles(data.profiles || [])
    if (!quiet) setLoading(false)
  }

  useEffect(() => {
    load()
    // Auto-refresh when tab is focused or periodically every 15s to capture multi-account entries
    const interval = setInterval(() => load(true), 15000)
    window.addEventListener('focus', () => load(true))
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', () => load(true))
    }
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
      name: profileMap[userId]?.full_name || profileMap[userId]?.email || 'Unknown Member',
      minutes,
      color: personColors[i % personColors.length]
    }))
  }, [filtered, profileMap])

  const barRows = useMemo(() => {
    const byUser = {}
    filtered.forEach((e) => {
      const person = profileMap[e.user_id]?.full_name || profileMap[e.user_id]?.email || 'Unknown Member'
      const projectName = projectMap[e.project_id]?.name || 'Unknown Project'
      byUser[person] = byUser[person] || { person }
      byUser[person][projectName] = (byUser[person][projectName] || 0) + e.duration_minutes
    })
    return Object.values(byUser)
  }, [filtered, profileMap, projectMap])

  // ── Registered Member Metrics & Breakdown ───────────────────
  const memberStats = useMemo(() => {
    return profiles.map((p) => {
      const userEntries = entries.filter((e) => e.user_id === p.id)
      const userFiltered = filtered.filter((e) => e.user_id === p.id)
      const totalMinutes = userEntries.reduce((s, e) => s + e.duration_minutes, 0)
      const filteredMinutes = userFiltered.reduce((s, e) => s + e.duration_minutes, 0)
      const uniqueProjects = new Set(userEntries.map((e) => e.project_id)).size
      const lastEntry = userEntries[0]?.entry_date || 'None yet'

      return {
        ...p,
        totalHours: (totalMinutes / 60).toFixed(1),
        filteredHours: (filteredMinutes / 60).toFixed(1),
        projectsCount: uniqueProjects,
        lastActive: lastEntry,
        entriesCount: userEntries.length
      }
    }).sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours))
  }, [profiles, entries, filtered])

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
  const activeMembersCount = profiles.length || new Set(entries.map((e) => e.user_id)).size

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
    toast.success('📊 Team report exported to CSV!')
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            className="p-2.5 bg-base-850 hover:bg-base-800 text-base-300 hover:text-base-100 border border-base-700 rounded-xl text-xs font-bold transition-all shadow-xs"
            title="Refresh Live Data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
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
            <input
              type="date"
              value={dateFrom}
              onClick={(e) => e.target.showPicker?.()}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>To</span>
            </label>
            <input
              type="date"
              value={dateTo}
              onClick={(e) => e.target.showPicker?.()}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none transition-colors"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Project</span>
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none transition-colors"
            >
              <option value="all">All projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {(dateFrom || dateTo || projectFilter !== 'all') && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <button
                type="button"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                  setProjectFilter('all')
                }}
                className="w-full text-xs font-bold text-accent hover:text-accent-soft p-2 rounded-xl bg-accent/10 border border-accent/20 transition-all hover:bg-accent/20 active:scale-95"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
          loading live metrics & team hours…
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Stat Cards Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
            <StatCard
              label="Total hours"
              value={fmtH(totalMinutesAllTime)}
              sub="All-time tracked"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="This week"
              value={fmtH(totalMinutesWeek)}
              sub="Current week"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              label="This month"
              value={fmtH(totalMinutesMonth)}
              sub="Current month"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatCard
              label="Registered Team"
              value={`${activeMembersCount} / ${activeProjectsCount}`}
              sub="Members / Projects"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </div>

          {/* Weekly Team Capacity Target Tracker */}
          <div className="card p-4 sm:p-6 bg-gradient-to-br from-base-900 via-base-900/90 to-base-850 border border-base-700/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  ⚡
                </div>
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Weekly Team Workload & Pace
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Target: <strong className="text-slate-800 dark:text-slate-200">80.0h</strong> collective team capacity this week
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-extrabold text-accent">
                  {(totalMinutesWeek / 60).toFixed(1)}h
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ 80.0h</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30 ml-1">
                  {Math.min(100, Math.round(((totalMinutesWeek / 60) / 80) * 100))}%
                </span>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2.5 bg-base-800/60 rounded-full overflow-hidden p-0.5 border border-base-700/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-700 shadow-xs"
                style={{ width: `${Math.min(100, Math.max(5, Math.round(((totalMinutesWeek / 60) / 80) * 100)))}%` }}
              />
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
            <HoursPieChart title="Hours by project" data={byProject} />
            <HoursPieChart title="Hours by person" data={byPerson} />
          </div>

          <PersonProjectBarChart
            rows={barRows}
            projects={projects}
            title="Person × project breakdown"
          />

          {/* Registered Team Members & Detailed Hours Matrix */}
          <div className="card p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-base-800/80">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-base-100 flex items-center gap-2">
                  <span>👥</span> Registered Team Members & Activity ({memberStats.length})
                </h3>
                <p className="text-xs text-base-400 mt-0.5">
                  Detailed contribution hours, active project coverage, and recent timestamps per person.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-base-800 text-[10px] font-mono uppercase tracking-wider text-base-400">
                    <th className="pb-3 pr-4 font-bold">Team Member</th>
                    <th className="pb-3 px-3 font-bold">Role</th>
                    <th className="pb-3 px-3 font-bold text-right">Filtered Hours</th>
                    <th className="pb-3 px-3 font-bold text-right">All-Time Hours</th>
                    <th className="pb-3 px-3 font-bold text-center">Projects</th>
                    <th className="pb-3 pl-3 font-bold text-right">Last Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-850/80">
                  {memberStats.map((member) => {
                    const initial = (member.full_name || member.email || '?').slice(0, 1).toUpperCase()
                    return (
                      <tr key={member.id} className="hover:bg-base-850/40 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-mono text-xs font-bold border border-accent/30 shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-base-100 truncate">{member.full_name || 'Member'}</div>
                              <div className="text-[10px] text-base-400 truncate">{member.email || 'No email provided'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            member.role === 'admin'
                              ? 'bg-accent/15 text-accent border-accent/30'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {member.role || 'member'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-accent text-sm">
                          {member.filteredHours}h
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-base-200">
                          {member.totalHours}h
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-base-300">
                          {member.projectsCount}
                        </td>
                        <td className="py-3 pl-3 text-right font-mono text-[11px] text-base-400">
                          {member.lastActive}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
