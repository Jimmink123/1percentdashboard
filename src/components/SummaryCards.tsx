import { CalendarIcon, UsersIcon } from './icons'
import Skeleton from './Skeleton'

interface SummaryCardsProps {
  totalAllTime: number
  totalThisMonth: number
  loading: boolean
}

function Card({
  icon,
  iconClasses,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode
  iconClasses: string
  label: string
  value: number
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-ink-900">
      <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
        <span className={iconClasses}>{icon}</span>
        {label}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-10 w-24" />
      ) : (
        <div className="tabular mt-1 text-4xl font-semibold text-ink-950 dark:text-white">
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
        iconClasses="text-primary dark:text-primary-light"
        label="Total leads (all-time)"
        value={totalAllTime}
        loading={loading}
      />
      <Card
        icon={<CalendarIcon className="h-5 w-5" />}
        iconClasses="text-accent dark:text-accent-dark"
        label="Leads this month"
        value={totalThisMonth}
        loading={loading}
      />
    </div>
  )
}
