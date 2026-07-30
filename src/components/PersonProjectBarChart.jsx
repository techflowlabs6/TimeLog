import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

function fmtHours(minutes) {
  return (minutes / 60).toFixed(1) + 'h'
}

export default function PersonProjectBarChart({ rows, projects }) {
  // rows: [{ person, [projectName]: minutes, ... }]
  return (
    <div className="card p-5">
      <div className="label-eyebrow mb-3">Person × Project breakdown</div>
      {rows.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-base-400">
          No entries yet in this range.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#242938" vertical={false} />
            <XAxis dataKey="person" tick={{ fill: '#8890a6', fontSize: 12 }} axisLine={{ stroke: '#343b4f' }} />
            <YAxis
              tick={{ fill: '#8890a6', fontSize: 12 }}
              axisLine={{ stroke: '#343b4f' }}
              tickFormatter={(v) => (v / 60).toFixed(0) + 'h'}
            />
            <Tooltip
              contentStyle={{ background: '#161923', border: '1px solid #343b4f', borderRadius: 8, fontSize: 12 }}
              formatter={(value, name) => [fmtHours(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#c8cdda' }} />
            {projects.map((p) => (
              <Bar key={p.id} dataKey={p.name} stackId="hours" fill={p.color_hex} radius={[0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
