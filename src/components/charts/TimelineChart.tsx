import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Brush,
} from 'recharts'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import type { TimelinePoint } from '../../types'
import { monthLabel, formatNumber } from '../../utils'
import { cn } from '../../utils'

interface TimelineChartProps {
  data: TimelinePoint[]
  height?: number
}

type ScaleMode = 'linear' | 'log'

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number; payload: { rawEvents?: number; rawFatalities?: number } }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-card border border-border rounded-lg p-3 shadow-card text-xs space-y-1.5 min-w-[160px]">
      <p className="font-semibold text-text-primary border-b border-border pb-1 mb-1">
        {label ? monthLabel(label) : ''}
      </p>
      {payload.map((p) => {
        const rawVal = p.name === 'Lives Lost' ? p.payload.rawFatalities ?? p.value : p.payload.rawEvents ?? p.value
        return (
          <div key={p.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-text-secondary">{p.name}:</span>
            </div>
            <span className="text-text-primary font-bold tabular-nums">{formatNumber(rawVal)}</span>
          </div>
        )
      })}
    </div>
  )
}

export function TimelineChart({ data, height = 300 }: TimelineChartProps) {
  const [scaleMode, setScaleMode] = useState<ScaleMode>('linear')
  const [excludePeak, setExcludePeak] = useState<boolean>(false)

  // Detect peak fatalities month
  const peakMonth = useMemo(() => {
    if (!data || !data.length) return null
    const top = [...data].sort((a, b) => b.fatalities - a.fatalities)[0]
    return top && top.fatalities > 15000 ? top : null
  }, [data])

  const processedData = useMemo(() => {
    if (!data) return []
    let result = data
    if (excludePeak && peakMonth) {
      result = result.filter((d) => d.date !== peakMonth.date)
    }

    return result.map((d) => {
      const rawE = Math.max(0, d.events)
      const rawF = Math.max(0, d.fatalities)
      return {
        ...d,
        rawEvents: rawE,
        rawFatalities: rawF,
        displayEvents: scaleMode === 'log' ? parseFloat(Math.log10(rawE + 1).toFixed(2)) : rawE,
        displayFatalities: scaleMode === 'log' ? parseFloat(Math.log10(rawF + 1).toFixed(2)) : rawF,
      }
    })
  }, [data, scaleMode, excludePeak, peakMonth])

  if (!data || data.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-sm font-semibold text-text-primary">Conflict Incidents & Lives Lost Over Time</h3>
        <p className="text-xs text-text-muted mt-2">No timeline data available for selected filters</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card p-5 flex flex-col justify-between"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Conflict Incidents & Lives Lost Over Time</h3>
            {excludePeak && peakMonth && (
              <span className="text-[10px] bg-accent-amber/20 text-accent-amber border border-accent-amber/30 px-2 py-0.5 rounded-full font-medium">
                Peak Excluded ({monthLabel(peakMonth.date)})
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Monthly conflict activity and recorded casualties. Drag the brush to zoom.
          </p>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
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

          {peakMonth && (
            <button
              onClick={() => setExcludePeak((v) => !v)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors',
                excludePeak
                  ? 'bg-accent-amber/20 border-accent-amber/40 text-accent-amber'
                  : 'bg-bg-primary border-border text-text-muted hover:text-text-primary',
              )}
            >
              <SlidersHorizontal size={12} />
              {excludePeak ? 'Include Peak' : 'Exclude Peak'}
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={processedData} margin={{ top: 15, right: 25, bottom: 55, left: 15 }}>
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
            yAxisId="events"
            orientation="left"
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
          <YAxis
            yAxisId="fatalities"
            orientation="right"
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
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF', paddingTop: 8 }} />
          <Bar
            yAxisId="events"
            dataKey="displayEvents"
            name="Conflict Incidents"
            fill="#3B82F6"
            fillOpacity={0.7}
            radius={[2, 2, 0, 0]}
            maxBarSize={24}
          />
          <Line
            yAxisId="fatalities"
            dataKey="displayFatalities"
            name="Lives Lost"
            stroke="#EF4444"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#EF4444' }}
          />
          <Brush
            dataKey="date"
            height={24}
            stroke="#1F2937"
            fill="#0B1220"
            travellerWidth={6}
            tickFormatter={monthLabel}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
