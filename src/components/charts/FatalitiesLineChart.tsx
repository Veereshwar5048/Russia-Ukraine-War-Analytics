import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import type { TimelinePoint } from '../../types'
import { monthLabel, formatNumber } from '../../utils'
import { cn } from '../../utils'

interface FatalitiesLineChartProps {
  data: TimelinePoint[]
  height?: number
}

type ScaleMode = 'linear' | 'log'

export function FatalitiesLineChart({ data, height = 280 }: FatalitiesLineChartProps) {
  const [scaleMode, setScaleMode] = useState<ScaleMode>('linear')
  const [excludeOutliers, setExcludeOutliers] = useState<boolean>(false)

  // Find outlier threshold (months > 15,000 fatalities or > 3x mean)
  const outlierInfo = useMemo(() => {
    if (!data || !data.length) return null
    const sorted = [...data].sort((a, b) => b.fatalities - a.fatalities)
    const top = sorted[0]
    if (top && top.fatalities > 15000) {
      return { month: top.date, fatalities: top.fatalities }
    }
    return null
  }, [data])

  // Process data based on controls
  const processedData = useMemo(() => {
    if (!data) return []
    let result = data
    if (excludeOutliers && outlierInfo) {
      result = result.filter((d) => d.date !== outlierInfo.month)
    }

    return result.map((d) => {
      const origVal = Math.max(0, d.fatalities)
      // Log scale transform: Math.log10(v + 1) for safe log mapping
      const displayVal = scaleMode === 'log' ? parseFloat(Math.log10(origVal + 1).toFixed(2)) : origVal
      return {
        ...d,
        displayFatalities: displayVal,
        rawFatalities: origVal,
      }
    })
  }, [data, scaleMode, excludeOutliers, outlierInfo])

  if (!data || data.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center min-h-[280px]">
        <p className="text-sm font-semibold text-text-secondary">Monthly Lives Lost</p>
        <p className="text-xs text-text-muted mt-2">No lives lost data available for selected filters</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="card p-5 flex flex-col justify-between"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Monthly Lives Lost</h3>
            {excludeOutliers && outlierInfo && (
              <span className="text-[10px] bg-accent-amber/20 text-accent-amber border border-accent-amber/30 px-2 py-0.5 rounded-full font-medium">
                Peak Excluded ({monthLabel(outlierInfo.month)})
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Confirmed lives lost per month · {scaleMode === 'log' ? 'Logarithmic scale' : 'Linear scale'}
          </p>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Scale mode toggle */}
          <div className="flex bg-bg-primary p-0.5 border border-border rounded-lg">
            <button
              onClick={() => setScaleMode('linear')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors text-xs font-medium',
                scaleMode === 'linear'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              Linear
            </button>
            <button
              onClick={() => setScaleMode('log')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors text-xs font-medium',
                scaleMode === 'log'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              Log Scale
            </button>
          </div>

          {/* Outlier exclusion toggle */}
          {outlierInfo && (
            <button
              onClick={() => setExcludeOutliers((v) => !v)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors',
                excludeOutliers
                  ? 'bg-accent-amber/20 border-accent-amber/40 text-accent-amber'
                  : 'bg-bg-primary border-border text-text-muted hover:text-text-primary',
              )}
              title={`Toggle excluding outlier peak in ${monthLabel(outlierInfo.month)} (${formatNumber(outlierInfo.fatalities)} lives lost)`}
            >
              <SlidersHorizontal size={12} />
              {excludeOutliers ? 'Include Peak' : 'Exclude Peak'}
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={processedData}
          margin={{ top: 15, right: 25, bottom: 55, left: 15 }}
        >
          <defs>
            <linearGradient id="fatLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={monthLabel}
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            axisLine={{ stroke: '#1F2937' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={25}
            angle={-35}
            textAnchor="end"
            height={55}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => {
              if (scaleMode === 'log') {
                const realVal = Math.round(Math.pow(10, v) - 1)
                return realVal >= 1000 ? `${(realVal / 1000).toFixed(0)}k` : realVal.toString()
              }
              return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString()
            }}
            width={45}
          />
          <Tooltip
            formatter={(_, __, item) => [
              formatNumber(item.payload.rawFatalities),
              'Lives Lost',
            ]}
            labelFormatter={(label) => monthLabel(String(label ?? ''))}
            contentStyle={{
              background: '#111827',
              border: '1px solid #1F2937',
              borderRadius: '8px',
              fontSize: 12,
              color: '#F9FAFB',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          />
          <Line
            type="monotone"
            dataKey="displayFatalities"
            name="Lives Lost"
            stroke="url(#fatLineGrad)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#EF4444', stroke: '#111827', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
