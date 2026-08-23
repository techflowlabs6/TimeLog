import { useMemo, useEffect, useState } from 'react'
import { exportToCSV } from '../lib/exportUtils'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function startOfWeek() {
  const d = new Date()
  const day = d.getDay() || 7
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().slice(0, 10)
}

function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export default function MemberProfileModal({ member, entries = [], projects = [], onRoleChange, onClose }) {
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  const [currentRole, setCurrentRole] = useState(member?.role || 'member')
  const [updatingRole, setUpdatingRole] = useState(false)

  const weekStart = useMemo(() => startOfWeek(), [])
  const monthStart = useMemo(() => startOfMonth(), [])

  // Close on ESC key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (member?.role) setCurrentRole(member.role)
  }, [member])

  const projectMap = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects])

  // Filter entries for this specific member
  const memberEntries = useMemo(() => {
    if (!member) return []
    return entries.filter(e => e.user_id === member.id)
  }, [member, entries])

  // KPI Calculations
  const totalMinutes = useMemo(() => {
    return memberEntries.reduce((s, e) => s + e.duration_minutes, 0)
  }, [memberEntries])

  const weekMinutes = useMemo(() => {
    return memberEntries
      .filter(e => e.entry_date >= weekStart)
      .reduce((s, e) => s + e.duration_minutes, 0)
  }, [memberEntries, weekStart])

  const monthMinutes = useMemo(() => {
    return memberEntries
      .filter(e => e.entry_date >= monthStart)
      .reduce((s, e) => s + e.duration_minutes, 0)
  }, [memberEntries, monthStart])

  // Project Breakdown for this person
  const projectBreakdown = useMemo(() => {
    const map = {}
    memberEntries.forEach(e => {
      const pid = e.project_id
      if (!map[pid]) {
        map[pid] = {
          project: projectMap[pid] || { id: pid, name: 'Unknown Project', color_hex: '#6366f1' },
          totalMinutes: 0,
          entriesCount: 0,
          lastActive: e.entry_date
        }
      }
      map[pid].totalMinutes += e.duration_minutes
      map[pid].entriesCount += 1
      if (e.entry_date > map[pid].lastActive) {
        map[pid].lastActive = e.entry_date
      }
    })

    return Object.values(map).sort((a, b) => b.totalMinutes - a.totalMinutes)
  }, [memberEntries, projectMap])

  if (!member) return null

  const initial = (member.full_name || member.email || '?').slice(0, 1).toUpperCase()
  const totalHoursFormatted = (totalMinutes / 60).toFixed(1)
  const weekHoursFormatted = (weekMinutes / 60).toFixed(1)
  const monthHoursFormatted = (monthMinutes / 60).toFixed(1)

  async function handleToggleRole() {
    const nextRole = currentRole === 'admin' ? 'member' : 'admin'
    setUpdatingRole(true)
    setCurrentRole(nextRole)
    if (onRoleChange) {
      await onRoleChange(member.id, nextRole)
    }
    setUpdatingRole(false)
    if (nextRole === 'admin') {
      toast.success(`👑 Granted Admin privileges to ${member.full_name || member.email}!`)
    } else {
      toast.info(`👤 Changed ${member.full_name || member.email} to Member role`)
    }
  }

  function handleExportMemberReport() {
    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'project', label: 'Project' },
      { key: 'hours', label: 'Hours' },
      { key: 'notes', label: 'Notes' }
    ]
    const exportRows = memberEntries.map(e => ({
      date: e.entry_date,
      project: projectMap[e.project_id]?.name || 'Unknown',
      hours: (e.duration_minutes / 60).toFixed(2),
      notes: e.notes || ''
    }))
    const nameSlug = (member.full_name || 'member').toLowerCase().replace(/\s+/g, '_')
    exportToCSV(`timelog_${nameSlug}_activity`, headers, exportRows)
    toast.success('📁 Member performance report downloaded!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-base-900 border border-base-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Header Profile Section */}
        <div className="p-5 sm:p-6 border-b border-base-800 bg-gradient-to-br from-base-850 via-base-900 to-base-900 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-base-400 hover:text-base-100 hover:bg-base-800 rounded-xl transition-colors"
            title="Close (ESC)"
          >
            ✕
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 text-accent border border-accent/40 flex items-center justify-center font-mono text-2xl font-black shadow-md shrink-0">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-base-100 truncate">
                  {member.full_name || 'Team Member'}
                </h2>

                {/* Role Switcher or Badge */}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={handleToggleRole}
                    disabled={updatingRole}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border transition-all active:scale-95 shadow-xs ${
                      currentRole === 'admin'
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                        : 'bg-base-800 hover:bg-accent/20 text-slate-300 hover:text-accent border-base-700 hover:border-accent/40'
                    }`}
                    title="Click to toggle Admin / Member role"
                  >
                    <span>{currentRole === 'admin' ? '👑 Admin' : '👤 Member'}</span>
                    <span className="text-[9px] opacity-70 underline">
                      {currentRole === 'admin' ? 'Change to Member' : 'Make Admin'}
                    </span>
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wide ${
                      currentRole === 'admin'
                        ? 'bg-accent/15 text-accent border-accent/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}
                  >
                    {currentRole === 'admin' ? '⚙ Admin' : '👤 Member'}
                  </span>
                )}
              </div>

              <p className="text-xs text-base-400 font-medium mt-1 truncate">
                {member.email || 'No email registered'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-base-400 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Contributor
                </span>
                <span>•</span>
                <span>{memberEntries.length} logged entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-base-800/80">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-base-850 border border-base-700/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-base-400 font-bold">All-Time</div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-accent mt-1">{totalHoursFormatted}h</div>
              <div className="text-[10px] text-base-400 mt-0.5">Total hours logged</div>
            </div>

            <div className="p-3.5 rounded-xl bg-base-850 border border-base-700/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-base-400 font-bold">This Week</div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400 mt-1">{weekHoursFormatted}h</div>
              <div className="text-[10px] text-base-400 mt-0.5">Current sprint output</div>
            </div>

            <div className="p-3.5 rounded-xl bg-base-850 border border-base-700/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-base-400 font-bold">This Month</div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-sky-400 mt-1">{monthHoursFormatted}h</div>
              <div className="text-[10px] text-base-400 mt-0.5">Monthly total</div>
            </div>

            <div className="p-3.5 rounded-xl bg-base-850 border border-base-700/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-base-400 font-bold">Projects</div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-indigo-400 mt-1">{projectBreakdown.length}</div>
              <div className="text-[10px] text-base-400 mt-0.5">Enrolled projects</div>
            </div>
          </div>

          {/* Enrolled & Worked Projects Breakdown */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm sm:text-base font-bold text-base-100 flex items-center gap-2">
                <span>📁</span> Project Allocation & Hours
              </h3>
              <span className="text-xs font-mono text-base-400">{projectBreakdown.length} Projects</span>
            </div>

            {projectBreakdown.length === 0 ? (
              <p className="text-xs text-base-400 italic py-2">No projects logged yet by this member.</p>
            ) : (
              <div className="space-y-3">
                {projectBreakdown.map(item => {
                  const hours = (item.totalMinutes / 60).toFixed(1)
                  const percentage = totalMinutes > 0 ? Math.round((item.totalMinutes / totalMinutes) * 100) : 0
                  return (
                    <div key={item.project.id} className="p-3 rounded-xl bg-base-850/60 border border-base-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: item.project.color_hex || '#6366f1' }}
                          />
                          <span className="text-base-100 font-bold truncate">{item.project.name}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono shrink-0">
                          <span className="text-accent font-extrabold">{hours}h</span>
                          <span className="text-base-400 text-[11px]">({percentage}%)</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-base-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.project.color_hex || '#6366f1'
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-base-400 pt-0.5">
                        <span>{item.entriesCount} entries logged</span>
                        <span>Last active: {item.lastActive}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Work History Log */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm sm:text-base font-bold text-base-100 flex items-center gap-2">
                <span>📝</span> Recent Activity Timeline
              </h3>
              <button
                onClick={handleExportMemberReport}
                disabled={memberEntries.length === 0}
                className="text-[11px] font-bold text-accent hover:underline disabled:opacity-40"
              >
                Export CSV ↓
              </button>
            </div>

            {memberEntries.length === 0 ? (
              <p className="text-xs text-base-400 italic py-2">No activity logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {memberEntries.slice(0, 10).map(entry => {
                  const p = projectMap[entry.project_id]
                  return (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-xl bg-base-850/40 border border-base-800/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-base-200">{entry.entry_date}</span>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold text-white shadow-xs"
                            style={{ backgroundColor: p?.color_hex || '#6366f1' }}
                          >
                            {p?.name || 'Unknown'}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-base-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                      <div className="font-mono font-extrabold text-accent shrink-0 text-sm">
                        {((entry.duration_minutes || 0) / 60).toFixed(1)}h
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-base-800 bg-base-850/60 flex items-center justify-between">
          <button
            onClick={handleExportMemberReport}
            disabled={memberEntries.length === 0}
            className="px-3.5 py-2 rounded-xl bg-base-800 hover:bg-base-700 text-base-300 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-soft text-base-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
