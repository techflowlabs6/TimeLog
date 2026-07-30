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
      setMessage('Entry logged.')
      setNotes('')
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-base-100 mb-1">Log Time</h1>
      <p className="text-sm text-base-400 mb-8">Record time spent on a project. Duration is calculated automatically.</p>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
        <div>
          <div className="label-eyebrow mb-1">Project</div>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus:border-accent outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="label-eyebrow mb-1">Date</div>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            required
            className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus:border-accent outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('range')}
            className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${mode === 'range' ? 'border-accent text-accent bg-accent/10' : 'border-base-700 text-base-400'}`}
          >
            Start / end time
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${mode === 'manual' ? 'border-accent text-accent bg-accent/10' : 'border-base-700 text-base-400'}`}
          >
            Manual duration
          </button>
        </div>

        {mode === 'range' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="label-eyebrow mb-1">Start</div>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus:border-accent outline-none"
              />
            </div>
            <div>
              <div className="label-eyebrow mb-1">End</div>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus:border-accent outline-none"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="label-eyebrow mb-1">Hours</div>
            <input
              type="number"
              step="0.25"
              min="0"
              value={manualHours}
              onChange={(e) => setManualHours(e.target.value)}
              className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 focus:border-accent outline-none"
            />
          </div>
        )}

        <div className="text-sm text-base-400">
          Duration: <span className="text-accent font-mono">{(durationMinutes / 60).toFixed(2)}h</span>
        </div>

        <div>
          <div className="label-eyebrow mb-1">Notes (optional)</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="What did you work on?"
            className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none resize-none"
          />
        </div>

        {message && (
          <div className={`text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</div>
        )}

        <button
          type="submit"
          disabled={saving || durationMinutes <= 0}
          className="bg-accent hover:bg-accent-soft transition-colors text-base-950 font-medium text-sm py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save entry'}
        </button>
      </form>
    </div>
  )
}
