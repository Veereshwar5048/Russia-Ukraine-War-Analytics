import { useState, useEffect, useCallback } from 'react'
import type { ACLEDEvent, MonthlySummary, QuickStats } from '../types'
import { loadEventsCSV, loadMonthlySummaryCSV, loadQuickStats } from '../services/dataLoader'

export interface DataState {
  events: ACLEDEvent[]
  monthly: MonthlySummary[]
  stats: QuickStats | null
  loading: boolean
  progress: string
  error: string | null
}

/** Top-level hook that loads all three data sources */
export function useACLEDData(): DataState & { reload: () => void } {
  const [state, setState] = useState<DataState>({
    events: [],
    monthly: [],
    stats: null,
    loading: true,
    progress: 'Initialising…',
    error: null,
  })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null, progress: 'Loading statistics…' }))
    try {
      const stats = await loadQuickStats()
      setState((s) => ({ ...s, stats, progress: 'Loading monthly summary…' }))

      const monthly = await loadMonthlySummaryCSV()
      setState((s) => ({ ...s, monthly, progress: `Loading ${stats.total_events.toLocaleString()} conflict incidents…` }))

      const events = await loadEventsCSV()
      setState({ events, monthly, stats, loading: false, progress: 'Ready', error: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setState((s) => ({ ...s, loading: false, error: msg, progress: 'Error' }))
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return { ...state, reload: load }
}
