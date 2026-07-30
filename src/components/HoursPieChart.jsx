import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function fmtHours(minutes) {
  return (minutes / 60).toFixed(1) + 'h'
}

export default function HoursPieChart({ title, data }) {
  // data: [{ name, minutes, color }]
  const total = data.reduce((sum, d) => sum + d.minutes, 0)

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-2">
        <div className="label-eyebrow">{title}</div>
        <div className="text-xs text-base-400 font-mono">{fmtHours(total)} total</div>
      </div>
      {total === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-base-400">
          No entries yet in this range.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="minutes"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
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
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: '#c8cdda' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
