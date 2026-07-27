import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts'
import type { ACLEDEvent, MonthlySummary, FilterState } from '../types'
import { useFilteredEvents } from '../hooks/useData'
import { formatNumber, monthLabel } from '../utils'

interface CivilianPageProps {
  events: ACLEDEvent[]
  monthly: MonthlySummary[]
  filters: FilterState
}

export function CivilianPage({ events, monthly, filters }: CivilianPageProps) {
  const filtered = useFilteredEvents(events, filters)
  const civilianEvents = filtered.filter((e) => e.civilian_targeting === 'Yes')
  const totalCivKilled = monthly.reduce((s, m) => s + (m.civilian_killed || 0), 0)
  const totalCivInjured = monthly.reduce((s, m) => s + (m.civilian_injuried || 0), 0)

  const monthlyData = monthly.map((m) => ({
    month: m.year_month,
    killed: m.civilian_killed || 0,
    injured: m.civilian_injuried || 0,
    targeting: m.tot_civ_targetting || 0,
  }))

  // Top regions by civilian targeting events
  const regionMap: Record<string, number> = {}
  civilianEvents.forEach((e) => {
    if (e.admin_lvl1) {
      regionMap[e.admin_lvl1] = (regionMap[e.admin_lvl1] || 0) + 1
    }
  })
  const topRegions = Object.entries(regionMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([region, count]) => ({ region, count }))

  return (
    <div className="page-transition space-y-5 max-w-[1920px] mx-auto">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Civilian Impact</h2>
        <p className="text-xs text-text-muted mt-0.5">Civilian casualties, targeting incidents, and affected regions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-stretch">
        {[
          { label: 'Civilian Killed', value: totalCivKilled, color: 'text-accent-red', bg: 'bg-accent-red/10 border-accent-red/20' },
          { label: 'Civilian Injured', value: totalCivInjured, color: 'text-accent-amber', bg: 'bg-accent-amber/10 border-accent-amber/20' },
          { label: 'Total Casualties', value: totalCivKilled + totalCivInjured, color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20' },
          { label: 'Targeting Incidents', value: monthly.reduce((s, m) => s + (m.tot_civ_targetting || 0), 0), color: 'text-accent-blue', bg: 'bg-accent-blue/10 border-accent-blue/20' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`card p-4 ${item.bg} border flex flex-col justify-between`}
          >
            <p className="text-xs text-text-muted mb-1 truncate">{item.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${item.color} tabular-nums mt-1`}>{formatNumber(item.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly civilian casualties area chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Monthly Civilian Casualties</h3>
        <p className="text-xs text-text-muted mb-4">Killed and injured civilians per month</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyData} margin={{ top: 15, right: 25, bottom: 55, left: 15 }}>
            <defs>
              <linearGradient id="gradKilled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradInjured" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis
              dataKey="month"
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
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString())}
              width={45}
            />
            <Tooltip
              labelFormatter={(l) => monthLabel(String(l ?? ''))}
              formatter={(v, name) => [formatNumber(Number(v ?? 0)), String(name ?? '')]}
              contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12, color: '#F9FAFB' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF', paddingTop: 8 }} />
            <Area type="monotone" dataKey="killed" name="Killed" stroke="#EF4444" strokeWidth={2} fill="url(#gradKilled)" />
            <Area type="monotone" dataKey="injured" name="Injured" stroke="#F59E0B" strokeWidth={2} fill="url(#gradInjured)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top regions with civilian targeting */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Regions with Most Civilian Targeting</h3>
        <p className="text-xs text-text-muted mb-4">Conflict incidents explicitly tagged as civilian targeting</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topRegions} layout="vertical" margin={{ top: 5, right: 25, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString())}
            />
            <YAxis dataKey="region" type="category" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
            <Tooltip
              formatter={(v) => [formatNumber(Number(v ?? 0)), 'Incidents']}
              contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12, color: '#F9FAFB' }}
            />
            <Bar dataKey="count" name="Incidents" fill="#A855F7" fillOpacity={0.85} radius={[0, 4, 4, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
