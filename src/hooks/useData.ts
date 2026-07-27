import { useMemo } from 'react'
import type { ACLEDEvent, FilterState, TimelinePoint, EventTypeStat, RegionStat } from '../types'
import { getEventTypeColor } from '../utils/constants'

/** Apply the global filter state to the full events array */
export function useFilteredEvents(
  events: ACLEDEvent[],
  filters: FilterState,
): ACLEDEvent[] {
  return useMemo(() => {
    return events.filter((ev) => {
      // Date range
      if (filters.dateFrom && ev.event_date < filters.dateFrom) return false
      if (filters.dateTo && ev.event_date > filters.dateTo) return false
      // Year filter
      if (filters.years.length > 0 && !filters.years.includes(ev.year)) return false
      // Region (admin_lvl1)
      if (filters.regions.length > 0 && !filters.regions.includes(ev.admin_lvl1)) return false
      // Event type
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(ev.event_type)) return false
      // Fatalities
      if (ev.fatalities < filters.minFatalities) return false
      if (filters.maxFatalities > 0 && ev.fatalities > filters.maxFatalities) return false
      // Civilian targeting
      if (filters.civilianTargeting !== 'all' && ev.civilian_targeting !== filters.civilianTargeting) return false
      // Location search
      if (filters.searchLocation) {
        const q = filters.searchLocation.toLowerCase()
        const loc = `${ev.admin_lvl1} ${ev.admin_lvl2} ${ev.specific_location}`.toLowerCase()
        if (!loc.includes(q)) return false
      }
      return true
    })
  }, [events, filters])
}

/** Compute KPI sparkline values from monthly event counts */
export function useSparklines(events: ACLEDEvent[]): Record<string, number[]> {
  return useMemo(() => {
    const monthMap: Record<string, { events: number; fatalities: number; civilian: number; explosions: number; airStrikes: number; strategic: number }> = {}

    events.forEach((ev) => {
      const m = ev.month
      if (!m) return
      if (!monthMap[m]) monthMap[m] = { events: 0, fatalities: 0, civilian: 0, explosions: 0, airStrikes: 0, strategic: 0 }
      monthMap[m].events++
      monthMap[m].fatalities += ev.fatalities
      if (ev.civilian_targeting === 'Yes') monthMap[m].civilian += ev.fatalities
      if (ev.event_type === 'Explosions/Remote violence') monthMap[m].explosions++
      if (ev.sub_event_type.toLowerCase().includes('air') || ev.sub_event_type.toLowerCase().includes('drone')) monthMap[m].airStrikes++
      if (ev.event_type === 'Strategic developments') monthMap[m].strategic++
    })

    const months = Object.keys(monthMap).sort().slice(-12)
    const pick = (key: keyof typeof monthMap[string]) => months.map((m) => monthMap[m]?.[key] ?? 0)

    return {
      events: pick('events'),
      fatalities: pick('fatalities'),
      civilian: pick('civilian'),
      explosions: pick('explosions'),
      airStrikes: pick('airStrikes'),
      strategic: pick('strategic'),
    }
  }, [events])
}

/** Aggregate events into timeline data points (by month) */
export function useTimelineData(events: ACLEDEvent[]): TimelinePoint[] {
  return useMemo(() => {
    const map: Record<string, { events: number; fatalities: number }> = {}
    events.forEach((ev) => {
      const key = ev.month
      if (!key) return
      if (!map[key]) map[key] = { events: 0, fatalities: 0 }
      map[key].events++
      map[key].fatalities += ev.fatalities
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }))
  }, [events])
}

/** Aggregate events by event type */
export function useEventTypeStats(events: ACLEDEvent[]): EventTypeStat[] {
  return useMemo(() => {
    const map: Record<string, { count: number; fatalities: number }> = {}
    events.forEach((ev) => {
      const t = ev.event_type || 'Unknown'
      if (!map[t]) map[t] = { count: 0, fatalities: 0 }
      map[t].count++
      map[t].fatalities += ev.fatalities
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([name, vals]) => ({
        name,
        ...vals,
        color: getEventTypeColor(name),
      }))
  }, [events])
}

/** Aggregate events by region, stacked by event type */
export function useRegionStats(events: ACLEDEvent[]): RegionStat[] {
  return useMemo(() => {
    const map: Record<string, RegionStat> = {}
    events.forEach((ev) => {
      const r = ev.admin_lvl1 || 'Unknown'
      if (!map[r]) map[r] = { region: r, events: 0, fatalities: 0 }
      map[r].events++
      map[r].fatalities += ev.fatalities
      const et = ev.event_type || 'Unknown'
      map[r][et] = ((map[r][et] as number) || 0) + 1
    })
    return Object.values(map)
      .sort((a, b) => (b.events as number) - (a.events as number))
      .slice(0, 15)
  }, [events])
}

/** Compute auto-insights from filtered events */
export function useInsights(events: ACLEDEvent[]) {
  return useMemo(() => {
    if (events.length === 0) return null

    // Most affected region
    const regionCounts: Record<string, number> = {}
    const monthFatalities: Record<string, number> = {}
    const actorCounts: Record<string, number> = {}
    let maxFatalityEvent = events[0]

    events.forEach((ev) => {
      regionCounts[ev.admin_lvl1] = (regionCounts[ev.admin_lvl1] || 0) + 1
      monthFatalities[ev.month] = (monthFatalities[ev.month] || 0) + ev.fatalities
      actorCounts[ev.actor1] = (actorCounts[ev.actor1] || 0) + 1
      if (ev.fatalities > maxFatalityEvent.fatalities) maxFatalityEvent = ev
    })

    const mostAffectedRegion = Object.entries(regionCounts).sort(([, a], [, b]) => b - a)[0]
    const mostActiveActor = Object.entries(actorCounts).sort(([, a], [, b]) => b - a)[0]
    const deadliestMonth = Object.entries(monthFatalities).sort(([, a], [, b]) => b - a)[0]

    // Month-over-month change
    const monthSorted = Object.entries(monthFatalities).sort(([a], [b]) => a.localeCompare(b))
    let largestIncrease = { month: '', change: 0 }
    for (let i = 1; i < monthSorted.length; i++) {
      const change = monthSorted[i][1] - monthSorted[i - 1][1]
      if (change > largestIncrease.change) {
        largestIncrease = { month: monthSorted[i][0], change }
      }
    }

    // Event type distribution
    const typeCounts: Record<string, number> = {}
    events.forEach((ev) => { typeCounts[ev.event_type] = (typeCounts[ev.event_type] || 0) + 1 })
    const mostCommonType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]

    return {
      mostAffectedRegion: mostAffectedRegion ? { region: mostAffectedRegion[0], count: mostAffectedRegion[1] } : null,
      mostActiveActor: mostActiveActor ? { actor: mostActiveActor[0], count: mostActiveActor[1] } : null,
      deadliestMonth: deadliestMonth ? { month: deadliestMonth[0], fatalities: deadliestMonth[1] } : null,
      highestFatalityEvent: maxFatalityEvent,
      largestIncrease,
      mostCommonEventType: mostCommonType ? { type: mostCommonType[0], count: mostCommonType[1] } : null,
    }
  }, [events])
}
