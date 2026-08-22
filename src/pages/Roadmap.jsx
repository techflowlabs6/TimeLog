import { useEffect, useState } from 'react'

const STORAGE_KEY = 'timelog_roadmap_progress_v1'

const RELEASES = [
  {
    id: 'v1.0',
    title: 'v1.0 — Shipped',
    status: 'shipped',
    blurb: 'The current live version.',
    items: [
      'Supabase auth — Google OAuth + email/password',
      '5-project time tracking with RLS security',
      'Log Time — start/end or manual duration entry',
      'My Entries — edit notes, delete',
      'Team dashboard — pie charts by project & by person',
      'Person × project stacked bar chart',
      'Stat cards — all-time / week / month totals',
      'Date range + project filters',
      'Admin-only project CRUD with color picker'
    ]
  },
  {
    id: 'v1.1',
    title: 'v1.1 — Everyday friction removal',
    status: 'next',
    blurb: 'Small things that get used every single day.',
    items: [
      'Mobile polish + responsive navigation drawer & touch cards',
      'CSV export of filtered team dashboard & personal entries',
      'Start/stop timer button, not just manual entry',
      'Edit full entry (date, project, duration) in My Entries',
      'Toast notifications instead of inline text'
    ]
  },
  {
    id: 'v1.2',
    title: 'v1.2 — Team accountability',
    status: 'planned',
    blurb: 'For once more than a couple of people are logging time.',
    items: [
      'Per-project hour budgets with progress bar + over-budget alert',
      'Manager role scoped to specific projects',
      'Audit log — who edited or deleted which entry',
      'Bulk CSV import of past entries',
      'Slack/Discord webhook when time is logged',
      'Search entries by notes text'
    ]
  },
  {
    id: 'v2.0',
    title: 'v2.0 — Scale & money',
    status: 'later',
    blurb: 'Once the basics are solid and it needs to earn its keep.',
    items: [
      'Multi-workspace support (org switcher)',
      'Turn logged hours into a client-ready PDF invoice',
      'Submit → manager-approval workflow',
      'Timezone-aware entries for distributed teams',
      'Webhook/API to push hours into accounting tools',
      'Utilization analytics — estimated vs. actual per person'
    ]
  }
]

const STATUS_STYLE = {
  shipped: { label: 'Shipped', color: '#22c55e' },
  next: { label: 'Next up', color: '#7c9eff' },
  planned: { label: 'Planned', color: '#f59e0b' },
  later: { label: 'Later', color: '#8890a6' }
}

export default function Roadmap() {
  const [checked, setChecked] = useState({})

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      setChecked(saved)
    } catch {
      setChecked({})
    }
  }, [])

  function toggle(releaseId, idx) {
    const key = `${releaseId}:${idx}`
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-base-100 mb-1">Roadmap</h1>
        <p className="text-xs sm:text-sm text-base-400">
          Where TimeLog is today, and what's planned for the upcoming releases. Tick items off as you ship them —
          progress is saved locally on this device.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {RELEASES.map((release) => {
          const style = STATUS_STYLE[release.status]
          const doneCount = release.items.filter((_, i) => checked[`${release.id}:${i}`]).length
          const isShippedRelease = release.status === 'shipped'

          return (
            <div key={release.id} className="card p-5 sm:p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="text-xs font-mono px-3 py-1 rounded-full border font-bold"
                    style={{ color: style.color, borderColor: `${style.color}55`, background: `${style.color}14` }}
                  >
                    {style.label}
                  </span>
                  <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">{release.title}</h2>
                </div>
                {!isShippedRelease && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                    Progress: <strong className="text-accent font-extrabold">{doneCount}/{release.items.length}</strong>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mb-4 leading-relaxed">{release.blurb}</p>

              <ul className="flex flex-col gap-2">
                {release.items.map((item, i) => {
                  const key = `${release.id}:${i}`
                  const isChecked = isShippedRelease ? true : !!checked[key]
                  return (
                    <li key={key}>
                      <label className={`flex items-start gap-3 p-2.5 rounded-xl text-xs sm:text-sm transition-colors ${
                        isShippedRelease ? 'cursor-default' : 'cursor-pointer hover:bg-base-850/60'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isShippedRelease}
                          onChange={() => toggle(release.id, i)}
                          className="mt-0.5 accent-accent w-4 h-4 rounded shrink-0 cursor-pointer"
                        />
                        <span className={isChecked ? 'text-slate-400 dark:text-slate-500 line-through font-medium' : 'text-slate-900 dark:text-slate-100 font-semibold'}>{item}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
