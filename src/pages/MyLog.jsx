import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { exportToCSV } from '../lib/exportUtils'

export default function MyLog() {
  const { user } = useAuth()
  const toast = useToast()
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editNotes, setEditNotes] = useState('')

  async function load() {
    setLoading(true)
    const [entriesRes, projectsRes] = await Promise.all([
      supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false }),
      supabase.from('projects').select('*')
    ])
    setEntries(entriesRes.data || [])
    setProjects(projectsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return
    await supabase.from('time_entries').delete().eq('id', id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.info('Time entry deleted')
  }

  function startEdit(entry) {
    setEditingId(entry.id)
    setEditNotes(entry.notes || '')
  }

  async function saveEdit(id) {
    await supabase.from('time_entries').update({ notes: editNotes }).eq('id', id)
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, notes: editNotes } : e)))
    setEditingId(null)
    toast.success('Entry notes updated!')
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

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-base-100">My Entries</h1>
          <p className="text-xs sm:text-sm text-base-400 mt-0.5">Edit or remove your logged time entries.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={entries.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-base-850 hover:bg-base-800 text-accent border border-accent/25 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-xs text-base-400 font-mono">loading entries…</div>
      ) : entries.length === 0 ? (
        <div className="card p-8 text-center text-xs sm:text-sm text-base-400">
          No time entries logged yet. Head to Log Time to record your first entry.
        </div>
      ) : (
        <>
          {/* Mobile Card List View (< 768px) */}
          <div className="md:hidden flex flex-col gap-3 min-w-0">
            {entries.map((entry) => {
              const project = projectMap[entry.project_id]
              const isEditing = editingId === entry.id

              return (
                <div key={entry.id} className="card p-4 flex flex-col gap-2.5 min-w-0 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-base-850 border border-base-700 text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[70%] shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ background: project?.color_hex || '#7c9eff' }} />
                      <span className="truncate">{project?.name || 'Unknown'}</span>
                    </span>
                    <span className="font-mono text-xs font-extrabold text-accent px-2.5 py-0.5 rounded-md bg-accent/15 border border-accent/30 shrink-0">
                      {(entry.duration_minutes / 60).toFixed(2)}h
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono py-1.5 border-y border-base-800/80 my-0.5">
                    <span>Date: <strong className="text-slate-900 dark:text-slate-100 font-bold">{entry.entry_date}</strong></span>
                    {entry.start_time && entry.end_time && (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.start_time} - {entry.end_time}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Edit notes…"
                          className="w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 text-xs text-base-400 hover:text-base-100 bg-base-800 rounded-lg font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(entry.id)}
                            className="px-3.5 py-1 text-xs font-bold text-white bg-accent hover:bg-accent-soft rounded-lg shadow-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium break-words leading-relaxed">
                        {entry.notes ? `"${entry.notes}"` : <span className="italic text-slate-400 dark:text-slate-500">No notes attached</span>}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-base-800/60">
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-xs text-accent hover:text-accent-soft font-bold px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-500 hover:text-red-400 font-bold px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block card overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-base-700 text-left bg-base-850/80">
                    <th className="px-5 py-3.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">Date</th>
                    <th className="px-5 py-3.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">Project</th>
                    <th className="px-5 py-3.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">Duration</th>
                    <th className="px-5 py-3.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">Notes</th>
                    <th className="px-5 py-3.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-800">
                  {entries.map((entry) => {
                    const project = projectMap[entry.project_id]
                    return (
                      <tr key={entry.id} className="hover:bg-base-850/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {entry.entry_date}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <span className="w-3 h-3 rounded-full shadow-xs" style={{ background: project?.color_hex || '#7c9eff' }} />
                            {project?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono font-extrabold text-accent whitespace-nowrap text-base">
                          {(entry.duration_minutes / 60).toFixed(2)}h
                        </td>
                        <td className="px-5 py-4 text-slate-800 dark:text-slate-200 font-medium max-w-sm leading-relaxed">
                          {editingId === entry.id ? (
                            <input
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-1.5 text-xs font-semibold text-base-100 outline-none"
                            />
                          ) : (
                            <span className="break-words block font-medium">{entry.notes || <span className="text-slate-400 dark:text-slate-500 italic">—</span>}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {editingId === entry.id ? (
                            <button onClick={() => saveEdit(entry.id)} className="px-3 py-1 rounded-lg bg-accent text-white hover:bg-accent-soft text-xs font-bold mr-2 shadow-xs">Save</button>
                          ) : (
                            <button onClick={() => startEdit(entry)} className="px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 text-xs font-bold mr-2 transition-colors">Edit</button>
                          )}
                          <button onClick={() => handleDelete(entry.id)} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-colors">Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
