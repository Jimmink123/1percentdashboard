import { useCallback, useEffect, useRef, useState } from 'react'
import { getPresetRange, PRESETS } from '../lib/dateRanges'
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, XMarkIcon } from './icons'

interface FiltersProps {
  campaigns: string[]
  campaign: string
  onCampaignChange: (value: string) => void
  sources: string[]
  source: string
  onSourceChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
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
  sources,
  source,
  onSourceChange,
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: FiltersProps) {
  const hasActiveFilters = Boolean(dateFrom || dateTo || campaign || source || search)

  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  function scrollPresetsBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

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
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name…"
          aria-label="Search by name"
          className={`${inputClasses} w-full pl-9 ${search ? 'pr-9' : 'pr-3'}`}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Quick date presets — the fast path for the client's monthly review.
          Horizontal scroll (rather than wrapping to a second line) keeps
          this a single tidy row on narrow screens, with arrow buttons as
          the visible affordance that there's more to scroll to. */}
      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-white pr-4 dark:from-ink-900">
            <button
              type="button"
              onClick={() => scrollPresetsBy(-140)}
              aria-label="Scroll presets left"
              className="cursor-pointer rounded-full border border-ink-200 bg-white p-1 text-ink-500 shadow-sm transition-colors hover:text-ink-800 dark:border-white/10 dark:bg-ink-800 dark:text-ink-300 dark:hover:text-white"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        <div
          ref={scrollerRef}
          className="scrollbar-hide flex flex-nowrap gap-2 overflow-x-auto scroll-smooth"
        >
          {PRESETS.map((preset) => {
            const active = isPresetActive(preset.id)
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                aria-pressed={active}
                className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition-all active:scale-95 ${
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
        {canScrollRight && (
          <div className="absolute right-0 top-0 z-10 flex h-full items-center bg-gradient-to-l from-white pl-4 dark:from-ink-900">
            <button
              type="button"
              onClick={() => scrollPresetsBy(140)}
              aria-label="Scroll presets right"
              className="cursor-pointer rounded-full border border-ink-200 bg-white p-1 text-ink-500 shadow-sm transition-colors hover:text-ink-800 dark:border-white/10 dark:bg-ink-800 dark:text-ink-300 dark:hover:text-white"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
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
          <label className="text-xs font-medium text-ink-500 dark:text-ink-400" htmlFor="source">
            Source
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            className={`${inputClasses} cursor-pointer`}
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
