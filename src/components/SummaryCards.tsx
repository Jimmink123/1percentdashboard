interface SummaryCardsProps {
  totalAllTime: number
  totalThisMonth: number
}

export default function SummaryCards({ totalAllTime, totalThisMonth }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <div className="text-sm text-black/50">Total leads (all-time)</div>
        <div className="mt-1 text-4xl font-semibold tabular-nums">{totalAllTime}</div>
      </div>
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <div className="text-sm text-black/50">Leads this month</div>
        <div className="mt-1 text-4xl font-semibold tabular-nums">{totalThisMonth}</div>
      </div>
    </div>
  )
}
