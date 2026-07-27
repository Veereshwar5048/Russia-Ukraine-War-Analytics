import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { motion } from 'framer-motion'
import type { EventTypeStat } from '../../types'
import { formatNumber } from '../../utils'

interface EventTypePieChartProps {
  data: EventTypeStat[]
}

const RADIAN = Math.PI / 180

const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  if (!cx || !cy || midAngle === undefined || !innerRadius || !outerRadius || !percent) return null
  if ((percent as number) < 0.05) return null
  const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5
  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN)
  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${((percent as number) * 100).toFixed(0)}%`}
    </text>
  )
}

export function EventTypePieChart({ data }: EventTypePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center min-h-[240px]">
        <h3 className="text-sm font-semibold text-text-primary">Incident Type Share</h3>
        <p className="text-xs text-text-muted mt-2">No conflict incident category data for selected filters</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card p-5 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Incident Type Share</h3>
        <p className="text-xs text-text-muted mb-2">Proportion of each conflict category</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={85}
            innerRadius={45}
            labelLine={false}
            label={renderCustomLabel}
            isAnimationActive={true}
            animationBegin={100}
            animationDuration={800}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.88} stroke="#111827" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatNumber(Number(value ?? 0)), name]}
            contentStyle={{
              background: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '8px',
              fontSize: 12,
              color: '#F9FAFB',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: '#9CA3AF', paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
