import { getPresetRange, PRESETS } from '../lib/dateRanges'

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
  'rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm text-ink-950 ' +
  'transition-colors hover:border-primary/50 focus:border-primary focus:outline-none ' +
  'dark:border-white/10 dark:bg-ink-950 dark:text-ink-100 dark:hover:border-primary-light/60'

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

  function applyPreset(id: (typeof PRESETS)[number]['id']) {
    const range = getPresetRange(id)
    onDateFromChange(range.from)
    onDateToChange(range.to)
  }

  function isPresetActive(id: (typeof PRESETS)[number]['id']) {
    const range = getPresetRange(id)
    return dateFrom === range.from && dateTo === range.to
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-ink-900">
      {/* Quick date presets — the fast path for the client's monthly review. */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const active = isPresetActive(preset.id)
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              aria-pressed={active}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white dark:bg-primary-light dark:text-ink-950'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/5 dark:text-ink-300 dark:hover:bg-white/10'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-ink-100 pt-4 dark:border-white/5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-500 dark:text-ink-400" htmlFor="date-from">
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
          <label className="text-xs font-medium text-ink-500 dark:text-ink-400" htmlFor="date-to">
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
          <label className="text-xs font-medium text-ink-500 dark:text-ink-400" htmlFor="campaign">
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
            className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-ink-500 underline underline-offset-2 transition-colors hover:bg-ink-100 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-white/5 dark:hover:text-ink-100"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
