import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

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

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-base-100 mb-1">My Entries</h1>
      <p className="text-sm text-base-400 mb-6">Everything you've logged. Edit notes or remove a mistaken entry.</p>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-700 text-left text-base-400">
              <th className="px-4 py-3 font-normal label-eyebrow">Date</th>
              <th className="px-4 py-3 font-normal label-eyebrow">Project</th>
              <th className="px-4 py-3 font-normal label-eyebrow">Duration</th>
              <th className="px-4 py-3 font-normal label-eyebrow">Notes</th>
              <th className="px-4 py-3 font-normal label-eyebrow text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-base-400">loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-base-400">No entries yet — log your first one.</td></tr>
            ) : (
              entries.map((entry) => {
                const project = projectMap[entry.project_id]
                return (
                  <tr key={entry.id} className="border-b border-base-800 hover:bg-base-850/60">
                    <td className="px-4 py-3 text-base-200">{entry.entry_date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: project?.color_hex }} />
                        {project?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-base-200">{(entry.duration_minutes / 60).toFixed(2)}h</td>
                    <td className="px-4 py-3 text-base-400 max-w-xs">
                      {editingId === entry.id ? (
                        <input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full bg-base-850 border border-base-700 rounded px-2 py-1 text-sm text-base-100 focus:border-accent outline-none"
                        />
                      ) : (
                        <span className="truncate block">{entry.notes || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {editingId === entry.id ? (
                        <button onClick={() => saveEdit(entry.id)} className="text-accent hover:underline text-xs mr-3">Save</button>
                      ) : (
                        <button onClick={() => startEdit(entry)} className="text-base-400 hover:text-accent text-xs mr-3">Edit</button>
                      )}
                      <button onClick={() => handleDelete(entry.id)} className="text-base-400 hover:text-red-400 text-xs">Delete</button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
