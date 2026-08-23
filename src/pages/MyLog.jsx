import { useEffect, useState, useMemo } from 'react'
import { fetchUserEntries, fetchProjects, deleteTimeEntryItem, updateTimeEntryNotes } from '../lib/dataStore'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { exportToCSV } from '../lib/exportUtils'

function minutesBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff < 0) diff += 24 * 60
  return diff
}

export default function MyLog() {
  const { user } = useAuth()
  const toast = useToast()
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    entry_date: '',
    project_id: '',
    mode: 'manual',
    start_time: '',
    end_time: '',
    manual_hours: '1',
    notes: ''
  })

  async function load() {
    setLoading(true)
    const [entriesData, projectsData] = await Promise.all([
      fetchUserEntries(user?.id),
      fetchProjects()
    ])
    setEntries(entriesData || [])
    setProjects(projectsData || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))

  // ── Search filter ──────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(e =>
      (e.notes || '').toLowerCase().includes(q) ||
      (projectMap[e.project_id]?.name || '').toLowerCase().includes(q) ||
      e.entry_date.includes(q)
    )
  }, [entries, search, projectMap])

  // ── Computed duration for edit form ───────────────────────
  const editDurationMinutes = useMemo(() => {
    if (editForm.mode === 'range') {
      if (!editForm.start_time || !editForm.end_time) return 0
      return minutesBetween(editForm.start_time, editForm.end_time)
    }
    return Math.max(1, Math.round(parseFloat(editForm.manual_hours || '0') * 60))
  }, [editForm])

  async function handleDelete(id) {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    await deleteTimeEntryItem(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.info('Time entry deleted')
  }

  function startEdit(entry) {
    setEditingId(entry.id)
    const hasRange = !!(entry.start_time && entry.end_time)
    setEditForm({
      entry_date: entry.entry_date,
      project_id: entry.project_id,
      mode: hasRange ? 'range' : 'manual',
      start_time: entry.start_time || '09:00',
      end_time: entry.end_time || '10:00',
      manual_hours: ((entry.duration_minutes || 60) / 60).toFixed(2),
      notes: entry.notes || ''
    })
  }

  async function saveEdit(id) {
    await updateTimeEntryNotes(id, editForm.notes)
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, notes: editForm.notes } : e))
    )
    setEditingId(null)
    toast.success('Entry updated!')
  }

  function handleExportCSV() {
    const headers = [
      { key: 'date', label: 'Date' },
      { key: 'project', label: 'Project' },
      { key: 'hours', label: 'Hours' },
      { key: 'notes', label: 'Notes' }
    ]
    const exportRows = entries.map((e) => ({
      date: e.entry_date,
      project: projectMap[e.project_id]?.name || 'Unknown',
      hours: (e.duration_minutes / 60).toFixed(2),
      notes: e.notes || ''
    }))
    const dateStr = new Date().toISOString().slice(0, 10)
    exportToCSV(`my_timelog_entries_${dateStr}`, headers, exportRows)
    toast.success('📁 Personal CSV export downloaded!')
  }

  // ── Inline edit form row / card ────────────────────────────
  function EditForm({ entry, isMobile }) {
    const inputCls = 'w-full min-w-0 max-w-full box-border bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none transition-colors'
    return (
      <div className={`flex flex-col gap-3 min-w-0 max-w-full overflow-hidden ${isMobile ? '' : 'p-3'}`}>
        {/* Row 1: Date + Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0 max-w-full">
          <div className="w-full min-w-0 max-w-full">
            <div className="label-eyebrow text-[9px] mb-1">Date</div>
            <input
              type="date"
              value={editForm.entry_date}
              onClick={e => e.target.showPicker?.()}
              onChange={e => setEditForm(f => ({ ...f, entry_date: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="w-full min-w-0 max-w-full">
            <div className="label-eyebrow text-[9px] mb-1">Project</div>
            <select
              value={editForm.project_id}
              onChange={e => setEditForm(f => ({ ...f, project_id: e.target.value }))}
              className={inputCls + ' appearance-none cursor-pointer'}
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Mode toggle */}
        <div className="grid grid-cols-2 p-0.5 bg-base-850 rounded-xl border border-base-700 gap-0.5 min-w-0 max-w-full overflow-hidden box-border">
          {['manual', 'range'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setEditForm(f => ({ ...f, mode: m }))}
              className={`text-[10px] py-1.5 rounded-lg font-bold transition-all truncate ${
                editForm.mode === m
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-base-400 hover:text-base-100'
              }`}
            >
              {m === 'manual' ? 'Manual Hours' : 'Start / End'}
            </button>
          ))}
        </div>

        {/* Row 3: Duration input */}
        {editForm.mode === 'manual' ? (
          <div className="w-full min-w-0 max-w-full">
            <div className="label-eyebrow text-[9px] mb-1">Hours</div>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={editForm.manual_hours}
              onChange={e => setEditForm(f => ({ ...f, manual_hours: e.target.value }))}
              className={inputCls}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0 max-w-full">
            <div className="w-full min-w-0 max-w-full">
              <div className="label-eyebrow text-[9px] mb-1">Start</div>
              <input type="time" value={editForm.start_time}
                onClick={e => e.target.showPicker?.()}
                onChange={e => setEditForm(f => ({ ...f, start_time: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="w-full min-w-0 max-w-full">
              <div className="label-eyebrow text-[9px] mb-1">End</div>
              <input type="time" value={editForm.end_time}
                onClick={e => e.target.showPicker?.()}
                onChange={e => setEditForm(f => ({ ...f, end_time: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Duration preview */}
        <div className="flex items-center justify-between bg-base-850/80 border border-base-800 rounded-xl px-3 py-2 text-xs text-base-300 min-w-0 max-w-full box-border">
          <span>Calculated Duration:</span>
          <span className="text-accent font-mono font-bold">{(editDurationMinutes / 60).toFixed(2)}h</span>
        </div>

        {/* Notes */}
        <div className="w-full min-w-0 max-w-full">
          <div className="label-eyebrow text-[9px] mb-1">Notes</div>
          <input
            value={editForm.notes}
            onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="What did you work on?"
            className={inputCls}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end pt-1 min-w-0">
          <button
            onClick={() => setEditingId(null)}
            className="px-3 py-1.5 text-xs text-base-400 hover:text-base-100 bg-base-800 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => saveEdit(entry.id)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-accent hover:bg-accent-soft rounded-xl shadow-sm transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 max-w-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-base-100">My Entries</h1>
          <p className="text-xs sm:text-sm text-base-400 mt-0.5">Edit or remove your logged time entries.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={entries.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-base-850 hover:bg-base-800 text-accent border border-accent/25 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 shadow-xs active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative w-full min-w-0 max-w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-base-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by notes, project, or date…"
          className="w-full min-w-0 max-w-full box-border bg-base-900/80 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-base-100 placeholder-base-500 outline-none transition-colors shadow-xs"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-500 hover:text-base-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Search result count ── */}
      {search && (
        <p className="text-xs text-base-400 font-mono -mt-2">
          {filtered.length} of {entries.length} entries match
          {' '}<span className="text-accent font-bold">"{search}"</span>
        </p>
      )}

      {loading ? (
        <div className="card p-8 text-center text-xs text-base-400 font-mono">loading entries…</div>
      ) : entries.length === 0 ? (
        <div className="card p-8 text-center text-xs sm:text-sm text-base-400">
          No time entries logged yet. Head to Log Time to record your first entry.
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-xs sm:text-sm text-base-400">
          No entries match <span className="text-accent font-semibold">"{search}"</span>. Try a different search term.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="card overflow-hidden hidden sm:block shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-base-800 text-[10px] font-mono uppercase tracking-wider text-base-400">
                    <th className="py-3 px-4 font-bold">Date</th>
                    <th className="py-3 px-4 font-bold">Project</th>
                    <th className="py-3 px-4 font-bold">Duration</th>
                    <th className="py-3 px-4 font-bold">Notes</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-850/80">
                  {filtered.map((e) => {
                    const isEditing = editingId === e.id
                    const p = projectMap[e.project_id]
                    return (
                      <tr key={e.id} className="hover:bg-base-850/40 transition-colors">
                        {isEditing ? (
                          <td colSpan={5} className="p-2">
                            <EditForm entry={e} isMobile={false} />
                          </td>
                        ) : (
                          <>
                            <td className="py-3.5 px-4 font-mono text-base-200 whitespace-nowrap">{e.entry_date}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white shadow-xs"
                                style={{ backgroundColor: p?.color_hex || '#6366f1' }}
                              >
                                {p?.name || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-accent whitespace-nowrap">
                              {(e.duration_minutes / 60).toFixed(2)}h
                            </td>
                            <td className="py-3.5 px-4 text-base-400 max-w-xs truncate">{e.notes || '—'}</td>
                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => startEdit(e)}
                                className="text-xs text-base-400 hover:text-base-100 font-semibold px-2 py-1 rounded-lg hover:bg-base-800 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(e.id)}
                                className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="space-y-3 sm:hidden min-w-0 max-w-full">
            {filtered.map((e) => {
              const isEditing = editingId === e.id
              const p = projectMap[e.project_id]
              return (
                <div key={e.id} className="card p-4 space-y-3 min-w-0 max-w-full overflow-hidden shadow-sm">
                  {isEditing ? (
                    <EditForm entry={e} isMobile={true} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white truncate shadow-xs"
                          style={{ backgroundColor: p?.color_hex || '#6366f1' }}
                        >
                          {p?.name || 'Unknown'}
                        </span>
                        <span className="font-mono font-extrabold text-accent text-sm shrink-0">
                          {(e.duration_minutes / 60).toFixed(2)}h
                        </span>
                      </div>
                      <div className="text-xs font-mono text-base-300">{e.entry_date}</div>
                      {e.notes && <p className="text-xs text-base-400 break-words">{e.notes}</p>}
                      <div className="flex gap-2 justify-end pt-2 border-t border-base-800/80">
                        <button
                          onClick={() => startEdit(e)}
                          className="px-3 py-1.5 text-xs text-base-300 bg-base-850 hover:bg-base-800 rounded-xl font-bold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
