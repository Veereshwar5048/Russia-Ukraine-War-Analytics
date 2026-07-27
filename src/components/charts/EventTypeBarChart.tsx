import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import type { EventTypeStat } from '../../types'
import { formatNumber } from '../../utils'

interface EventTypeBarChartProps {
  data: EventTypeStat[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: EventTypeStat }[] }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 shadow-card text-xs space-y-1.5 min-w-[180px]">
      <p className="font-semibold text-text-primary border-b border-border pb-1 mb-1">{d.name}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-secondary">Conflict Incidents:</span>
        <span className="text-text-primary font-bold tabular-nums">{formatNumber(d.count)}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-text-secondary">Lives Lost:</span>
        <span className="text-accent-red font-bold tabular-nums">{formatNumber(d.fatalities)}</span>
      </div>
    </div>
  )
}

export function EventTypeBarChart({ data }: EventTypeBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center min-h-[220px]">
        <h3 className="text-sm font-semibold text-text-primary">Top Incident Types</h3>
        <p className="text-xs text-text-muted mt-2">No conflict incident data available for selected filters</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="card p-5 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Top Incident Types</h3>
        <p className="text-xs text-text-muted mb-4">Conflict incidents ranked by frequency</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 25, bottom: 5, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString())}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={160}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
