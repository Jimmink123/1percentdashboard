import { Fragment, useState } from 'react'
import type { Lead } from '../types'
import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon, ClipboardIcon, InboxIcon } from './icons'
import Skeleton from './Skeleton'

export type SortableColumn = 'source' | 'campaign' | 'created_at'
export type SortDirection = 'asc' | 'desc'

interface LeadsTableProps {
  leads: Lead[]
  loading: boolean
  filtersActive: boolean
  onClearFilters: () => void
  justArrivedId?: Lead['id'] | null
  sortBy: SortableColumn | null
  sortDir: SortDirection
  onSort: (column: SortableColumn) => void
}

const COLUMN_COUNT = 8

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const headerCellClasses =
  'sticky top-0 z-[1] whitespace-nowrap bg-ink-50 px-4 py-3 font-medium text-ink-500 dark:bg-ink-900 dark:text-ink-400'

function SortableHeader({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
}: {
  label: string
  column: SortableColumn
  sortBy: SortableColumn | null
  sortDir: SortDirection
  onSort: (column: SortableColumn) => void
}) {
  const active = sortBy === column
  return (
    <th
      className={headerCellClasses}
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="flex cursor-pointer items-center gap-1 transition-colors hover:text-ink-800 dark:hover:text-ink-100"
      >
        {label}
        {active ? (
          <ChevronDownIcon
            className={`h-3.5 w-3.5 text-primary transition-transform dark:text-primary-light ${
              sortDir === 'asc' ? 'rotate-180' : ''
            }`}
          />
        ) : (
          <ChevronUpDownIcon className="h-3.5 w-3.5 text-ink-300 dark:text-ink-600" />
        )}
      </button>
    </th>
  )
}

function FbclidDetail({ fbclid }: { fbclid: string | null }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!fbclid) return
    try {
      await navigator.clipboard.writeText(fbclid)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable/blocked — not critical, user can still
      // select the text manually.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium text-ink-500 dark:text-ink-400">fbclid</span>
      {fbclid ? (
        <>
          <code className="break-all rounded bg-ink-100 px-1.5 py-0.5 font-mono text-ink-700 dark:bg-white/10 dark:text-ink-200">
            {fbclid}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy fbclid"
            className="cursor-pointer rounded p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <ClipboardIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </>
      ) : (
        <span className="italic text-ink-400 dark:text-ink-500">Not captured</span>
      )}
    </div>
  )
}

export default function LeadsTable({
  leads,
  loading,
  filtersActive,
  onClearFilters,
  justArrivedId,
  sortBy,
  sortDir,
  onSort,
}: LeadsTableProps) {
  const [expandedId, setExpandedId] = useState<Lead['id'] | null>(null)

  function toggleExpanded(id: Lead['id']) {
    setExpandedId((current) => (current === id ? null : id))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm dark:border-white/5 dark:bg-ink-900">
      <div className="max-h-[32rem] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 dark:border-white/5">
              <th className={`${headerCellClasses} w-8`}>
                <span className="sr-only">Expand</span>
              </th>
              <th className={headerCellClasses}>First Name</th>
              <th className={headerCellClasses}>Last Name</th>
              <SortableHeader label="Source" column="source" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
              <th className={headerCellClasses}>Medium</th>
              <SortableHeader
                label="Campaign"
                column="campaign"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th className={headerCellClasses}>Ad</th>
              <SortableHeader
                label="Date"
                column="created_at"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-ink-100 last:border-0 dark:border-white/5">
                  {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-ink-400 dark:text-ink-500">
                    <InboxIcon className="h-8 w-8" />
                    <p className="text-sm">No leads match the current filters</p>
                    {filtersActive && (
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="cursor-pointer text-sm text-primary underline underline-offset-2 hover:text-primary-light dark:text-primary-dark"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const expanded = expandedId === lead.id
                return (
                  <Fragment key={lead.id}>
                    <tr
                      className={`border-b border-ink-100 transition-colors last:border-0 hover:bg-ink-50 dark:border-white/5 dark:hover:bg-white/5 ${
                        lead.id === justArrivedId ? 'animate-row-flash' : ''
                      } ${expanded ? 'bg-ink-50 dark:bg-white/5' : ''}`}
                    >
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(lead.id)}
                          aria-expanded={expanded}
                          aria-label={expanded ? 'Hide fbclid' : 'Show fbclid'}
                          className="flex cursor-pointer items-center justify-center rounded p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <ChevronDownIcon
                            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-950 dark:text-ink-100">
                        {lead.first_name || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-950 dark:text-ink-100">
                        {lead.last_name || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-600 dark:text-ink-300">
                        {lead.source || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-600 dark:text-ink-300">
                        {lead.medium || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-600 dark:text-ink-300">
                        {lead.campaign || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-600 dark:text-ink-300">
                        {lead.ad || '—'}
                      </td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-ink-500 dark:text-ink-400">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b border-ink-100 bg-ink-50/60 dark:border-white/5 dark:bg-white/[0.03]">
                        <td></td>
                        <td colSpan={COLUMN_COUNT - 1} className="px-4 py-2.5">
                          <FbclidDetail fbclid={lead.fbclid} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
