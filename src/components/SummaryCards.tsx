import { CalendarIcon, UsersIcon } from './icons'
import Skeleton from './Skeleton'

interface SummaryCardsProps {
  totalAllTime: number
  totalThisMonth: number
  loading: boolean
}

function Card({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="text-primary dark:text-primary-dark">{icon}</span>
        {label}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-10 w-24" />
      ) : (
        <div className="tabular mt-1 text-4xl font-semibold text-slate-900 dark:text-white">
          {value.toLocaleString()}
        </div>
      )}
    </div>
  )
}

export default function SummaryCards({ totalAllTime, totalThisMonth, loading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card
        icon={<UsersIcon className="h-5 w-5" />}
        label="Total leads (all-time)"
        value={totalAllTime}
        loading={loading}
      />
      <Card
        icon={<CalendarIcon className="h-5 w-5" />}
        label="Leads this month"
        value={totalThisMonth}
        loading={loading}
      />
    </div>
  )
}
