import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import type { MonthlySummary } from '../types'
import { formatNumber } from '../utils'
import { EQUIPMENT_LABELS } from '../utils/constants'

interface EquipmentPageProps {
  monthly: MonthlySummary[]
}

const EQUIPMENT_KEYS = Object.keys(EQUIPMENT_LABELS) as (keyof MonthlySummary)[]

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  '#6366F1', '#84CC16', '#F43F5E', '#06B6D4',
]

export function EquipmentPage({ monthly }: EquipmentPageProps) {
  // Sum up equipment losses across all months safely
  const totals = EQUIPMENT_KEYS.map((key, i) => ({
    key,
    label: EQUIPMENT_LABELS[key],
    value: monthly.reduce((sum, m) => sum + (Number(m[key]) || 0), 0),
    color: COLORS[i % COLORS.length],
  })).sort((a, b) => b.value - a.value)

  return (
    <div className="page-transition space-y-6 max-w-[1920px] mx-auto">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Russian Equipment Losses</h2>
        <p className="text-xs text-text-muted mt-0.5">Cumulative confirmed losses per category</p>
      </div>

      {/* Totals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
        {totals.map(({ key, label, value, color }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card p-4 flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <p className="text-xs text-text-muted truncate" title={label}>{label}</p>
            </div>
            <p className="text-2xl font-bold tabular-nums" style={{ color }}>{formatNumber(value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Total Losses Bar Chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Equipment Losses Comparison</h3>
        <p className="text-xs text-text-muted mb-4">Cumulative totals per category</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={totals} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString())}
            />
            <YAxis dataKey="label" type="category" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={145} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12, color: '#F9FAFB' }}
              formatter={(v) => [formatNumber(Number(v ?? 0)), 'Losses']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {totals.map((entry) => <Cell key={entry.key} fill={entry.color} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Personnel losses callout */}
      <div className="card p-5 border-accent-red/20 bg-accent-red/5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-accent-red/20 flex-shrink-0">
            <span className="text-2xl">⚔️</span>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Estimated Russian Personnel Losses</p>
            <p className="text-3xl font-bold text-accent-red mt-1 tabular-nums">
              {formatNumber(monthly.reduce((s, m) => s + (Number(m.rus_military_personnel_losses) || 0), 0))}
            </p>
            <p className="text-xs text-text-muted mt-0.5">Cumulative reported casualties across dataset timeframe</p>
          </div>
        </div>
      </div>
    </div>
  )
}
