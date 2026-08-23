import { useEffect, useState, useMemo } from 'react'
import {
  fetchRoadmapItems,
  addRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  toggleRoadmapItemCompleted,
  fetchProjects
} from '../lib/dataStore'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STATUS_CONFIG = {
  shipped: { label: 'Shipped', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  in_progress: { label: 'In Progress', color: 'bg-accent/15 text-accent border-accent/30' },
  planned: { label: 'Planned', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
}

export default function Roadmap() {
  const { user, isAdmin } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [projectFilter, setProjectFilter] = useState('all')

  // Add Item State (Admin only)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newProject, setNewProject] = useState('')
  const [newMilestone, setNewMilestone] = useState('v2.1 — Active Sprint')
  const [newStatus, setNewStatus] = useState('in_progress')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit Item State (Admin only)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editProject, setEditProject] = useState('')
  const [editMilestone, setEditMilestone] = useState('')
  const [editStatus, setEditStatus] = useState('in_progress')
  const [editDesc, setEditDesc] = useState('')

  async function load() {
    setLoading(true)
    const [roadmapData, projectsData] = await Promise.all([
      fetchRoadmapItems(),
      fetchProjects()
    ])
    setItems(roadmapData || [])
    setProjects(projectsData || [])
    if (projectsData?.length > 0 && !newProject) {
      setNewProject(projectsData[0].name)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  // Filtered roadmap items
  const filteredItems = useMemo(() => {
    if (projectFilter === 'all') return items
    return items.filter(
      (item) => (item.project_name || '').toLowerCase() === projectFilter.toLowerCase()
    )
  }, [items, projectFilter])

  // Group items by milestone
  const groupedMilestones = useMemo(() => {
    const map = new Map()
    filteredItems.forEach((item) => {
      const ms = item.milestone || 'Upcoming Features'
      if (!map.has(ms)) {
        map.set(ms, [])
      }
      map.get(ms).push(item)
    })
    return Array.from(map.entries())
  }, [filteredItems])

  // Overall Stats
  const totalCount = items.length
  const completedCount = items.filter((i) => i.is_completed).length
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  async function handleToggle(id, currentCompleted) {
    const nextState = !currentCompleted
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_completed: nextState } : i))
    )
    await toggleRoadmapItemCompleted(id, nextState)
    toast.success(nextState ? '🎉 Marked as Completed!' : 'Marked as In Progress')
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)

    const payload = {
      title: newTitle.trim(),
      project_name: newProject || 'General',
      milestone: newMilestone || 'v2.1 — Active Sprint',
      status: newStatus,
      description: newDesc.trim(),
      is_completed: newStatus === 'shipped',
      order_index: items.length + 1,
      created_by: user?.id || null
    }

    const { data, error } = await addRoadmapItem(payload)
    setSaving(false)

    if (!error && data) {
      setItems((prev) => [...prev, data])
      setNewTitle('')
      setNewDesc('')
      setShowAddForm(false)
      toast.success(`🚀 Roadmap item "${data.title}" created!`)
    } else {
      toast.error('Failed to create roadmap item')
    }
  }

  function startEditing(item) {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditProject(item.project_name)
    setEditMilestone(item.milestone)
    setEditStatus(item.status)
    setEditDesc(item.description || '')
  }

  async function saveEdit(id) {
    const updates = {
      title: editTitle.trim(),
      project_name: editProject,
      milestone: editMilestone,
      status: editStatus,
      description: editDesc.trim(),
      is_completed: editStatus === 'shipped'
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    )
    setEditingId(null)
    await updateRoadmapItem(id, updates)
    toast.success('Roadmap item updated!')
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete roadmap item "${title}"?`)) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteRoadmapItem(id)
    toast.info('Roadmap item deleted')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 min-w-0">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-base-100">
            Product Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-base-400 mt-1">
            Track feature milestones, project deliverables, and team shipping cadence in real-time.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-soft text-base-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <span>{showAddForm ? '✕ Close Form' : '＋ Add Roadmap Milestone'}</span>
          </button>
        )}
      </div>

      {/* Progress Header Card */}
      <div className="card p-4 sm:p-5 bg-gradient-to-r from-base-900 via-base-850 to-base-900 border border-base-700/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span className="font-display font-bold text-sm sm:text-base text-base-100">
              Overall Roadmap Delivery
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-base-300">
            <span>
              Completed: <strong className="text-accent">{completedCount}</strong> / {totalCount}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30 text-[11px]">
              {overallPercentage}%
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-base-800/80 rounded-full overflow-hidden p-0.5 border border-base-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.max(5, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Admin Add Form */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleCreate} className="card p-5 border-2 border-accent/40 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-base-800 pb-3">
            <h3 className="font-display text-sm sm:text-base font-bold text-base-100 flex items-center gap-2">
              <span>🚀</span> Add New Feature / Milestone
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold px-2 py-0.5 rounded bg-accent/15 border border-accent/25">
              Admin Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label-eyebrow text-[10px] mb-1">Project Name</label>
              <select
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none focus:border-accent"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="General">General / Platform</option>
              </select>
            </div>

            <div>
              <label className="label-eyebrow text-[10px] mb-1">Release Milestone</label>
              <input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="e.g. v2.1 — Active Sprint"
                required
                className="w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="label-eyebrow text-[10px] mb-1">Initial Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-xs font-semibold text-base-100 outline-none focus:border-accent"
              >
                <option value="in_progress">In Progress</option>
                <option value="planned">Planned</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-eyebrow text-[10px] mb-1">Feature / Task Title</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Real-Time Team Hour Budgets with Over-Capacity Alerts"
              required
              className="w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-base-100 outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="label-eyebrow text-[10px] mb-1">Description / Deliverable (Optional)</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              placeholder="Detail what is included in this release..."
              className="w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2 text-xs text-base-100 outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-base-400 hover:text-base-100 hover:bg-base-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !newTitle.trim()}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-soft text-base-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add to Roadmap'}
            </button>
          </div>
        </form>
      )}

      {/* Filter by Project Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold shrink-0 mr-1">
          Project Filter:
        </span>
        <button
          onClick={() => setProjectFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
            projectFilter === 'all'
              ? 'bg-accent/15 text-accent border border-accent/30 shadow-xs'
              : 'bg-base-850 text-base-400 hover:text-base-100 border border-base-700'
          }`}
        >
          All Projects ({items.length})
        </button>
        {projects.map((p) => {
          const count = items.filter((i) => (i.project_name || '').toLowerCase() === p.name.toLowerCase()).length
          return (
            <button
              key={p.id}
              onClick={() => setProjectFilter(p.name)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                projectFilter === p.name
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-xs'
                  : 'bg-base-850 text-base-400 hover:text-base-100 border border-base-700'
              }`}
            >
              {p.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Grouped Roadmap Milestones */}
      {loading ? (
        <div className="card p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-3" />
          loading product roadmap…
        </div>
      ) : groupedMilestones.length === 0 ? (
        <div className="card p-10 text-center text-base-400 font-medium">
          No roadmap items found for this project filter.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedMilestones.map(([milestoneTitle, milestoneItems]) => {
            const milestoneTotal = milestoneItems.length
            const milestoneDone = milestoneItems.filter((i) => i.is_completed).length
            const milestonePercent = Math.round((milestoneDone / milestoneTotal) * 100)

            return (
              <div key={milestoneTitle} className="card p-5 sm:p-6 shadow-lg border border-base-700/80 space-y-4">
                {/* Milestone Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-800/80 pb-3">
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-base-100 flex items-center gap-2">
                      <span className="text-accent">◈</span> {milestoneTitle}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-base-400">
                    <span>
                      Progress: <strong className="text-accent font-bold">{milestoneDone}/{milestoneTotal}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-base-850 border border-base-700 font-bold">
                      {milestonePercent}%
                    </span>
                  </div>
                </div>

                {/* Milestone Tasks Checklist */}
                <div className="space-y-2.5">
                  {milestoneItems.map((item) => {
                    const isEditing = editingId === item.id

                    if (isEditing) {
                      return (
                        <div key={item.id} className="p-4 rounded-xl bg-base-850 border border-accent/40 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Title"
                              className="sm:col-span-2 bg-base-900 border border-base-700 rounded-lg px-3 py-1.5 text-xs text-base-100 font-bold outline-none focus:border-accent"
                            />
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="bg-base-900 border border-base-700 rounded-lg px-2 py-1.5 text-xs text-base-100 font-semibold outline-none focus:border-accent"
                            >
                              <option value="in_progress">In Progress</option>
                              <option value="planned">Planned</option>
                              <option value="shipped">Shipped</option>
                            </select>
                          </div>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            rows={2}
                            className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-1.5 text-xs text-base-100 outline-none focus:border-accent resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 rounded-lg text-xs text-base-400 hover:text-base-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="px-3 py-1 rounded-lg bg-accent text-base-950 font-bold text-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={item.id}
                        className={`group p-3 sm:p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          item.is_completed
                            ? 'bg-base-900/60 border-base-800/80 opacity-80'
                            : 'bg-base-850/70 hover:bg-base-850 border-base-700/80 shadow-xs'
                        }`}
                      >
                        {/* Interactive Click to Toggle */}
                        <div
                          onClick={() => handleToggle(item.id, item.is_completed)}
                          className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer select-none"
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all mt-0.5 shrink-0 border ${
                              item.is_completed
                                ? 'bg-accent border-accent text-base-950 shadow-xs'
                                : 'border-base-600 bg-base-900 hover:border-accent'
                            }`}
                          >
                            {item.is_completed && (
                              <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-semibold transition-all ${
                                  item.is_completed ? 'line-through text-base-400' : 'text-base-100'
                                }`}
                              >
                                {item.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-base-900 border border-base-700 rounded px-1.5 py-0.5">
                                {item.project_name}
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                                  STATUS_CONFIG[item.status]?.color || STATUS_CONFIG.planned.color
                                }`}
                              >
                                {STATUS_CONFIG[item.status]?.label || item.status}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-base-400 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Admin Action Controls (Edit & Delete) */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(item)}
                              className="p-1.5 text-base-400 hover:text-accent hover:bg-base-800 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.title)}
                              className="p-1.5 text-base-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
