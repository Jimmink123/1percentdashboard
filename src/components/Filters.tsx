interface FiltersProps {
  campaigns: string[]
  campaign: string
  onCampaignChange: (value: string) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onReset: () => void
}

const inputClasses =
  'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 ' +
  'transition-colors hover:border-primary/50 focus:border-primary focus:outline-none ' +
  'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-primary-dark/60'

export default function Filters({
  campaigns,
  campaign,
  onCampaignChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: FiltersProps) {
  const hasActiveFilters = Boolean(dateFrom || dateTo || campaign)

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="date-from">
          From
        </label>
        <input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="date-to">
          To
        </label>
        <input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="campaign">
          Campaign
        </label>
        <select
          id="campaign"
          value={campaign}
          onChange={(e) => onCampaignChange(e.target.value)}
          className={`${inputClasses} cursor-pointer`}
        >
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-slate-500 underline underline-offset-2 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
