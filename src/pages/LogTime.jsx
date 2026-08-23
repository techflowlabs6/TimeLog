import { useEffect, useState } from 'react'
import { fetchProjects, saveTimeEntry } from '../lib/dataStore'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function minutesBetween(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff < 0) diff += 24 * 60
  return diff
}

export default function LogTime() {
  const { user } = useAuth()
  const toast = useToast()
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [mode, setMode] = useState('range')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [manualHours, setManualHours] = useState('1')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProjects().then((data) => {
      const active = (data || []).filter(p => p.is_active !== false)
      setProjects(active)
      if (active.length) setProjectId(active[0].id)
    })
  }, [])

  useEffect(() => {
    let interval = null
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  const durationMinutes = mode === 'range'
    ? minutesBetween(startTime, endTime)
    : mode === 'manual'
    ? Math.round(parseFloat(manualHours || '0') * 60)
    : Math.max(1, Math.round(timerSeconds / 60))

  function formatTimerDisplay(secs) {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setSaving(true)
    const { error } = await saveTimeEntry({
      user_id: user?.id || 'usr-1',
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
      toast.error(`Failed to log entry: ${error.message}`)
    } else {
      const pName = projects.find(p => p.id === projectId)?.name || 'project'
      toast.success(`✨ ${(durationMinutes / 60).toFixed(1)}h logged on ${pName}!`)
      setMessage('Entry logged successfully!')
      setNotes('')
      if (mode === 'timer') {
        setTimerRunning(false)
        setTimerSeconds(0)
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 min-w-0 max-w-full overflow-hidden px-1 sm:px-0">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-base-100">Log Time</h1>
        <p className="text-xs sm:text-sm text-base-400 mt-0.5">Record time spent on a project. Duration calculates automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 sm:p-7 flex flex-col gap-4 sm:gap-5 min-w-0 max-w-full overflow-hidden shadow-lg box-border">
        {/* Project Selector */}
        <div className="w-full min-w-0 max-w-full">
          <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>Project</span>
          </label>
          <div className="w-full min-w-0 max-w-full relative">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full min-w-0 max-w-full box-border bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors appearance-none cursor-pointer shadow-xs"
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

        {/* Date Selector */}
        <div className="w-full min-w-0 max-w-full">
          <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
            <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Date</span>
          </label>
          <div className="w-full min-w-0 max-w-full">
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              required
              className="w-full min-w-0 max-w-full box-border bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
            />
          </div>
        </div>

        {/* Mode Selector */}
        <div className="w-full min-w-0 max-w-full">
          <div className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">Entry Mode</div>
          <div className="grid grid-cols-3 p-1 bg-base-850 rounded-xl border border-base-700 gap-1 w-full min-w-0 max-w-full box-border overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('range')}
              className={`text-[11px] sm:text-xs py-2 px-1 rounded-lg font-bold transition-all text-center truncate ${
                mode === 'range' 
                  ? 'border border-accent/30 text-accent bg-accent/15 shadow-xs' 
                  : 'text-base-400 hover:text-base-100'
              }`}
            >
              Start / End
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`text-[11px] sm:text-xs py-2 px-1 rounded-lg font-bold transition-all text-center truncate ${
                mode === 'manual' 
                  ? 'border border-accent/30 text-accent bg-accent/15 shadow-xs' 
                  : 'text-base-400 hover:text-base-100'
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setMode('timer')}
              className={`text-[11px] sm:text-xs py-2 px-1 rounded-lg font-bold transition-all text-center truncate flex items-center justify-center gap-1 ${
                mode === 'timer' 
                  ? 'border border-accent/30 text-accent bg-accent/15 shadow-xs' 
                  : 'text-base-400 hover:text-base-100'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${timerRunning ? 'bg-emerald-400 animate-pulse' : 'bg-base-600'}`} />
              Timer
            </button>
          </div>
        </div>

        {/* Live Timer Mode Card */}
        {mode === 'timer' && (
          <div className="w-full min-w-0 max-w-full p-4 sm:p-5 rounded-2xl bg-base-900 border border-accent/30 flex flex-col items-center justify-center gap-3 shadow-inner box-border overflow-hidden">
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              {timerRunning ? 'Live Recording Active…' : 'Timer Ready / Paused'}
            </div>
            <div className="font-mono text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-wider">
              {formatTimerDisplay(timerSeconds)}
            </div>
            <div className="text-xs font-mono text-accent font-semibold">
              ≈ {(durationMinutes / 60).toFixed(2)} hours tracked
            </div>
            <div className="flex items-center gap-2 mt-1">
              {!timerRunning ? (
                <button
                  type="button"
                  onClick={() => setTimerRunning(true)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  {timerSeconds === 0 ? 'Start Timer' : 'Resume'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTimerRunning(false)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </button>
              )}
              {timerSeconds > 0 && (
                <button
                  type="button"
                  onClick={() => { setTimerRunning(false); setTimerSeconds(0) }}
                  className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-base-800 hover:bg-base-700 text-base-300 font-semibold text-xs transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* Start / End Time Mode */}
        {mode === 'range' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full min-w-0 max-w-full overflow-hidden box-border">
            <div className="w-full min-w-0 max-w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start Time</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full min-w-0 max-w-full box-border bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
              />
            </div>
            <div className="w-full min-w-0 max-w-full">
              <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>End Time</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full min-w-0 max-w-full box-border bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors shadow-xs cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Manual Duration Mode */}
        {mode === 'manual' && (
          <div className="w-full min-w-0 max-w-full overflow-hidden">
            <label className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Duration (hours)</span>
            </label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={manualHours}
              onChange={(e) => setManualHours(e.target.value)}
              placeholder="e.g. 1.5"
              required
              className="w-full min-w-0 max-w-full box-border bg-base-850 border border-base-700 hover:border-base-600 focus:border-accent rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-base-100 outline-none transition-colors shadow-xs"
            />
          </div>
        )}

        {/* Duration Preview Pill */}
        <div className="w-full min-w-0 max-w-full bg-base-850/80 border border-base-800 rounded-xl p-3 flex items-center justify-between text-xs text-base-300 box-border overflow-hidden">
          <span>Calculated Duration:</span>
          <span className="text-accent font-mono text-sm sm:text-base font-bold">{(durationMinutes / 60).toFixed(2)}h</span>
        </div>

        {/* Notes input */}
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="label-eyebrow text-[10px] sm:text-xs mb-1.5">Notes (optional)</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="What did you work on?"
            className="w-full min-w-0 max-w-full box-border bg-base-850 border border-base-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none resize-none"
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
          className="w-full min-w-0 max-w-full bg-accent hover:bg-accent-soft transition-all text-base-950 font-bold text-xs sm:text-sm py-3 rounded-xl disabled:opacity-50 mt-1 shadow-md active:scale-95 box-border"
        >
          {saving ? 'Saving entry…' : 'Save time entry'}
        </button>
      </form>
    </div>
  )
}
