import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts'
import type { ACLEDEvent, FilterState } from '../types'
import { useFilteredEvents, useRegionStats } from '../hooks/useData'
import { formatNumber } from '../utils'

interface RegionsPageProps {
  events: ACLEDEvent[]
  filters: FilterState
}

const HEAT_COLORS = ['#F87171', '#F97316', '#FBBF24', '#A78BFA', '#60A5FA', '#34D399']

export function RegionsPage({ events, filters }: RegionsPageProps) {
  const filtered = useFilteredEvents(events, filters)
  const regionStats = useRegionStats(filtered)
  const maxEvents = Math.max(1, ...regionStats.map((r) => Number(r.events) || 0))

  return (
    <div className="page-transition space-y-5 max-w-[1920px] mx-auto">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Regional Analysis</h2>
        <p className="text-xs text-text-muted mt-0.5">Conflict intensity and lives lost broken down by Ukrainian Oblast and Russian border regions</p>
      </div>

      {regionStats.length === 0 ? (
        <div className="card p-8 text-center text-text-muted text-xs">
          No regional conflict data matches the selected filters.
        </div>
      ) : (
        <>
          {/* Region cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {regionStats.slice(0, 12).map((r, i) => {
              const intensity = (Number(r.events) || 0) / maxEvents
              const colorIdx = Math.min(Math.floor((1 - intensity) * HEAT_COLORS.length), HEAT_COLORS.length - 1)
              const color = HEAT_COLORS[colorIdx]
              return (
                <motion.div
                  key={r.region}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{r.region}</p>
                        <p className="text-[11px] text-text-muted">Oblast / Region</p>
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${color}25`, color }}
                      >
                        #{i + 1}
                      </span>
                    </div>
                    {/* Intensity bar */}
                    <div className="h-1.5 bg-bg-primary rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${intensity * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Conflict Incidents</p>
                      <p className="text-base font-bold tabular-nums" style={{ color }}>{formatNumber(r.events as number)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider">Lives Lost</p>
                      <p className="text-base font-bold text-accent-red tabular-nums">{formatNumber(r.fatalities as number)}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Events vs Fatalities scatter-style bar */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Conflict Incidents vs Lives Lost by Region</h3>
            <p className="text-xs text-text-muted mb-4">Top 15 regions comparison</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={regionStats.slice(0, 15)} margin={{ top: 15, right: 25, bottom: 55, left: 15 }}>
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
                  yAxisId="left"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString())}
                  width={45}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString())}
                  width={45}
                />
                <Tooltip
                  formatter={(v, name) => [formatNumber(Number(v ?? 0)), String(name ?? '')]}
                  contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12, color: '#F9FAFB' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF', paddingTop: 8 }} />
                <Bar yAxisId="left" dataKey="events" name="Conflict Incidents" fill="#3B82F6" fillOpacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={18}>
                  {regionStats.slice(0, 15).map((_, i) => (
                    <Cell key={i} fill={HEAT_COLORS[Math.min(Math.floor(i / 3), HEAT_COLORS.length - 1)]} fillOpacity={0.75} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="fatalities" name="Lives Lost" fill="#EF4444" fillOpacity={0.85} radius={[2, 2, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
