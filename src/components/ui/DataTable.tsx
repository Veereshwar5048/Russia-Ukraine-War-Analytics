import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronUp, ChevronDown, ChevronsLeft, ChevronLeft,
  ChevronRight, ChevronsRight, Download, Search, Table,
} from 'lucide-react'
import type { ACLEDEvent } from '../../types'
import { formatNumber, truncate } from '../../utils'
import { getEventTypeColor } from '../../utils/constants'
import { cn } from '../../utils'

interface DataTableProps {
  events: ACLEDEvent[]
}

type SortKey = keyof ACLEDEvent
type SortDir = 'asc' | 'desc'

const PAGE_SIZES = [25, 50, 100]

const COLS: { key: SortKey; label: string; width: string }[] = [
  { key: 'event_date', label: 'Date', width: 'w-28' },
  { key: 'event_type', label: 'Type', width: 'w-44' },
  { key: 'admin_lvl1', label: 'Region', width: 'w-32' },
  { key: 'specific_location', label: 'Location', width: 'w-36' },
  { key: 'actor1', label: 'Actor 1', width: 'w-48' },
  { key: 'actor2', label: 'Actor 2', width: 'w-44' },
  { key: 'fatalities', label: 'Lives Lost', width: 'w-24' },
  { key: 'notes', label: 'Notes', width: 'w-80' },
]

function exportCSV(events: ACLEDEvent[]) {
  const headers = COLS.map((c) => c.label).join(',')
  const rows = events.map((ev) =>
    [
      ev.event_date,
      `"${ev.event_type}"`,
      ev.admin_lvl1,
      `"${ev.specific_location}"`,
      `"${ev.actor1}"`,
      `"${ev.actor2}"`,
      ev.fatalities,
      `"${ev.notes.replace(/"/g, '""').slice(0, 150)}"`,
    ].join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ukraine_war_events.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function DataTable({ events }: DataTableProps) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [sortKey, setSortKey] = useState<SortKey>('event_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!events) return []
    if (!search) return events
    const q = search.toLowerCase().trim()
    return events.filter(
      (ev) =>
        ev.event_date.includes(q) ||
        ev.event_type.toLowerCase().includes(q) ||
        ev.admin_lvl1.toLowerCase().includes(q) ||
        ev.actor1.toLowerCase().includes(q) ||
        ev.actor2.toLowerCase().includes(q) ||
        ev.specific_location.toLowerCase().includes(q)
    )
  }, [events, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const as = String(av ?? '')
      const bs = String(bv ?? '')
      return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-border-subtle ml-1">⇅</span>
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="inline ml-1 text-accent-blue" />
      : <ChevronDown size={12} className="inline ml-1 text-accent-blue" />
  }

  return (
    <div className="card flex flex-col h-full overflow-hidden" role="region" aria-label="Interactive Conflict Incidents Data Table">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-border gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Table size={16} className="text-accent-blue" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Conflict Incidents Data Table</h3>
            <p className="text-xs text-text-muted">{sorted.length.toLocaleString()} conflict incidents listed</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Table search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              id="table-search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              placeholder="Filter table..."
              aria-label="Filter table contents"
              className="pl-8 pr-3 py-1.5 bg-bg-primary border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 w-36 sm:w-48"
            />
          </div>
          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
            aria-label="Rows per page"
            className="bg-bg-primary border border-border rounded-lg text-xs text-text-secondary px-2 py-1.5 focus:outline-none"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / page</option>)}
          </select>
          {/* Export */}
          <button
            id="export-csv-btn"
            onClick={() => exportCSV(sorted)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue/20 border border-accent-blue/40 text-accent-blue-light text-xs rounded-lg hover:bg-accent-blue/30 transition-colors font-medium"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="sticky top-0 bg-bg-elevated border-b border-border z-10 shadow-sm">
            <tr>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-3 py-2.5 text-text-muted font-semibold cursor-pointer hover:text-text-primary select-none transition-colors uppercase tracking-wider text-[10px]',
                    col.width,
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}<SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((ev, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, delay: Math.min(i * 0.003, 0.1) }}
                className="border-b border-border/50 hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-3 py-2 text-text-secondary font-mono whitespace-nowrap">{ev.event_date}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      background: `${getEventTypeColor(ev.event_type)}20`,
                      color: getEventTypeColor(ev.event_type),
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getEventTypeColor(ev.event_type) }} />
                    {ev.event_type}
                  </span>
                </td>
                <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{ev.admin_lvl1}</td>
                <td className="px-3 py-2 text-text-secondary">{truncate(ev.specific_location || ev.admin_lvl2, 22)}</td>
                <td className="px-3 py-2 text-accent-blue-light">{truncate(ev.actor1, 32)}</td>
                <td className="px-3 py-2 text-accent-red-light">{truncate(ev.actor2, 28) || <span className="text-text-muted">—</span>}</td>
                <td className="px-3 py-2 text-right font-mono font-medium">
                  {ev.fatalities > 0 ? (
                    <span className="font-bold text-accent-red">{formatNumber(ev.fatalities)}</span>
                  ) : (
                    <span className="text-text-muted">0</span>
                  )}
                </td>
                <td className="px-3 py-2 text-text-muted max-w-xs truncate" title={ev.notes}>{truncate(ev.notes, 85)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-text-muted text-xs gap-1">
            <p className="font-medium text-text-secondary">No conflict incidents match the current criteria</p>
            <p className="text-text-muted text-[11px]">Try adjusting your search keyword or active filters</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-border gap-2 flex-shrink-0">
        <span className="text-xs text-text-muted">
          {sorted.length > 0
            ? `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sorted.length)} of ${sorted.length.toLocaleString()}`
            : 'Showing 0 of 0'}
        </span>
        <div className="flex items-center gap-1">
          <button id="table-first" onClick={() => setPage(0)} disabled={page === 0} className="pagination-btn" aria-label="First page"><ChevronsLeft size={12} /></button>
          <button id="table-prev" onClick={() => setPage((p) => p - 1)} disabled={page === 0} className="pagination-btn" aria-label="Previous page"><ChevronLeft size={12} /></button>
          <span className="text-xs text-text-secondary px-2 font-medium">
            {page + 1} / {Math.max(1, totalPages)}
          </span>
          <button id="table-next" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1} className="pagination-btn" aria-label="Next page"><ChevronRight size={12} /></button>
          <button id="table-last" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="pagination-btn" aria-label="Last page"><ChevronsRight size={12} /></button>
        </div>
      </div>

      <style>{`
        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #1F2937;
          color: #9CA3AF;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pagination-btn:hover:not(:disabled) {
          color: #F9FAFB;
          border-color: #374151;
          background: rgba(255,255,255,0.05);
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
