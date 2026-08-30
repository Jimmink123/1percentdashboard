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
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-black/10 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-black/50" htmlFor="date-from">
          From
        </label>
        <input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-black/50" htmlFor="date-to">
          To
        </label>
        <input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-black/50" htmlFor="campaign">
          Campaign
        </label>
        <select
          id="campaign"
          value={campaign}
          onChange={(e) => onCampaignChange(e.target.value)}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm"
        >
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {(dateFrom || dateTo || campaign) && (
        <button
          onClick={onReset}
          className="rounded-md px-3 py-1.5 text-sm text-black/50 hover:text-black/80 underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
