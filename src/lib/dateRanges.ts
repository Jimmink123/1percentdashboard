export type DatePreset = 'all' | '7d' | 'month' | 'lastMonth'

export const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'all', label: 'All time' },
  { id: '7d', label: 'Last 7 days' },
  { id: 'month', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function getPresetRange(preset: DatePreset): { from: string; to: string } {
  const now = new Date()
  switch (preset) {
    case 'all':
      return { from: '', to: '' }
    case '7d': {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      return { from: toISODate(from), to: '' }
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: toISODate(from), to: '' }
    }
    case 'lastMonth': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: toISODate(from), to: toISODate(to) }
    }
  }
}
