import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function minutesBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff < 0) diff += 24 * 60 // handles overnight entries
  return diff
}

export default function LogTime() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [mode, setMode] = useState('range') // 'range' | 'manual'
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [manualHours, setManualHours] = useState('1')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('projects').select('*').eq('is_active', true).order('created_at').then(({ data }) => {
      setProjects(data || [])
      if (data?.length) setProjectId(data[0].id)
    })
  }, [])

  const durationMinutes = mode === 'range'
    ? minutesBetween(startTime, endTime)
    : Math.round(parseFloat(manualHours || '0') * 60)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setSaving(true)
    const { error } = await supabase.from('time_entries').insert({
      user_id: user.id,
      project_id: projectId,
      entry_date: entryDate,
      start_time: mode === 'range' ? startTime : null,
      end_time: mode === 'range' ? endTime : null,
      duration_minutes: durationMinutes,
      notes
    })
    setSaving(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Entry logged successfully!')
      setNotes('')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-base-100">Log Time</h1>
        <p className="text-xs sm:text-sm text-base-400 mt-0.5">Record time spent on a project. Duration calculates automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 sm:p-6 flex flex-col gap-4 min-w-0 overflow-hidden">
        <div>
          <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">Project</div>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-base-100 focus:border-accent outline-none appearance-none box-border"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">Date</div>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-base-100 focus:border-accent outline-none box-border"
          />
        </div>

        {/* Mode Selector */}
        <div>
          <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">Entry Mode</div>
          <div className="flex p-1 bg-base-850 rounded-xl border border-base-700 gap-1">
            <button
              type="button"
              onClick={() => setMode('range')}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${
                mode === 'range' 
                  ? 'border border-accent/30 text-accent bg-accent/15 shadow-xs' 
                  : 'text-base-400 hover:text-base-200'
              }`}
            >
              Start / End time
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${
                mode === 'manual' 
                  ? 'border border-accent/30 text-accent bg-accent/15 shadow-xs' 
                  : 'text-base-400 hover:text-base-200'
              }`}
            >
              Manual duration
            </button>
          </div>
        </div>

        {mode === 'range' ? (
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div>
              <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">Start Time</div>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-base-100 focus:border-accent outline-none box-border"
              />
            </div>
            <div>
              <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">End Time</div>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-base-100 focus:border-accent outline-none box-border"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">Hours</div>
            <input
              type="number"
              step="0.25"
              min="0"
              value={manualHours}
              onChange={(e) => setManualHours(e.target.value)}
              className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-base-100 focus:border-accent outline-none box-border"
            />
          </div>
        )}

        <div className="bg-base-850/80 border border-base-800 rounded-xl p-3 flex items-center justify-between text-xs text-base-300">
          <span>Calculated Duration:</span>
          <span className="text-accent font-mono text-sm sm:text-base font-bold">{(durationMinutes / 60).toFixed(2)}h</span>
        </div>

        <div>
          <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">Notes (optional)</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="What did you work on?"
            className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none resize-none box-border"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-medium border ${
            message.startsWith('Error') 
              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
              : 'bg-green-500/10 border-green-500/20 text-green-400'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || durationMinutes <= 0}
          className="w-full bg-accent hover:bg-accent-soft transition-colors text-base-950 font-bold text-xs sm:text-sm py-3 rounded-xl disabled:opacity-50 mt-1 shadow-xs"
        >
          {saving ? 'Saving entry…' : 'Save time entry'}
        </button>
      </form>
    </div>
  )
}
