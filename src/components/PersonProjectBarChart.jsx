import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function fmtHours(minutes) {
  return (minutes / 60).toFixed(1) + 'h'
}

export default function PersonProjectBarChart({ rows, projects }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="card p-4 sm:p-5 flex flex-col justify-between min-w-0 overflow-hidden">
      <div className="label-eyebrow text-xs mb-3">Person × Project breakdown</div>
      {rows.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs text-base-400">
          No entries logged in this time frame.
        </div>
      ) : (
        <div>
          <div className="w-full h-64 sm:h-76">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ left: isMobile ? -20 : 0, right: 10, top: 10, bottom: isMobile ? 30 : 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242938" vertical={false} />
                <XAxis
                  dataKey="person"
                  tick={{ fill: '#8890a6', fontSize: isMobile ? 10 : 12 }}
                  interval={0}
                  angle={isMobile ? -35 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  axisLine={{ stroke: '#343b4f' }}
                />
                <YAxis
                  tick={{ fill: '#8890a6', fontSize: isMobile ? 10 : 12 }}
                  axisLine={{ stroke: '#343b4f' }}
                  tickFormatter={(v) => (v / 60).toFixed(0) + 'h'}
                />
                <Tooltip
                  contentStyle={{ background: '#161923', border: '1px solid #343b4f', borderRadius: 8, fontSize: 12 }}
                  formatter={(value, name) => [fmtHours(value), name]}
                />
                {projects.map((p) => (
                  <Bar key={p.id} dataKey={p.name} stackId="hours" fill={p.color_hex} radius={[0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Responsive Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 pt-3 border-t border-base-800/80">
            {projects.map((p) => (
              <div key={p.id} className="inline-flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color_hex }} />
                <span className="text-base-300 font-medium truncate max-w-[120px]">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
