import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { usePrefersDark, usePrefersReducedMotion } from '../hooks/useMediaPreferences'
import { ChartBarIcon, InboxIcon } from './icons'
import Skeleton from './Skeleton'

interface CampaignChartProps {
  data: { campaign: string; count: number }[]
  loading: boolean
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const { campaign, count } = payload[0].payload as { campaign: string; count: number }
  return (
    <div className="rounded-2xl border border-ink-200 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur dark:border-white/10 dark:bg-ink-900/95">
      <div className="mb-2 text-ink-500 dark:text-ink-400">{campaign}</div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-ink-600 dark:text-ink-300">
          <span className="h-2.5 w-2.5 rounded-full bg-primary dark:bg-primary-light" />
          Leads
        </span>
        <span className="tabular ml-auto text-base font-semibold text-ink-950 dark:text-white">
          {count}
        </span>
      </div>
    </div>
  )
}

export default function CampaignChart({ data, loading }: CampaignChartProps) {
  const prefersDark = usePrefersDark()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const gridColor = prefersDark ? '#211A38' : '#E1DEF2'
  const axisColor = prefersDark ? '#726B99' : '#726B99'
  const maxCount = data.reduce((max, d) => Math.max(max, d.count), 0)

  const summary =
    data.length === 0
      ? 'No leads match the current filters.'
      : `Leads by campaign: ${data.map((d) => `${d.campaign}, ${d.count} leads`).join('; ')}.`

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-ink-900">
      <div className="mb-2 flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
        <ChartBarIcon className="h-4 w-4" />
        Leads by campaign
      </div>
      <p className="sr-only">{summary}</p>
      {loading ? (
        <div className="flex h-[280px] items-end gap-6 px-4 pb-8">
          {[0.5, 0.9, 0.3, 0.7].map((h, i) => (
            <Skeleton key={i} className="w-16" style={{ height: `${h * 100}%` }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-ink-400 dark:text-ink-500">
          <InboxIcon className="h-8 w-8" />
          <p className="text-sm">No leads match the current filters</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280} aria-hidden="true">
          <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={prefersDark ? '#A5B4FC' : '#818CF8'} />
                <stop offset="100%" stopColor={prefersDark ? '#6366F1' : '#4F46E5'} />
              </linearGradient>
              <linearGradient id="barMuted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={prefersDark ? '#443D5C' : '#C7C1E3'} />
                <stop offset="100%" stopColor={prefersDark ? '#332C4C' : '#B0A8DC'} />
              </linearGradient>
              <linearGradient id="barHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={prefersDark ? '#C7D2FE' : '#A5B4FC'} />
                <stop offset="100%" stopColor={prefersDark ? '#818CF8' : '#6366F1'} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="campaign"
              tick={{ fontSize: 12, fill: axisColor }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: axisColor }}
              width={32}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: prefersDark ? '#ffffff08' : '#0000000a' }} content={<ChartTooltip />} />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={56}
              isAnimationActive={!prefersReducedMotion}
              animationEasing="ease-out"
              onMouseEnter={(_, index) => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  className="transition-[filter] duration-150"
                  style={{ filter: i === hoverIndex ? 'brightness(1.08)' : 'none', cursor: 'pointer' }}
                  fill={
                    i === hoverIndex
                      ? 'url(#barHover)'
                      : entry.count === maxCount
                        ? 'url(#barActive)'
                        : 'url(#barMuted)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
