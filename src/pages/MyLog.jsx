import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { exportToCSV } from '../lib/exportUtils'

export default function MyLog() {
  const { user } = useAuth()
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
  }

  function startEdit(entry) {
    setEditingId(entry.id)
    setEditNotes(entry.notes || '')
  }

  async function saveEdit(id) {
    await supabase.from('time_entries').update({ notes: editNotes }).eq('id', id)
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, notes: editNotes } : e)))
    setEditingId(null)
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
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-100">My Entries</h1>
          <p className="text-xs sm:text-sm text-base-400 mt-1">Everything you've logged. Edit notes or remove a mistaken entry.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={entries.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-base-800 hover:bg-base-700 text-accent hover:text-white border border-accent/20 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-sm text-base-400 font-mono">loading entries…</div>
      ) : entries.length === 0 ? (
        <div className="card p-8 text-center text-sm text-base-400">
          No entries logged yet. Head over to Log Time to add your first entry.
        </div>
      ) : (
        <>
          {/* Mobile Card List View (< 768px) */}
          <div className="md:hidden flex flex-col gap-3.5">
            {entries.map((entry) => {
              const project = projectMap[entry.project_id]
              const isEditing = editingId === entry.id

              return (
                <div key={entry.id} className="card p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-base-850 border border-base-700 text-xs font-medium text-base-200">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: project?.color_hex || '#7c9eff' }} />
                      {project?.name || 'Unknown'}
                    </span>
                    <span className="font-mono text-sm font-semibold text-accent">
                      {(entry.duration_minutes / 60).toFixed(2)}h
                    </span>
                  </div>

                  <div className="text-xs text-base-400 flex items-center justify-between border-b border-base-800 pb-2">
                    <span>Date: <strong className="text-base-200 font-normal">{entry.entry_date}</strong></span>
                    {entry.start_time && entry.end_time && (
                      <span className="font-mono">{entry.start_time} - {entry.end_time}</span>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Edit notes…"
                          className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 focus:border-accent outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-xs text-base-400 hover:text-base-200 bg-base-800 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(entry.id)}
                            className="px-3 py-1.5 text-xs font-medium text-base-950 bg-accent hover:bg-accent-soft rounded-lg"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-base-300 italic">
                        {entry.notes ? `"${entry.notes}"` : 'No notes attached'}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex justify-end gap-3 pt-2 border-t border-base-800/60">
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-xs text-base-400 hover:text-accent font-medium transition-colors px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-base-400 hover:text-red-400 font-medium transition-colors px-2 py-1"
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
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-base-700 text-left text-base-400 bg-base-900/40">
                    <th className="px-4 py-3.5 font-normal label-eyebrow">Date</th>
                    <th className="px-4 py-3.5 font-normal label-eyebrow">Project</th>
                    <th className="px-4 py-3.5 font-normal label-eyebrow">Duration</th>
                    <th className="px-4 py-3.5 font-normal label-eyebrow">Notes</th>
                    <th className="px-4 py-3.5 font-normal label-eyebrow text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-800">
                  {entries.map((entry) => {
                    const project = projectMap[entry.project_id]
                    return (
                      <tr key={entry.id} className="hover:bg-base-850/60 transition-colors">
                        <td className="px-4 py-3.5 text-base-200 whitespace-nowrap">{entry.entry_date}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: project?.color_hex || '#7c9eff' }} />
                            {project?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-base-200 whitespace-nowrap">
                          {(entry.duration_minutes / 60).toFixed(2)}h
                        </td>
                        <td className="px-4 py-3.5 text-base-400 max-w-xs">
                          {editingId === entry.id ? (
                            <input
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-base-850 border border-base-700 rounded px-2.5 py-1 text-sm text-base-100 focus:border-accent outline-none"
                            />
                          ) : (
                            <span className="truncate block">{entry.notes || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {editingId === entry.id ? (
                            <button onClick={() => saveEdit(entry.id)} className="text-accent hover:underline text-xs font-medium mr-3">Save</button>
                          ) : (
                            <button onClick={() => startEdit(entry)} className="text-base-400 hover:text-accent text-xs font-medium mr-3">Edit</button>
                          )}
                          <button onClick={() => handleDelete(entry.id)} className="text-base-400 hover:text-red-400 text-xs font-medium">Delete</button>
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
