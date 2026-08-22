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

      <form onSubmit={handleSubmit} className="card p-5 sm:p-7 flex flex-col gap-4.5 min-w-0 overflow-hidden shadow-lg">
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>Project</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-400">
              <svg className="w-4 h-4 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full min-w-0 bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors appearance-none cursor-pointer shadow-xs"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-base-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Date</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-400">
              <svg className="w-4 h-4 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              required
              className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
            />
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <div className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">Entry Mode</div>
          <div className="flex p-1 bg-base-850 rounded-xl border border-base-700 gap-1">
            <button
              type="button"
              onClick={() => setMode('range')}
              className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
                mode === 'range' 
                  ? 'border border-accent/30 text-accent bg-accent/15 shadow-xs' 
                  : 'text-base-400 hover:text-base-100'
              }`}
            >
              Start / End time
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 text-xs py-2 rounded-lg font-bold transition-all ${
                mode === 'manual' 
                  ? 'border border-accent/30 text-accent bg-accent/15 shadow-xs' 
                  : 'text-base-400 hover:text-base-100'
              }`}
            >
              Manual duration
            </button>
          </div>
        </div>

        {mode === 'range' ? (
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start Time</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  onClick={(e) => e.target.showPicker?.()}
                  className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>End Time</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  onClick={(e) => e.target.showPicker?.()}
                  className="w-full min-w-0 max-w-full bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
                />
              </div>
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
