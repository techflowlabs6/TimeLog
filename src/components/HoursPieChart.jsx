import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../context/ThemeContext'

function fmtHours(minutes) {
  return (minutes / 60).toFixed(1) + 'h'
}

export default function HoursPieChart({ title, data }) {
  const total = data.reduce((sum, d) => sum + d.minutes, 0)
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()
  const isLight = theme === 'light'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const strokeColor = isLight ? '#ffffff' : '#0d1017'
  const tooltipBg = isLight ? '#ffffff' : '#141823'
  const tooltipBorder = isLight ? '#cbd5e1' : '#2d3750'
  const tooltipText = isLight ? '#0f172a' : '#f8faff'

  return (
    <div className="card p-5 sm:p-6 flex flex-col justify-between min-w-0 overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-base-800/60">
        <div className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 truncate">
          {title}
        </div>
        <div className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 shadow-xs">
          {fmtHours(total)} total
        </div>
      </div>

      {total === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs font-medium text-base-400">
          No entries logged in this time frame.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Donut Chart Visual */}
          <div className="w-full h-44 sm:h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 42 : 55}
                  outerRadius={isMobile ? 68 : 84}
                  paddingAngle={3}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke={strokeColor} strokeWidth={2.5} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: isLight ? '0 10px 25px -5px rgba(0,0,0,0.1)' : '0 10px 25px -5px rgba(0,0,0,0.5)',
                    color: tooltipText
                  }}
                  itemStyle={{ color: tooltipText, fontWeight: 500 }}
                  labelStyle={{ color: tooltipText, fontWeight: 700 }}
                  formatter={(value, name) => [fmtHours(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label in Donut Hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Total</span>
              <span className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {fmtHours(total)}
              </span>
            </div>
          </div>

          {/* Detailed Breakdown Rows */}
          <div className="space-y-2 pt-2 border-t border-base-800/80 max-h-56 overflow-y-auto pr-1">
            {data.map((item, idx) => {
              const percent = total > 0 ? Math.round((item.minutes / total) * 100) : 0
              return (
                <div key={idx} className="group p-2 rounded-xl hover:bg-base-850/60 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10" style={{ background: item.color }} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{percent}%</span>
                      <span className="font-bold text-slate-950 dark:text-white">{fmtHours(item.minutes)}</span>
                    </div>
                  </div>
                  {/* Proportion mini bar */}
                  <div className="w-full h-1.5 bg-base-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${percent}%`, background: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
