import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="font-medium text-slate-900 dark:text-slate-100">{campaign}</div>
      <div className="tabular text-slate-500 dark:text-slate-400">
        {count} lead{count === 1 ? '' : 's'}
      </div>
    </div>
  )
}

export default function CampaignChart({ data, loading }: CampaignChartProps) {
  const prefersDark = usePrefersDark()
  const prefersReducedMotion = usePrefersReducedMotion()
  const gridColor = prefersDark ? '#334155' : '#e2e8f0'
  const axisColor = prefersDark ? '#94a3b8' : '#64748b'
  const barColor = prefersDark ? '#60A5FA' : '#1E40AF'
  const barHoverColor = prefersDark ? '#93C5FD' : '#3B82F6'

  const summary =
    data.length === 0
      ? 'No leads match the current filters.'
      : `Leads by campaign: ${data.map((d) => `${d.campaign}, ${d.count} leads`).join('; ')}.`

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
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
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
          <InboxIcon className="h-8 w-8" />
          <p className="text-sm">No leads match the current filters</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280} aria-hidden="true">
          <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="campaign"
              tick={{ fontSize: 12, fill: axisColor }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
              stroke={gridColor}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: axisColor }} width={32} stroke={gridColor} />
            <Tooltip
              cursor={{ fill: prefersDark ? '#ffffff0d' : '#0000000a' }}
              content={<ChartTooltip />}
            />
            <Bar
              dataKey="count"
              fill={barColor}
              activeBar={{ fill: barHoverColor }}
              radius={[4, 4, 0, 0]}
              maxBarSize={56}
              isAnimationActive={!prefersReducedMotion}
            >
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: axisColor, fontSize: 12, fontFamily: 'Fira Code, monospace' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
