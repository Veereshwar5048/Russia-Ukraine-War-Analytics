import { useState } from 'react'
import { Search, RefreshCw, Sun, Moon, CalendarDays, Shield } from 'lucide-react'
import { cn } from '../../utils'

interface TopNavbarProps {
  darkMode: boolean
  onToggleDark: () => void
  onRefresh: () => void
  searchQuery: string
  onSearch: (q: string) => void
  loading: boolean
  dateFrom: string
  dateTo: string
  onDateChange: (from: string, to: string) => void
}

export function TopNavbar({
  darkMode, onToggleDark, onRefresh, searchQuery, onSearch, loading, dateFrom, dateTo, onDateChange,
}: TopNavbarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  return (
    <header className="h-14 bg-bg-card border-b border-border flex items-center px-4 gap-3 sm:gap-4 flex-shrink-0 z-30">
      {/* Title */}
      <div className="flex items-center gap-2 mr-2 sm:mr-4 flex-shrink-0">
        <Shield size={18} className="text-accent-blue flex-shrink-0" />
        <span className="text-sm font-bold text-text-primary hidden md:block">
          Russia–Ukraine War Analytics
        </span>
        {/* Live indicator */}
        <span className="flex items-center gap-1.5 ml-1 sm:ml-2">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] text-accent-green font-medium tracking-wide">LIVE</span>
        </span>
      </div>

      {/* Global Search */}
      <div className="relative flex-1 max-w-xs sm:max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          id="global-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search location, actor, notes…"
          aria-label="Global search"
          className="w-full pl-8 pr-3 py-1.5 bg-bg-primary border border-border rounded-lg text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Date Selector */}
      <div className="relative">
        <button
          id="date-selector-btn"
          onClick={() => setShowDatePicker((v) => !v)}
          aria-expanded={showDatePicker}
          aria-label="Filter date range"
          className={cn(
            'flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-all',
            showDatePicker
              ? 'border-accent-blue/50 bg-accent-blue/10 text-accent-blue-light'
              : 'border-border text-text-secondary hover:text-text-primary hover:border-border-subtle',
          )}
        >
          <CalendarDays size={14} className="text-accent-blue" />
          <span className="hidden sm:inline-block text-xs font-mono">
            {dateFrom || '2022-02-24'} → {dateTo || '2025-03-04'}
          </span>
        </button>

        {showDatePicker && (
          <div className="absolute right-0 top-full mt-2 card p-4 z-50 w-72 space-y-3 shadow-card" role="dialog" aria-label="Date range picker">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-text-muted mb-1 block">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateChange(e.target.value, dateTo)}
                  className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateChange(dateFrom, e.target.value)}
                  className="w-full px-2 py-1.5 bg-bg-primary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                ['All Time', '2022-02-24', '2025-03-04'],
                ['2022', '2022-01-01', '2022-12-31'],
                ['2023', '2023-01-01', '2023-12-31'],
                ['2024', '2024-01-01', '2024-12-31'],
                ['2025', '2025-01-01', '2025-12-31'],
              ].map(([label, from, to]) => (
                <button
                  key={label}
                  onClick={() => { onDateChange(from, to); setShowDatePicker(false) }}
                  className="text-xs px-2 py-1 rounded bg-bg-primary border border-border text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refresh */}
      <button
        id="refresh-btn"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh data"
        aria-label="Refresh data"
        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
      >
        <RefreshCw size={15} className={cn(loading && 'animate-spin')} />
      </button>

      {/* Dark / Light toggle */}
      <button
        id="dark-mode-toggle"
        onClick={onToggleDark}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme mode"
        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
      >
        {darkMode ? <Sun size={15} className="text-accent-amber" /> : <Moon size={15} />}
      </button>
    </header>
  )
}
