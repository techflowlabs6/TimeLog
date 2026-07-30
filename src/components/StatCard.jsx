export default function StatCard({ label, value, sublabel }) {
  return (
    <div className="card p-5">
      <div className="label-eyebrow">{label}</div>
      <div className="font-display text-3xl font-semibold text-base-100 mt-2">{value}</div>
      {sublabel && <div className="text-xs text-base-400 mt-1">{sublabel}</div>}
    </div>
  )
}
