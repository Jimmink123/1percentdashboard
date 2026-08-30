import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface CampaignChartProps {
  data: { campaign: string; count: number }[]
}

export default function CampaignChart({ data }: CampaignChartProps) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="mb-2 text-sm text-black/50">Leads by campaign</div>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-black/40">
          No leads match the current filters
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000012" vertical={false} />
            <XAxis
              dataKey="campaign"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
            <Tooltip cursor={{ fill: '#00000008' }} />
            <Bar dataKey="count" fill="#12141a" radius={[4, 4, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
