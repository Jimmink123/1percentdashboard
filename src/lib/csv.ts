import type { Lead } from '../types'

function escapeCsvField(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    'first_name',
    'last_name',
    'source',
    'medium',
    'campaign',
    'ad',
    'fbclid',
    'created_at',
  ]
  const rows = leads.map((lead) =>
    headers.map((key) => escapeCsvField(lead[key as keyof Lead])).join(','),
  )
  return [headers.join(','), ...rows].join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
