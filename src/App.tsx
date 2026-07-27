import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { Sidebar } from './components/layout/Sidebar'
import { TopNavbar } from './components/layout/TopNavbar'
import { FilterPanel } from './components/layout/FilterPanel'

import { DashboardPage } from './pages/DashboardPage'
import { MapPage } from './pages/MapPage'
import { TimelinePage } from './pages/TimelinePage'
import { EquipmentPage } from './pages/EquipmentPage'
import { CivilianPage } from './pages/CivilianPage'
import { RegionsPage } from './pages/RegionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'

import { useACLEDData } from './hooks/useACLEDData'
import type { Page, FilterState } from './types'
import { cn } from './utils'

/** Default filter state */
const DEFAULT_FILTERS: FilterState = {
  dateFrom: '',
  dateTo: '',
  years: [],
  months: [],
  regions: [],
  eventTypes: [],
  minFatalities: 0,
  maxFatalities: 0,
  civilianTargeting: 'all',
  searchLocation: '',
}

export default function App() {
  const { events, monthly, stats, loading, progress, error, reload } = useACLEDData()

  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [globalSearch, setGlobalSearch] = useState('')

  // Sync global search into filter location
  useEffect(() => {
    setFilters((f) => ({ ...f, searchLocation: globalSearch }))
  }, [globalSearch])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key.toLowerCase()) {
        case 'd': setActivePage('dashboard'); break
        case 'm': setActivePage('map'); break
        case 't': setActivePage('timeline'); break
        case 'e': setActivePage('equipment'); break
        case 'r': setActivePage('regions'); break
        case '/': {
          e.preventDefault()
          document.getElementById('global-search')?.focus()
          break
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleFilterChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setGlobalSearch('')
  }, [])

  const handleDateChange = useCallback((from: string, to: string) => {
    setFilters((f) => ({ ...f, dateFrom: from, dateTo: to }))
  }, [])

  const handleNavigate = useCallback((page: Page) => {
    setActivePage(page)
    // Show map page without filters sidebar for full-width map
    if (page === 'map') setShowFilters(false)
    else setShowFilters(true)
  }, [])

  // Loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center gap-6">
        {/* Animated logo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-2xl bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center"
        >
          <span className="text-4xl">🛡️</span>
        </motion.div>

        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-text-primary">Russia–Ukraine War Analytics</h1>
          <p className="text-sm text-text-muted">Loading conflict intelligence data…</p>
        </div>

        {/* Progress indicator */}
        <div className="w-72 space-y-3">
          <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-blue rounded-full"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            />
          </div>
          <p className="text-xs text-text-muted text-center flex items-center justify-center gap-2">
            <Loader2 size={12} className="animate-spin" />
            {progress}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-6 mt-4">
            {[
              { label: 'Conflict Incidents', value: stats.total_events.toLocaleString() },
              { label: 'Lives Lost', value: stats.total_fatalities.toLocaleString() },
              { label: 'Date Range', value: '2022–2025' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-text-primary">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Error screen
  if (error) {
    return (
      <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-accent-red/15 border border-accent-red/30 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-text-primary mb-2">Failed to load data</h2>
          <p className="text-sm text-text-muted mb-1">{error}</p>
          <p className="text-xs text-text-muted">
            Make sure <code className="text-accent-blue bg-bg-card px-1 py-0.5 rounded">public/data/events_cleaned.csv</code> exists.
          </p>
        </div>
        <button onClick={reload} className="btn-primary mt-2">Retry</button>
      </div>
    )
  }

  return (
    <div className={cn('flex h-screen overflow-hidden bg-bg-primary', !darkMode && 'bg-slate-100')}>
      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
          onRefresh={reload}
          searchQuery={globalSearch}
          onSearch={setGlobalSearch}
          loading={false}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateChange={handleDateChange}
        />

        {/* Content row = filter panel + page */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Filter panel (hideable on map page) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="filter-panel"
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0"
              >
                <FilterPanel
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleFilterReset}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page content */}
          <main className="flex-1 min-w-0 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {activePage === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <DashboardPage events={events} monthly={monthly} filters={filters} loading={false} />
                </motion.div>
              )}
              {activePage === 'map' && (
                <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                  <MapPage events={events} filters={filters} loading={false} />
                </motion.div>
              )}
              {activePage === 'timeline' && (
                <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <TimelinePage events={events} filters={filters} />
                </motion.div>
              )}
              {activePage === 'equipment' && (
                <motion.div key="equipment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <EquipmentPage monthly={monthly} />
                </motion.div>
              )}
              {activePage === 'civilian' && (
                <motion.div key="civilian" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <CivilianPage events={events} monthly={monthly} filters={filters} />
                </motion.div>
              )}
              {activePage === 'regions' && (
                <motion.div key="regions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <RegionsPage events={events} filters={filters} />
                </motion.div>
              )}
              {activePage === 'reports' && (
                <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <ReportsPage events={events} filters={filters} />
                </motion.div>
              )}
              {activePage === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <SettingsPage />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
