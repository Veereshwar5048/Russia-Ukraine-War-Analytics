import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, X, Filter, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../utils'
import type { FilterState } from '../../types'
import { ALL_EVENT_TYPES, ALL_REGIONS } from '../../utils/constants'

interface FilterPanelProps {
  filters: FilterState
  onChange: (f: Partial<FilterState>) => void
  onReset: () => void
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="px-4 pb-3 space-y-2">{children}</div>}
    </div>
  )
}

function MultiCheckbox({
  options, selected, onChange, colorMap,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  colorMap?: Record<string, string>
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter((s) => s !== val))
    else onChange([...selected, val])
  }
  return (
    <div className="space-y-1.5">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <div
            className={cn(
              'w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
              selected.includes(opt)
                ? 'bg-accent-blue border-accent-blue'
                : 'border-border-subtle group-hover:border-accent-blue/50',
            )}
            onClick={() => toggle(opt)}
          >
            {selected.includes(opt) && (
              <div className="w-1.5 h-1.5 rounded-sm bg-white" />
            )}
          </div>
          {colorMap && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: colorMap[opt] ?? '#6B7280' }}
            />
          )}
          <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors truncate">
            {opt}
          </span>
        </label>
      ))}
    </div>
  )
}

const EVENT_COLORS: Record<string, string> = {
  'Battles': '#EF4444',
  'Explosions/Remote violence': '#F97316',
  'Violence against civilians': '#A855F7',
  'Strategic developments': '#3B82F6',
  'Protests': '#10B981',
  'Riots': '#F59E0B',
}

export function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  const hasActiveFilters = useCallback(() => {
    return (
      filters.regions.length > 0 ||
      filters.eventTypes.length > 0 ||
      filters.civilianTargeting !== 'all' ||
      filters.searchLocation !== '' ||
      filters.minFatalities > 0
    )
  }, [filters])

  return (
    <aside className="w-64 flex-shrink-0 bg-bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-accent-blue" />
          <span className="text-sm font-semibold text-text-primary">Filters</span>
          {hasActiveFilters() && (
            <span className="w-2 h-2 rounded-full bg-accent-blue" />
          )}
        </div>
        <button
          id="reset-filters-btn"
          onClick={onReset}
          className="text-xs text-text-muted hover:text-accent-red transition-colors flex items-center gap-1"
        >
          <X size={12} /> Reset
        </button>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto">
        {/* Search location */}
        <Section title="Location" defaultOpen={true}>
          <input
            id="filter-location"
            type="text"
            value={filters.searchLocation}
            onChange={(e) => onChange({ searchLocation: e.target.value })}
            placeholder="Oblast, city, district…"
            className="w-full px-3 py-1.5 bg-bg-primary border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
          />
        </Section>

        {/* Date */}
        <Section title="Date Range" defaultOpen={true}>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-text-muted mb-1 block">From</label>
              <input
                id="filter-date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange({ dateFrom: e.target.value })}
                className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">To</label>
              <input
                id="filter-date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange({ dateTo: e.target.value })}
                className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
              />
            </div>
          </div>
        </Section>

        {/* Event Types */}
        <Section title="Event Type" defaultOpen={true}>
          <MultiCheckbox
            options={ALL_EVENT_TYPES}
            selected={filters.eventTypes}
            onChange={(v) => onChange({ eventTypes: v })}
            colorMap={EVENT_COLORS}
          />
        </Section>

        {/* Regions */}
        <Section title="Region (Oblast)">
          <MultiCheckbox
            options={ALL_REGIONS.slice(0, 12)}
            selected={filters.regions}
            onChange={(v) => onChange({ regions: v })}
          />
        </Section>

        {/* Fatalities */}
        <Section title="Min Lives Lost">
          <div className="space-y-2">
            <input
              id="filter-min-fatalities"
              type="range"
              min={0}
              max={100}
              step={1}
              value={filters.minFatalities}
              onChange={(e) => onChange({ minFatalities: parseInt(e.target.value) })}
              className="w-full accent-accent-blue"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>0</span>
              <span className="text-accent-blue font-medium">{filters.minFatalities}+</span>
              <span>100+</span>
            </div>
          </div>
        </Section>

        {/* Civilian Targeting */}
        <Section title="Civilian Targeting">
          <div className="flex gap-2">
            {(['all', 'Yes', 'No'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onChange({ civilianTargeting: v })}
                className={cn(
                  'flex-1 text-xs py-1 rounded border transition-colors',
                  filters.civilianTargeting === v
                    ? 'bg-accent-blue/20 border-accent-blue/50 text-accent-blue-light'
                    : 'border-border text-text-muted hover:text-text-primary',
                )}
              >
                {v === 'all' ? 'All' : v}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Filter count */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Filter size={12} />
          Active filters:{' '}
          <span className={cn('font-medium', hasActiveFilters() ? 'text-accent-blue' : 'text-text-muted')}>
            {(filters.regions.length > 0 ? 1 : 0) +
              (filters.eventTypes.length > 0 ? 1 : 0) +
              (filters.civilianTargeting !== 'all' ? 1 : 0) +
              (filters.minFatalities > 0 ? 1 : 0) +
              (filters.searchLocation ? 1 : 0)}
          </span>
        </div>
      </div>
    </aside>
  )
}
