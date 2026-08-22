const VARIANTS = {
  indigo: {
    badgeBg: 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    topGlow: 'from-transparent via-indigo-500/40 to-transparent group-hover:via-indigo-500',
    pillBg: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  },
  emerald: {
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    topGlow: 'from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-500',
    pillBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  },
  sky: {
    badgeBg: 'bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30',
    iconColor: 'text-sky-600 dark:text-sky-400',
    topGlow: 'from-transparent via-sky-500/40 to-transparent group-hover:via-sky-500',
    pillBg: 'bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
  },
  amber: {
    badgeBg: 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30',
    iconColor: 'text-amber-700 dark:text-amber-400',
    topGlow: 'from-transparent via-amber-500/40 to-transparent group-hover:via-amber-500',
    pillBg: 'bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  },
}

export default function StatCard({ label, value, sublabel, icon, variant = 'indigo' }) {
  const v = VARIANTS[variant] || VARIANTS.indigo

  return (
    <div className="card p-4 sm:p-5 min-w-0 overflow-hidden relative group hover:border-accent/50 hover:-translate-y-0.5 transition-all">
      {/* Top indicator glowing bar */}
      <div className={`absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r ${v.topGlow} transition-all duration-300`} />

      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 truncate">
          {label}
        </div>
        {icon && (
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${v.badgeBg} ${v.iconColor} shadow-xs`}>
            {icon}
          </div>
        )}
      </div>

      <div className="font-display text-2xl sm:text-3xl lg:text-[2.15rem] font-black tracking-tight text-slate-950 dark:text-white mt-1 truncate">
        {value}
      </div>

      {sublabel && (
        <div className="mt-2.5 flex items-center">
          <span className={`inline-flex items-center text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${v.pillBg} truncate`}>
            {sublabel}
          </span>
        </div>
      )}
    </div>
  )
}
