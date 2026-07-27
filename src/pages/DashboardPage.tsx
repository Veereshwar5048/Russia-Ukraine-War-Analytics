import { motion } from 'framer-motion'
import {
  Activity, Skull, Users, Zap, Plane, Crosshair,
} from 'lucide-react'
import { KPICard } from '../components/ui/KPICard'
import { TimelineChart } from '../components/charts/TimelineChart'
import { EventTypeBarChart } from '../components/charts/EventTypeBarChart'
import { RegionStackedChart } from '../components/charts/RegionStackedChart'
import { EventTypePieChart } from '../components/charts/EventTypePieChart'
import { FatalitiesLineChart } from '../components/charts/FatalitiesLineChart'
import { HeatmapChart } from '../components/charts/HeatmapChart'
import { InsightsPanel } from '../components/ui/InsightsPanel'
import { DataTable } from '../components/ui/DataTable'
import type { ACLEDEvent, MonthlySummary } from '../types'
import {
  useFilteredEvents,
  useSparklines,
  useTimelineData,
  useEventTypeStats,
  useRegionStats,
  useInsights,
} from '../hooks/useData'
import type { FilterState } from '../types'

interface DashboardPageProps {
  events: ACLEDEvent[]
  monthly: MonthlySummary[]
  filters: FilterState
  loading: boolean
}

export function DashboardPage({ events, filters, loading }: DashboardPageProps) {
  const filtered = useFilteredEvents(events, filters)
  const sparklines = useSparklines(filtered)
  const timeline = useTimelineData(filtered)
  const eventTypeStats = useEventTypeStats(filtered)
  const regionStats = useRegionStats(filtered)
  const insights = useInsights(filtered)

  // Compute KPI values safely
  const totalFatalities = filtered.reduce((s, e) => s + (e.fatalities || 0), 0)
  const civilianFatalities = filtered
    .filter((e) => e.civilian_targeting === 'Yes')
    .reduce((s, e) => s + (e.fatalities || 0), 0)
  const explosions = filtered.filter((e) => e.event_type === 'Explosions/Remote violence').length
  const airStrikes = filtered.filter(
    (e) => e.sub_event_type.toLowerCase().includes('air') || e.sub_event_type.toLowerCase().includes('drone')
  ).length
  const strategic = filtered.filter((e) => e.event_type === 'Strategic developments').length

  const kpiCards = [
    { id: 'kpi-events', label: 'Conflict Incidents', value: filtered.length, icon: <Activity size={18} />, color: 'blue' as const, sparkline: sparklines.events },
    { id: 'kpi-fatalities', label: 'Lives Lost', value: totalFatalities, icon: <Skull size={18} />, color: 'red' as const, sparkline: sparklines.fatalities },
    { id: 'kpi-civilian', label: 'Civilian Lives Lost', value: civilianFatalities, icon: <Users size={18} />, color: 'amber' as const, sparkline: sparklines.civilian },
    { id: 'kpi-explosions', label: 'Explosions & Remote Attacks', value: explosions, icon: <Zap size={18} />, color: 'red' as const, sparkline: sparklines.explosions },
    { id: 'kpi-airstrikes', label: 'Air & Drone Strikes', value: airStrikes, icon: <Plane size={18} />, color: 'purple' as const, sparkline: sparklines.airStrikes },
    { id: 'kpi-strategic', label: 'Strategic Operations', value: strategic, icon: <Crosshair size={18} />, color: 'green' as const, sparkline: sparklines.strategic },
  ]

  return (
    <div className="space-y-5 page-transition max-w-[1920px] mx-auto">
      {/* Top KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 items-stretch">
        {kpiCards.map((card, i) => (
          <KPICard key={card.id} {...card} delay={i * 0.04} loading={loading} />
        ))}
      </div>

      {/* Main Row 1: Timeline Chart (2 cols) + Insights Panel (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        <div className="xl:col-span-2">
          <TimelineChart data={timeline} height={300} />
        </div>
        <div className="h-full">
          <InsightsPanel insights={insights} />
        </div>
      </div>

      {/* Main Row 2: Top Event Types + Event Type Share + Monthly Fatalities */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        <EventTypeBarChart data={eventTypeStats} />
        <EventTypePieChart data={eventTypeStats} />
        <FatalitiesLineChart data={timeline} height={280} />
      </div>

      {/* Main Row 3: Events by Region + Daily Event Density Heatmap */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        <RegionStackedChart data={regionStats} />
        <HeatmapChart events={filtered} />
      </div>

      {/* Main Row 4: Data Table */}
      <div className="h-[560px]">
        <DataTable events={filtered} />
      </div>
    </div>
  )
}
