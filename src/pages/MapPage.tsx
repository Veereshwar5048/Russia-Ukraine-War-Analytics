import { motion } from 'framer-motion'
import { ConflictMap } from '../components/map/ConflictMap'
import type { ACLEDEvent, FilterState } from '../types'
import { useFilteredEvents } from '../hooks/useData'

interface MapPageProps {
  events: ACLEDEvent[]
  filters: FilterState
  loading: boolean
}

export function MapPage({ events, filters, loading }: MapPageProps) {
  const filtered = useFilteredEvents(events, filters)

  return (
    <div className="page-transition h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Conflict Map</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {filtered.length.toLocaleString()} conflict incidents plotted · Use filters to narrow down
          </p>
        </div>
      </div>
      <motion.div
        className="flex-1 min-h-[600px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ConflictMap events={filtered} loading={loading} />
      </motion.div>
    </div>
  )
}
