import { motion } from 'framer-motion'
import { Download, FileText, BarChart2, Map } from 'lucide-react'
import type { ACLEDEvent, FilterState } from '../types'
import { useFilteredEvents } from '../hooks/useData'
import { formatNumber } from '../utils'

interface ReportsPageProps {
  events: ACLEDEvent[]
  filters: FilterState
}

function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function downloadCSV(events: ACLEDEvent[], filename: string) {
  const headers = ['event_date', 'event_type', 'sub_event_type', 'actor1', 'actor2', 'admin_lvl1', 'specific_location', 'fatalities', 'civilian_targeting']
  const rows = events.map((e) =>
    headers.map((h) => `"${String(e[h as keyof ACLEDEvent]).replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage({ events, filters }: ReportsPageProps) {
  const filtered = useFilteredEvents(events, filters)

  const reports = [
    {
      id: 'rpt-all-csv',
      title: 'Full Filtered Dataset',
      description: `All ${formatNumber(filtered.length)} filtered conflict incidents as CSV`,
      icon: <FileText size={20} />,
      color: '#3B82F6',
      action: () => downloadCSV(filtered, 'ukraine_war_events_filtered.csv'),
      format: 'CSV',
    },
    {
      id: 'rpt-summary-json',
      title: 'Summary Statistics',
      description: 'JSON file with aggregated statistics from filtered conflict incidents',
      icon: <BarChart2 size={20} />,
      color: '#10B981',
      action: () => {
        const regionMap: Record<string, number> = {}
        const typeMap: Record<string, number> = {}
        let totalFat = 0
        filtered.forEach((e) => {
          regionMap[e.admin_lvl1] = (regionMap[e.admin_lvl1] || 0) + 1
          typeMap[e.event_type] = (typeMap[e.event_type] || 0) + 1
          totalFat += e.fatalities
        })
        downloadJSON({
          generated_at: new Date().toISOString(),
          total_events: filtered.length,
          total_fatalities: totalFat,
          events_by_region: regionMap,
          events_by_type: typeMap,
        }, 'ukraine_war_summary.json')
      },
      format: 'JSON',
    },
    {
      id: 'rpt-civilian-csv',
      title: 'Civilian Targeting Incidents',
      description: 'CSV of all conflict incidents flagged as civilian targeting',
      icon: <Map size={20} />,
      color: '#A855F7',
      action: () => downloadCSV(filtered.filter((e) => e.civilian_targeting === 'Yes'), 'ukraine_civilian_events.csv'),
      format: 'CSV',
    },
    {
      id: 'rpt-high-fat-csv',
      title: 'High Lives Lost Incidents (10+)',
      description: 'Conflict incidents with 10 or more reported lives lost',
      icon: <Download size={20} />,
      color: '#EF4444',
      action: () => downloadCSV(filtered.filter((e) => e.fatalities >= 10), 'ukraine_high_fatality_events.csv'),
      format: 'CSV',
    },
  ]

  return (
    <div className="page-transition space-y-5">
      <div>
        <h2 className="text-base font-semibold text-text-primary">Reports & Exports</h2>
        <p className="text-xs text-text-muted mt-0.5">Download data and reports based on your current filter settings</p>
      </div>

      <div className="card p-4 border-accent-blue/20 bg-accent-blue/5 text-xs text-accent-blue-light">
        ℹ️ All exports reflect the currently active filter settings. {formatNumber(filtered.length)} conflict incidents are included in the current view.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((rpt, i) => (
          <motion.div
            key={rpt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5 hover:border-border-subtle transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${rpt.color}20` }}>
                <span style={{ color: rpt.color }}>{rpt.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-text-primary">{rpt.title}</h3>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${rpt.color}25`, color: rpt.color }}
                  >
                    {rpt.format}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-4">{rpt.description}</p>
                <button
                  id={rpt.id}
                  onClick={rpt.action}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150"
                  style={{
                    color: rpt.color,
                    borderColor: `${rpt.color}40`,
                    background: `${rpt.color}10`,
                  }}
                >
                  <Download size={12} />
                  Download {rpt.format}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data citation */}
      <div className="card p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Data Attribution</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          Source: Armed Conflict Location & Event Data Project (ACLED). Data covers the Russia–Ukraine conflict from February 2022 onwards.
          All data has been cleaned, validated and processed locally — no live scraping of ACLED servers.
        </p>
      </div>
    </div>
  )
}
