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
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-base-100 mb-1">Projects</h1>
      <p className="text-sm text-base-400 mb-6">Manage the projects your team tracks time against. Admin only.</p>

      <form onSubmit={handleCreate} className="card p-5 flex flex-wrap items-end gap-3 mb-6">
        <div className="flex-1 min-w-[180px]">
          <div className="label-eyebrow mb-1">New project name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website Redesign"
            className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none"
          />
        </div>
        <div>
          <div className="label-eyebrow mb-1">Color</div>
          <div className="flex gap-1.5">
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full border-2"
                style={{ background: c, borderColor: color === c ? '#e9ebf2' : 'transparent' }}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-accent hover:bg-accent-soft transition-colors text-base-950 font-medium text-sm py-2.5 px-4 rounded-lg"
        >
          Add project
        </button>
      </form>

      <div className="card divide-y divide-base-800">
        {loading ? (
          <div className="px-5 py-6 text-sm text-base-400">loading…</div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex gap-1">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateColor(p, c)}
                    className="w-4 h-4 rounded-full border"
                    style={{ background: c, borderColor: p.color_hex === c ? '#e9ebf2' : 'transparent' }}
                  />
                ))}
              </div>
              <div className="flex-1">
                <div className="text-sm text-base-100">{p.name}</div>
                <div className="text-xs text-base-400">{p.is_active ? 'Active' : 'Inactive'}</div>
              </div>
              <button
                onClick={() => toggleActive(p)}
                className="text-xs text-base-400 hover:text-accent px-3 py-1.5 rounded border border-base-700"
              >
                {p.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-xs text-base-400 hover:text-red-400 px-3 py-1.5 rounded border border-base-700"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
