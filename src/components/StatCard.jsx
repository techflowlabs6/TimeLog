const VARIANTS = {
  indigo: {
    borderGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    shadowGlow: 'shadow-[0_0_20px_rgba(99,102,241,0.22)]',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/40',
    iconColor: 'text-indigo-600 dark:text-indigo-300',
    pillBg: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200 border-indigo-200 dark:border-indigo-500/40',
  },
  emerald: {
    borderGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    shadowGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.22)]',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/40',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    pillBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/40',
  },
  sky: {
    borderGradient: 'from-sky-400 via-blue-500 to-indigo-500',
    shadowGlow: 'shadow-[0_0_20px_rgba(14,165,233,0.22)]',
    badgeBg: 'bg-sky-50 dark:bg-sky-500/20 border-sky-200 dark:border-sky-500/40',
    iconColor: 'text-sky-600 dark:text-sky-300',
    pillBg: 'bg-sky-50 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200 border-sky-200 dark:border-sky-500/40',
  },
  amber: {
    borderGradient: 'from-amber-400 via-orange-500 to-rose-500',
    shadowGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.22)]',
    badgeBg: 'bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/40',
    iconColor: 'text-amber-700 dark:text-amber-300',
    pillBg: 'bg-amber-50 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200 border-amber-200 dark:border-amber-500/40',
  },
}

export default function StatCard({ label, value, sublabel, sub, icon, variant = 'indigo' }) {
  const v = VARIANTS[variant] || VARIANTS.indigo
  const displaySub = sublabel || sub

  return (
    <div className={`p-[1.5px] rounded-2xl bg-gradient-to-br ${v.borderGradient} ${v.shadowGlow} transition-all duration-300 hover:scale-[1.01] min-w-0 max-w-full box-border`}>
      <div className="bg-base-900/95 dark:bg-base-900/95 rounded-[15px] p-4 sm:p-5 min-w-0 max-w-full overflow-hidden relative group backdrop-blur-md box-border">
        <div className="flex items-start justify-between gap-2 mb-1.5 min-w-0">
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

        {displaySub && (
          <div className="mt-2.5 flex items-center min-w-0">
            <span className={`inline-flex items-center text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${v.pillBg} truncate shadow-xs`}>
              {displaySub}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
