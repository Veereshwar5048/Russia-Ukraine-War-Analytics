import Papa from 'papaparse'
import type { ACLEDEvent, MonthlySummary, QuickStats } from '../types'

/** Parse a numeric string, returning 0 on failure */
function parseNum(val: string | undefined | null): number {
  if (!val || val.trim() === '' || val === 'NA') return 0
  const n = parseFloat(val)
  return isNaN(n) ? 0 : n
}

/** Parse nullable numeric */
function parseNumOrNull(val: string | undefined | null): number | null {
  if (!val || val.trim() === '' || val === 'NA') return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

/** Load and parse the cleaned events CSV using PapaParse */
export async function loadEventsCSV(url = '/data/events_cleaned.csv'): Promise<ACLEDEvent[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      worker: false,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const events: ACLEDEvent[] = rows.map((row) => ({
          event_date: row.event_date ?? '',
          event_type: row.event_type ?? 'Unknown',
          sub_event_type: row.sub_event_type ?? '',
          actor1: row.actor1 ?? '',
          assoc_actor_1: row.assoc_actor_1 ?? '',
          inter1: row.inter1 ?? '',
          actor2: row.actor2 ?? '',
          assoc_actor_2: row.assoc_actor_2 ?? '',
          inter2: row.inter2 ?? '',
          civilian_targeting: (row.civilian_targeting === 'Yes' ? 'Yes' : 'No') as 'Yes' | 'No',
          country: row.country ?? 'Ukraine',
          admin_lvl1: row.admin_lvl1 ?? '',
          admin_lvl2: row.admin_lvl2 ?? '',
          admin_lvl3: row.admin_lvl3 ?? '',
          specific_location: row.specific_location ?? '',
          latitude: parseNum(row.latitude),
          longitude: parseNum(row.longitude),
          geo_precision: parseNum(row.geo_precision),
          source: row.source ?? '',
          source_scale: row.source_scale ?? '',
          notes: row.notes ?? '',
          fatalities: parseNum(row.fatalities),
          tags: row.tags ?? '',
          population_1km: parseNum(row.population_1km),
          population_5km: parseNum(row.population_5km),
          year: row.year ?? '',
          month: row.month ?? '',
        }))
        resolve(events)
      },
      error: (err) => reject(err),
    })
  })
}

/** Load and parse monthly summary CSV */
export async function loadMonthlySummaryCSV(url = '/data/monthly_summary_cleaned.csv'): Promise<MonthlySummary[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const summaries: MonthlySummary[] = rows.map((row) => ({
          year_month: row.year_month ?? '',
          ukr_military_aid_allocated: parseNumOrNull(row.ukr_military_aid_allocated),
          ukr_financial_aid_allocated: parseNumOrNull(row.ukr_financial_aid_allocated),
          ukr_humanitarian_aid_allocated: parseNumOrNull(row.ukr_humanitarian_aid_allocated),
          total_aid_allocated: parseNumOrNull(row.total_aid_allocated),
          rus_monthly_sanctions: parseNumOrNull(row.rus_monthly_sanctions),
          inflation_rate_percent_ukr: parseNumOrNull(row.inflation_rate_percent_ukr),
          inflation_rate_percent_rus: parseNumOrNull(row.inflation_rate_percent_rus),
          tot_events: parseNum(row.tot_events),
          tot_shell_artil_missile_events: parseNum(row.tot_shell_artil_missile_events),
          tot_air_drone_strike_events: parseNum(row.tot_air_drone_strike_events),
          tot_armed_clash_events: parseNum(row.tot_armed_clash_events),
          tot_ied_landmine_etc_events: parseNum(row.tot_ied_landmine_etc_events),
          tot_attack_events: parseNum(row.tot_attack_events),
          tot_fatalities: parseNum(row.tot_fatalities),
          tot_civ_targetting: parseNum(row.tot_civ_targetting),
          civilian_killed: parseNum(row.civilian_killed),
          civilian_injuried: parseNum(row.civilian_injuried),
          civilian_casualties: parseNum(row.civilian_casualties),
          rus_military_personnel_losses: parseNumOrNull(row.rus_military_personnel_losses),
          rus_tank_losses: parseNumOrNull(row.rus_tank_losses),
          rus_armored_fighting_vehicle_losses: parseNumOrNull(row.rus_armored_fighting_vehicle_losses),
          rus_artillery_system_losses: parseNumOrNull(row.rus_artillery_system_losses),
          rus_mlrs_losses: parseNumOrNull(row.rus_mlrs_losses),
          rus_anti_aircraft_warfare_losses: parseNumOrNull(row.rus_anti_aircraft_warfare_losses),
          rus_plane_losses: parseNumOrNull(row.rus_plane_losses),
          rus_helicopter_losses: parseNumOrNull(row.rus_helicopter_losses),
          rus_uav_losses: parseNumOrNull(row.rus_uav_losses),
          rus_cruise_missile_losses: parseNumOrNull(row.rus_cruise_missile_losses),
          rus_ship_losses: parseNumOrNull(row.rus_ship_losses),
          rus_car_cistern_losses: parseNumOrNull(row.rus_car_cistern_losses),
          rus_special_equipment_losses: parseNumOrNull(row.rus_special_equipment_losses),
          refugees_czechia: parseNumOrNull(row.refugees_czechia),
          refugees_germany: parseNumOrNull(row.refugees_germany),
          refugees_ireland: parseNumOrNull(row.refugees_ireland),
          refugees_italy: parseNumOrNull(row.refugees_italy),
          refugees_netherlands: parseNumOrNull(row.refugees_netherlands),
          refugees_poland: parseNumOrNull(row.refugees_poland),
          refugees_romania: parseNumOrNull(row.refugees_romania),
          refugees_slovakia: parseNumOrNull(row.refugees_slovakia),
          refugees_spain: parseNumOrNull(row.refugees_spain),
          refugees_united_kingdom: parseNumOrNull(row.refugees_united_kingdom),
        }))
        resolve(summaries)
      },
      error: (err) => reject(err),
    })
  })
}

/** Load pre-computed quick stats */
export async function loadQuickStats(url = '/data/quick_stats.json'): Promise<QuickStats> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load stats: ${res.statusText}`)
  return res.json() as Promise<QuickStats>
}
