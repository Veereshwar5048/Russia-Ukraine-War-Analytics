import { motion } from 'framer-motion'
import { TimelineChart } from '../components/charts/TimelineChart'
import { FatalitiesLineChart } from '../components/charts/FatalitiesLineChart'
import { HeatmapChart } from '../components/charts/HeatmapChart'
import type { ACLEDEvent, FilterState } from '../types'
import { useFilteredEvents, useTimelineData } from '../hooks/useData'

interface TimelinePageProps {
  events: ACLEDEvent[]
  filters: FilterState
}

export function TimelinePage({ events, filters }: TimelinePageProps) {
  const filtered = useFilteredEvents(events, filters)
  const timeline = useTimelineData(filtered)

  return (
    <div className="page-transition space-y-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Timeline Analysis</h2>
        <p className="text-xs text-text-muted mt-0.5">Interactive time-series of conflict incidents and lives lost</p>
      </div>
      <TimelineChart data={timeline} height={320} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <FatalitiesLineChart data={timeline} />
        <HeatmapChart events={filtered} />
      </div>
    </div>
  )
}
