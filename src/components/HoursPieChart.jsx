import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
    <div className="card p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="label-eyebrow">{title}</div>
        <div className="text-xs text-base-400 font-mono">{fmtHours(total)} total</div>
      </div>
      {total === 0 ? (
        <div className="h-56 sm:h-64 flex items-center justify-center text-sm text-base-400">
          No entries yet in this range.
        </div>
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="minutes"
                nameKey="name"
                cx="50%"
                cy={isMobile ? '42%' : '50%'}
                innerRadius={isMobile ? 40 : 50}
                outerRadius={isMobile ? 70 : 85}
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
              <Legend
                layout={isMobile ? 'horizontal' : 'vertical'}
                align={isMobile ? 'center' : 'right'}
                verticalAlign={isMobile ? 'bottom' : 'middle'}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: '#c8cdda', paddingTop: isMobile ? 10 : 0 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
