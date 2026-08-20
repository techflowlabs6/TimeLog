import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function fmtHours(minutes) {
  return (minutes / 60).toFixed(1) + 'h'
}

export default function HoursPieChart({ title, data }) {
  const total = data.reduce((sum, d) => sum + d.minutes, 0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="card p-4 sm:p-5 flex flex-col justify-between min-w-0 overflow-hidden">
      <div className="flex items-baseline justify-between mb-2">
        <div className="label-eyebrow text-xs truncate">{title}</div>
        <div className="text-xs text-accent font-mono font-semibold">{fmtHours(total)} total</div>
      </div>

      {total === 0 ? (
        <div className="h-52 flex items-center justify-center text-xs text-base-400">
          No entries logged in this time frame.
        </div>
      ) : (
        <div>
          <div className="w-full h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 38 : 50}
                  outerRadius={isMobile ? 68 : 85}
                  paddingAngle={3}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#0a0b0f" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#161923', border: '1px solid #343b4f', borderRadius: 8, fontSize: 12 }}
                  formatter={(value, name) => [fmtHours(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Responsive Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-3 border-t border-base-800/80">
            {data.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-base-300 font-medium truncate max-w-[110px]">{item.name}:</span>
                <span className="font-mono text-base-100">{fmtHours(item.minutes)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
