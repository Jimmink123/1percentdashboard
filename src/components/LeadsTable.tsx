import type { Lead } from '../types'
import { InboxIcon } from './icons'
import Skeleton from './Skeleton'

interface LeadsTableProps {
  leads: Lead[]
  loading: boolean
  filtersActive: boolean
  onClearFilters: () => void
}

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
  'sticky top-0 z-[1] bg-slate-50 px-4 py-3 font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400'

export default function LeadsTable({ leads, loading, filtersActive, onClearFilters }: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[32rem] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className={headerCellClasses}>First Name</th>
              <th className={headerCellClasses}>Last Name</th>
              <th className={headerCellClasses}>Source</th>
              <th className={headerCellClasses}>Campaign</th>
              <th className={headerCellClasses}>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
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
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{lead.first_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{lead.last_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.source || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.campaign || '—'}</td>
                  <td className="tabular px-4 py-3 text-slate-500 dark:text-slate-400">
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
