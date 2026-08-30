import type { Lead } from '../types'

interface LeadsTableProps {
  leads: Lead[]
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

export default function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <div className="rounded-xl border border-black/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-black/50">
              <th className="px-4 py-3 font-medium">First Name</th>
              <th className="px-4 py-3 font-medium">Last Name</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-black/40">
                  No leads match the current filters
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">{lead.first_name || '—'}</td>
                  <td className="px-4 py-3">{lead.last_name || '—'}</td>
                  <td className="px-4 py-3">{lead.source || '—'}</td>
                  <td className="px-4 py-3">{lead.campaign || '—'}</td>
                  <td className="px-4 py-3 text-black/60">{formatDate(lead.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
