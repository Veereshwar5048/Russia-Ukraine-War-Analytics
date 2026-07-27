import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import type { ACLEDEvent } from '../../types'
import { useMemo } from 'react'
import { formatNumber } from '../../utils'

interface HeatmapChartProps {
  events: ACLEDEvent[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function HeatmapChart({ events }: HeatmapChartProps) {
  // Build month × day-of-week matrix safely
  const matrix = useMemo(() => {
    const mat: number[][] = Array.from({ length: 12 }, () => Array(7).fill(0))
    if (!events || !events.length) return mat

    events.forEach((ev) => {
      if (!ev.event_date) return
      const d = new Date(ev.event_date + 'T00:00:00Z')
      if (isNaN(d.getTime())) return
      const m = d.getUTCMonth()
      const day = d.getUTCDay()
      if (m >= 0 && m < 12 && day >= 0 && day < 7) {
        mat[m][day]++
      }
    })
    return mat
  }, [events])

  const maxVal = useMemo(() => Math.max(1, ...matrix.flat()), [matrix])

  const getColor = (val: number): string => {
    if (val === 0) return 'rgba(255,255,255,0.04)'
    const intensity = val / maxVal
    if (intensity < 0.25) return `rgba(59,130,246,${0.3 + intensity * 0.5})`
    if (intensity < 0.5) return `rgba(245,158,11,${0.4 + intensity * 0.4})`
    if (intensity < 0.75) return `rgba(239,68,68,${0.5 + intensity * 0.3})`
    return `rgba(239,68,68,0.85)`
  }

  if (!events || events.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center min-h-[280px]">
        <h3 className="text-sm font-semibold text-text-primary">Daily Conflict Incident Density Heatmap</h3>
        <p className="text-xs text-text-muted mt-2">No conflict incident density data for selected filters</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="card p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={14} className="text-accent-amber" />
          <h3 className="text-sm font-semibold text-text-primary">Daily Conflict Incident Density Heatmap</h3>
        </div>
        <p className="text-xs text-text-muted mb-4">Conflict incidents by month (rows) and day of week (columns)</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Day headers */}
          <div className="flex mb-1 ml-12">
            {DAYS.map((d) => (
              <div key={d} className="w-10 text-center text-[10px] text-text-muted font-medium">{d}</div>
            ))}
          </div>

          {/* Rows: months */}
          {matrix.map((row, mi) => (
            <div key={mi} className="flex items-center mb-1">
              <div className="w-12 text-[10px] text-text-muted text-right pr-2 font-medium">{MONTHS[mi]}</div>
              {row.map((val, di) => (
                <div
                  key={di}
                  className="w-10 h-7 rounded mx-0.5 flex items-center justify-center text-[10px] font-semibold text-white/90 transition-transform hover:scale-105 cursor-default"
                  style={{ background: getColor(val) }}
                  title={`${MONTHS[mi]} (${DAYS[di]}): ${formatNumber(val)} conflict incidents`}
                >
                  {val > 0 ? (val > 999 ? `${(val / 1000).toFixed(0)}k` : val) : ''}
                </div>
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 ml-12">
            <span className="text-[10px] text-text-muted font-medium">Low</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((i) => (
              <div
                key={i}
                className="w-6 h-3 rounded"
                style={{ background: getColor(Math.round(maxVal * i)) }}
              />
            ))}
            <span className="text-[10px] text-text-muted font-medium">High</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
