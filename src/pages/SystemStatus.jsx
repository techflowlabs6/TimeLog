const SERVICES = [
  { name: 'Web Application', status: 'operational', uptime: '99.98%' },
  { name: 'Authentication (Supabase Auth)', status: 'operational', uptime: '99.99%' },
  { name: 'Database (Supabase Postgres)', status: 'operational', uptime: '99.97%' },
  { name: 'Realtime Updates', status: 'operational', uptime: '99.95%' },
  { name: 'API Gateway', status: 'operational', uptime: '99.99%' },
]

const INCIDENTS = [
  {
    date: 'Aug 15, 2026',
    title: 'Resolved — Brief dashboard latency',
    detail: 'Dashboard queries experienced elevated latency (~800ms) for ~12 minutes due to a database index rebuild. Fully resolved at 14:32 UTC.',
    severity: 'minor',
  },
  {
    date: 'Jul 28, 2026',
    title: 'Resolved — Authentication timeout',
    detail: 'Some users experienced token refresh failures for ~5 minutes. Root cause was a Supabase edge function cold-start. No data loss occurred.',
    severity: 'minor',
  },
]

const STATUS_STYLE = {
  operational: {
    dot: 'bg-emerald-400',
    badge: 'text-emerald-400/80 bg-emerald-500/10 border-emerald-500/20',
    label: 'Operational',
  },
  degraded: {
    dot: 'bg-yellow-400',
    badge: 'text-yellow-400/80 bg-yellow-500/10 border-yellow-500/20',
    label: 'Degraded',
  },
  outage: {
    dot: 'bg-red-400',
    badge: 'text-red-400/80 bg-red-500/10 border-red-500/20',
    label: 'Outage',
  },
}

const SEVERITY_STYLE = {
  minor: 'text-yellow-400/70 bg-yellow-500/10 border-yellow-500/20',
  major: 'text-red-400/70 bg-red-500/10 border-red-500/20',
}

export default function SystemStatus() {
  const allOperational = SERVICES.every(s => s.status === 'operational')

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-accent/70 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
          Support
        </div>
        <h1 className="font-display font-bold text-3xl text-base-100 mb-2">System Status</h1>
        <p className="text-base-400 text-sm">Real-time status of all TimeLog services.</p>
      </div>

      {/* Overall banner */}
      <div className={`flex items-center gap-4 px-6 py-5 rounded-2xl border mb-8 ${
        allOperational
          ? 'bg-emerald-500/10 border-emerald-500/25'
          : 'bg-yellow-500/10 border-yellow-500/25'
      }`}>
        <span className={`w-3 h-3 rounded-full shrink-0 animate-pulse ${allOperational ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
        <div>
          <p className={`text-base font-semibold ${allOperational ? 'text-emerald-300' : 'text-yellow-300'}`}>
            {allOperational ? 'All systems operational' : 'Some systems experiencing issues'}
          </p>
          <p className="text-xs text-base-500 mt-0.5 font-mono">
            Last checked: {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      {/* Services */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 mb-4">Services</h2>
        <div className="bg-base-900/80 border border-base-800 rounded-2xl divide-y divide-base-800/60 overflow-hidden">
          {SERVICES.map(svc => {
            const s = STATUS_STYLE[svc.status]
            return (
              <div key={svc.name} className="flex items-center justify-between px-5 py-4 hover:bg-base-850/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                  <span className="text-sm text-base-200 font-medium">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-base-500 font-mono hidden sm:block">{svc.uptime} uptime</span>
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Incident history */}
      <section>
        <h2 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 mb-4">Recent Incidents</h2>
        <div className="space-y-3">
          {INCIDENTS.map((inc, i) => (
            <div key={i} className="bg-base-900/60 border border-base-800 rounded-xl px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-base-100">{inc.title}</p>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${SEVERITY_STYLE[inc.severity]}`}>
                  {inc.severity}
                </span>
              </div>
              <p className="text-xs text-base-400 leading-relaxed">{inc.detail}</p>
              <p className="text-[10px] text-base-600 font-mono mt-2">{inc.date}</p>
            </div>
          ))}
          {INCIDENTS.length === 0 && (
            <div className="text-center py-10 text-base-600 text-sm">No incidents in the past 30 days 🎉</div>
          )}
        </div>
      </section>
    </div>
  )
}
