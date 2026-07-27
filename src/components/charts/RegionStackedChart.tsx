import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import type { RegionStat } from '../../types'
import { EVENT_TYPE_COLORS, ALL_EVENT_TYPES } from '../../utils/constants'
import { formatNumber } from '../../utils'

interface RegionStackedChartProps {
  data: RegionStat[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0)
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 shadow-card text-xs space-y-1.5 min-w-[180px]">
      <p className="font-semibold text-text-primary border-b border-border pb-1 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-text-secondary">{p.name}:</span>
          </div>
          <span className="text-text-primary font-bold tabular-nums">{formatNumber(p.value)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1 border-t border-border font-bold">
        <span className="text-text-muted">Total Conflict Incidents:</span>
        <span className="text-accent-blue">{formatNumber(total)}</span>
      </div>
    </div>
  )
}

export function RegionStackedChart({ data }: RegionStackedChartProps) {
  const topRegions = data ? data.slice(0, 10) : []

  if (!topRegions.length) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center min-h-[280px]">
        <h3 className="text-sm font-semibold text-text-primary">Conflict Incidents by Region</h3>
        <p className="text-xs text-text-muted mt-2">No regional data available for selected filters</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="card p-5 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Conflict Incidents by Region</h3>
        <p className="text-xs text-text-muted mb-4">Stacked by conflict incident category — top 10 regions</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={topRegions}
          margin={{ top: 15, right: 25, bottom: 55, left: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis
            dataKey="region"
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#1F2937' }}
            tickLine={false}
            angle={-35}
            textAnchor="end"
            height={55}
            interval={0}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString())}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#9CA3AF', paddingTop: 8 }} />
          {ALL_EVENT_TYPES.map((type) => (
            <Bar
              key={type}
              dataKey={type}
              name={type}
              stackId="a"
              fill={EVENT_TYPE_COLORS[type] ?? '#6B7280'}
              fillOpacity={0.85}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
