import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const PALETTE = ['#7c9eff', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7', '#ef4444', '#84cc16']

export default function AdminProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[0])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at')
    setProjects(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: name.trim(), color_hex: color, created_by: user.id })
      .select()
      .single()
    if (!error) {
      setProjects((prev) => [...prev, data])
      setName('')
    }
  }

  async function toggleActive(p) {
    await supabase.from('projects').update({ is_active: !p.is_active }).eq('id', p.id)
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)))
  }

  async function updateColor(p, newColor) {
    await supabase.from('projects').update({ color_hex: newColor }).eq('id', p.id)
    setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, color_hex: newColor } : x)))
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project? This also deletes its time entries.')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-100 mb-1">Projects</h1>
        <p className="text-xs sm:text-sm text-base-400">Manage the projects your team tracks time against. Admin only.</p>
      </div>

      <form onSubmit={handleCreate} className="card p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
        <div className="flex-1">
          <div className="label-eyebrow mb-1.5">New project name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Redesign"
            className="w-full bg-base-850 border border-base-700 rounded-xl px-3.5 py-2.5 text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none"
          />
        </div>
        <div>
          <div className="label-eyebrow mb-1.5">Color</div>
          <div className="flex gap-2 items-center flex-wrap">
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-105 active:scale-95"
                style={{ background: c, borderColor: color === c ? '#ffffff' : 'transparent' }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-accent hover:bg-accent-soft transition-colors text-base-950 font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs"
        >
          Add project
        </button>
      </form>

      <div className="card divide-y divide-base-800 overflow-hidden">
        {loading ? (
          <div className="px-5 py-6 text-sm text-base-400 font-mono text-center">loading projects…</div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-base-850/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: p.color_hex }} />
                <div>
                  <div className="text-sm font-medium text-base-100">{p.name}</div>
                  <div className="text-xs text-base-400">{p.is_active ? 'Active' : 'Inactive'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="flex gap-1.5 items-center">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateColor(p, c)}
                      className="w-5 h-5 rounded-full border transition-transform hover:scale-110"
                      style={{ background: c, borderColor: p.color_hex === c ? '#ffffff' : 'transparent' }}
                      aria-label={`Change project color to ${c}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(p)}
                    className="text-xs text-base-300 hover:text-accent px-3 py-1.5 rounded-lg border border-base-700 bg-base-850 hover:bg-base-800 transition-colors"
                  >
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-base-400 hover:text-red-400 px-3 py-1.5 rounded-lg border border-base-700 bg-base-850 hover:bg-base-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
