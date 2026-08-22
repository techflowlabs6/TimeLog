import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTheme } from '../context/ThemeContext'

function fmtHours(minutes) {
  return (minutes / 60).toFixed(1) + 'h'
}

export default function PersonProjectBarChart({ rows, projects }) {
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()
  const isLight = theme === 'light'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const gridStroke = isLight ? '#e2e8f0' : '#1e2536'
  const axisText = isLight ? '#475569' : '#a0aecc'
  const axisLineStroke = isLight ? '#cbd5e1' : '#2d3750'
  const tooltipBg = isLight ? '#ffffff' : '#141823'
  const tooltipBorder = isLight ? '#cbd5e1' : '#2d3750'
  const tooltipText = isLight ? '#0f172a' : '#f8faff'

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
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="person"
                  tick={{ fill: axisText, fontSize: isMobile ? 10 : 12, fontWeight: 500 }}
                  interval={0}
                  angle={isMobile ? -35 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  axisLine={{ stroke: axisLineStroke }}
                />
                <YAxis
                  tick={{ fill: axisText, fontSize: isMobile ? 10 : 12, fontWeight: 500 }}
                  axisLine={{ stroke: axisLineStroke }}
                  tickFormatter={(v) => (v / 60).toFixed(0) + 'h'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: isLight ? '0 10px 25px -5px rgba(0,0,0,0.1)' : '0 10px 25px -5px rgba(0,0,0,0.5)',
                    color: tooltipText
                  }}
                  itemStyle={{ color: tooltipText }}
                  labelStyle={{ color: tooltipText, fontWeight: 600 }}
                  formatter={(value, name) => [fmtHours(value), name]}
                />
                {projects.map((p) => (
                  <Bar key={p.id} dataKey={p.name} stackId="hours" fill={p.color_hex} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Responsive Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 pt-3 border-t border-base-800/80">
            {projects.map((p) => (
              <div key={p.id} className="inline-flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ background: p.color_hex }} />
                <span className="text-base-400 font-medium truncate max-w-[120px]">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
