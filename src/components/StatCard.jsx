export default function StatCard({ label, value, sublabel }) {
  return (
    <div className="card p-3.5 sm:p-4 min-w-0 overflow-hidden">
      <div className="label-eyebrow text-[10px] sm:text-xs truncate">{label}</div>
      <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-base-100 mt-1 truncate">{value}</div>
      {sublabel && <div className="text-[10px] sm:text-xs text-base-400 mt-0.5 truncate">{sublabel}</div>}
    </div>
  )
}
