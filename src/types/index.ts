// ─── Core ACLED Event ─────────────────────────────────────────────────────────
export interface ACLEDEvent {
  event_date: string;        // ISO YYYY-MM-DD
  event_type: EventType;
  sub_event_type: string;
  actor1: string;
  assoc_actor_1: string;
  inter1: string;
  actor2: string;
  assoc_actor_2: string;
  inter2: string;
  civilian_targeting: 'Yes' | 'No' | '';
  country: string;
  admin_lvl1: string;        // Oblast / region
  admin_lvl2: string;
  admin_lvl3: string;
  specific_location: string;
  latitude: number;
  longitude: number;
  geo_precision: number;
  source: string;
  source_scale: string;
  notes: string;
  fatalities: number;
  tags: string;
  population_1km: number;
  population_5km: number;
  year: string;
  month: string;             // YYYY-MM
}

// ─── Event types (ACLED standard categories) ──────────────────────────────────
export type EventType =
  | 'Battles'
  | 'Explosions/Remote violence'
  | 'Violence against civilians'
  | 'Protests'
  | 'Riots'
  | 'Strategic developments'
  | string;

// ─── Monthly summary row ──────────────────────────────────────────────────────
export interface MonthlySummary {
  year_month: string;                        // YYYY-MM
  ukr_military_aid_allocated: number | null;
  ukr_financial_aid_allocated: number | null;
  ukr_humanitarian_aid_allocated: number | null;
  total_aid_allocated: number | null;
  rus_monthly_sanctions: number | null;
  inflation_rate_percent_ukr: number | null;
  inflation_rate_percent_rus: number | null;
  tot_events: number;
  tot_shell_artil_missile_events: number;
  tot_air_drone_strike_events: number;
  tot_armed_clash_events: number;
  tot_ied_landmine_etc_events: number;
  tot_attack_events: number;
  tot_fatalities: number;
  tot_civ_targetting: number;
  civilian_killed: number;
  civilian_injuried: number;
  civilian_casualties: number;
  rus_military_personnel_losses: number | null;
  rus_tank_losses: number | null;
  rus_armored_fighting_vehicle_losses: number | null;
  rus_artillery_system_losses: number | null;
  rus_mlrs_losses: number | null;
  rus_anti_aircraft_warfare_losses: number | null;
  rus_plane_losses: number | null;
  rus_helicopter_losses: number | null;
  rus_uav_losses: number | null;
  rus_cruise_missile_losses: number | null;
  rus_ship_losses: number | null;
  rus_car_cistern_losses: number | null;
  rus_special_equipment_losses: number | null;
  refugees_czechia: number | null;
  refugees_germany: number | null;
  refugees_ireland: number | null;
  refugees_italy: number | null;
  refugees_netherlands: number | null;
  refugees_poland: number | null;
  refugees_romania: number | null;
  refugees_slovakia: number | null;
  refugees_spain: number | null;
  refugees_united_kingdom: number | null;
}

// ─── Quick stats (pre-computed JSON) ─────────────────────────────────────────
export interface QuickStats {
  total_events: number;
  total_fatalities: number;
  civilian_fatalities: number;
  date_min: string;
  date_max: string;
  top_event_types: Record<string, number>;
  top_regions: Record<string, number>;
}

// ─── Filter state ─────────────────────────────────────────────────────────────
export interface FilterState {
  dateFrom: string;
  dateTo: string;
  years: string[];
  months: string[];
  regions: string[];
  eventTypes: string[];
  minFatalities: number;
  maxFatalities: number;
  civilianTargeting: 'all' | 'Yes' | 'No';
  searchLocation: string;
}

// ─── Chart data shapes ────────────────────────────────────────────────────────
export interface TimelinePoint {
  date: string;
  events: number;
  fatalities: number;
}

export interface EventTypeStat {
  name: string;
  count: number;
  fatalities: number;
  color: string;
}

export interface RegionStat {
  region: string;
  events: number;
  fatalities: number;
  [key: string]: string | number;
}

export interface KPICard {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: 'blue' | 'red' | 'amber' | 'green' | 'purple';
  sparkline: number[];
  trend?: number;
  trendLabel?: string;
}

// ─── Map view options ─────────────────────────────────────────────────────────
export type MapView = 'markers' | 'heatmap' | 'density';
export type MapLayer = 'standard' | 'satellite' | 'terrain';

// ─── Navigation pages ─────────────────────────────────────────────────────────
export type Page =
  | 'dashboard'
  | 'map'
  | 'timeline'
  | 'equipment'
  | 'civilian'
  | 'regions'
  | 'reports'
  | 'settings';
