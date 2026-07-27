/** Color palette for each ACLED event type */
export const EVENT_TYPE_COLORS: Record<string, string> = {
  'Battles': '#EF4444',
  'Explosions/Remote violence': '#F97316',
  'Violence against civilians': '#A855F7',
  'Strategic developments': '#3B82F6',
  'Protests': '#10B981',
  'Riots': '#F59E0B',
  'Unknown': '#6B7280',
}

/** Get color for an event type */
export function getEventTypeColor(eventType: string): string {
  return EVENT_TYPE_COLORS[eventType] ?? '#6B7280'
}

/** Get radius of a map marker based on fatalities */
export function getMarkerRadius(fatalities: number): number {
  if (fatalities === 0) return 5
  if (fatalities < 5) return 7
  if (fatalities < 20) return 10
  if (fatalities < 50) return 14
  if (fatalities < 100) return 18
  return 22
}

/** Get opacity based on fatalities */
export function getMarkerOpacity(fatalities: number): number {
  if (fatalities === 0) return 0.6
  if (fatalities < 10) return 0.75
  return 0.9
}

/** Region display names (clean up ACLED admin_lvl1 values) */
export const REGION_DISPLAY: Record<string, string> = {
  'Donetsk': 'Donetsk Oblast',
  'Kharkiv': 'Kharkiv Oblast',
  'Kherson': 'Kherson Oblast',
  'Zaporizhia': 'Zaporizhia Oblast',
  'Luhansk': 'Luhansk Oblast',
  'Sumy': 'Sumy Oblast',
  'Mykolaiv': 'Mykolaiv Oblast',
  'Dnipropetrovsk': 'Dnipropetrovsk Oblast',
  'Kyiv': 'Kyiv Oblast',
  'Chernihiv': 'Chernihiv Oblast',
  'Belgorod': 'Belgorod (Russia)',
  'Kursk': 'Kursk (Russia)',
}

export function getRegionDisplay(region: string): string {
  return REGION_DISPLAY[region] ?? region
}

/** All filterable event types */
export const ALL_EVENT_TYPES = [
  'Battles',
  'Explosions/Remote violence',
  'Violence against civilians',
  'Strategic developments',
  'Protests',
  'Riots',
]

/** Ukrainian Oblasts list */
export const ALL_REGIONS = [
  'Donetsk', 'Kharkiv', 'Kherson', 'Zaporizhia', 'Luhansk',
  'Sumy', 'Mykolaiv', 'Dnipropetrovsk', 'Kyiv', 'Chernihiv',
  'Belgorod', 'Kursk', 'Odesa', 'Lviv', 'Poltava', 'Zhytomyr',
  'Vinnytsia', 'Khmelnytskyi', 'Rivne', 'Volyn', 'Ivano-Frankivsk',
  'Ternopil', 'Cherkasy', 'Kirovohrad', 'Crimea',
]

/** Equipment category labels */
export const EQUIPMENT_LABELS: Record<string, string> = {
  rus_tank_losses: 'Tanks',
  rus_armored_fighting_vehicle_losses: 'Armoured Vehicles',
  rus_artillery_system_losses: 'Artillery Systems',
  rus_mlrs_losses: 'MLRS',
  rus_anti_aircraft_warfare_losses: 'Anti-Aircraft',
  rus_plane_losses: 'Aircraft',
  rus_helicopter_losses: 'Helicopters',
  rus_uav_losses: 'UAVs / Drones',
  rus_cruise_missile_losses: 'Cruise Missiles',
  rus_ship_losses: 'Naval Vessels',
  rus_car_cistern_losses: 'Vehicles / Fuel Tankers',
  rus_special_equipment_losses: 'Special Equipment',
}
