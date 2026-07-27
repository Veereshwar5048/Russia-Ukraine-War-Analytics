import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import {
  ZoomIn, ZoomOut, RotateCcw, Layers,
  Maximize2, Minimize2, Thermometer, CircleDot,
} from 'lucide-react'
import type { ACLEDEvent, MapView } from '../../types'
import { getEventTypeColor, getMarkerRadius } from '../../utils/constants'
import { truncate, formatNumber } from '../../utils'
import { cn } from '../../utils'

// Ukraine geographic centre
const UKRAINE_CENTER: [number, number] = [48.3794, 31.1656]
const DEFAULT_ZOOM = 6

// Cap markers for browser performance (sample evenly)
const MAX_MARKERS = 6000

// ─── Tile layer URLs (all free / no token required) ───────────────────────────
const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
  },
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © OpenTopoMap',
    subdomains: 'abc',
  },
}

type TileLayerKey = keyof typeof TILE_LAYERS

// ─── Inner control component — uses useMap() hook (must be inside MapContainer) ─
function MapControls({
  mapView,
  tileKey,
  onViewChange,
  onLayerChange,
  onFullscreen,
  isFullscreen,
}: {
  mapView: MapView
  tileKey: TileLayerKey
  onViewChange: (v: MapView) => void
  onLayerChange: () => void
  onFullscreen: () => void
  isFullscreen: boolean
}) {
  const map = useMap()

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[1000]">
      <button id="map-zoom-in" onClick={() => map.zoomIn()} className="map-ctrl-btn" title="Zoom in"><ZoomIn size={14} /></button>
      <button id="map-zoom-out" onClick={() => map.zoomOut()} className="map-ctrl-btn" title="Zoom out"><ZoomOut size={14} /></button>
      <button id="map-reset" onClick={() => map.setView(UKRAINE_CENTER, DEFAULT_ZOOM)} className="map-ctrl-btn" title="Reset view"><RotateCcw size={14} /></button>
      <div className="h-px bg-white/10 my-0.5" />
      <button
        id="map-markers"
        onClick={() => onViewChange('markers')}
        className={cn('map-ctrl-btn', mapView === 'markers' && 'bg-blue-500/30 text-blue-300')}
        title="Marker view"
      >
        <CircleDot size={14} />
      </button>
      <button
        id="map-heatmap"
        onClick={() => onViewChange('heatmap')}
        className={cn('map-ctrl-btn', mapView === 'heatmap' && 'bg-red-500/30 text-red-300')}
        title="Heatmap view"
      >
        <Thermometer size={14} />
      </button>
      <div className="h-px bg-white/10 my-0.5" />
      <button id="map-layer" onClick={onLayerChange} className="map-ctrl-btn" title={`Switch tile layer (current: ${tileKey})`}><Layers size={14} /></button>
      <button id="map-fullscreen" onClick={onFullscreen} className="map-ctrl-btn" title="Toggle fullscreen">
        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>
    </div>
  )
}

// ─── Popup content builder ────────────────────────────────────────────────────
function EventPopup({ ev }: { ev: ACLEDEvent }) {
  return (
    <div className="text-xs" style={{ minWidth: 240, fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: getEventTypeColor(ev.event_type) }}
        />
        <strong style={{ color: getEventTypeColor(ev.event_type) }}>{ev.event_type}</strong>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Date', ev.event_date],
            ['Location', ev.specific_location || ev.admin_lvl2 || '—'],
            ['Region', ev.admin_lvl1],
            ['Sub-type', ev.sub_event_type],
            ['Actor 1', truncate(ev.actor1, 38)],
            ['Actor 2', truncate(ev.actor2, 38) || '—'],
            ['Lives Lost', String(ev.fatalities)],
          ].map(([label, val]) => (
            <tr key={label}>
              <td style={{ color: '#9CA3AF', padding: '2px 0', width: 80, verticalAlign: 'top' }}>{label}</td>
              <td style={{
                color: label === 'Lives Lost' && ev.fatalities > 0 ? '#EF4444' : '#F9FAFB',
                fontWeight: label === 'Lives Lost' && ev.fatalities > 0 ? 700 : 400,
                padding: '2px 0',
              }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {ev.civilian_targeting === 'Yes' && (
        <p style={{ color: '#F59E0B', fontSize: 10, marginTop: 6 }}>⚠ Civilian targeting reported</p>
      )}
      {ev.notes && (
        <p style={{ color: '#9CA3AF', fontSize: 10, marginTop: 6, borderTop: '1px solid #374151', paddingTop: 6, lineHeight: 1.5 }}>
          {truncate(ev.notes, 180)}
        </p>
      )}
    </div>
  )
}

// ─── Main map component ───────────────────────────────────────────────────────
interface ConflictMapProps {
  events: ACLEDEvent[]
  loading?: boolean
}

export function ConflictMap({ events, loading = false }: ConflictMapProps) {
  const [mapView, setMapView] = useState<MapView>('markers')
  const [tileKey, setTileKey] = useState<TileLayerKey>('standard')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Evenly sample events if there are too many for smooth rendering
  const sampledEvents = useMemo(() => {
    if (events.length <= MAX_MARKERS) return events
    const step = Math.ceil(events.length / MAX_MARKERS)
    return events.filter((_, i) => i % step === 0)
  }, [events])

  const cycleTileLayer = useCallback(() => {
    setTileKey((k) => {
      const keys = Object.keys(TILE_LAYERS) as TileLayerKey[]
      const next = keys[(keys.indexOf(k) + 1) % keys.length]
      return next
    })
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    if (!isFullscreen) {
      el.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [isFullscreen])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const tile = TILE_LAYERS[tileKey]

  if (loading) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden bg-bg-elevated flex items-center justify-center">
        <p className="text-text-muted text-sm animate-pulse">Loading map…</p>
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'relative rounded-xl overflow-hidden border border-border w-full h-full',
        isFullscreen && 'rounded-none',
      )}
      style={{ minHeight: 420 }}
    >
      {/* React-Leaflet MapContainer */}
      <MapContainer
        center={UKRAINE_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        style={{ width: '100%', height: '100%', minHeight: 420, background: '#0d1b2a' }}
        attributionControl={true}
      >
        {/* Tile Layer — free OpenStreetMap / Carto tiles */}
        <TileLayer
          key={tileKey}
          url={tile.url}
          attribution={tile.attribution}
          subdomains={tile.subdomains}
          maxZoom={19}
        />

        {/* Event markers */}
        {sampledEvents.map((ev, i) => {
          const color = getEventTypeColor(ev.event_type)
          const radius = mapView === 'heatmap'
            ? 10
            : getMarkerRadius(ev.fatalities)

          return (
            <CircleMarker
              key={i}
              center={[ev.latitude, ev.longitude]}
              radius={radius}
              pathOptions={{
                color: mapView === 'heatmap' ? 'transparent' : color,
                fillColor: color,
                fillOpacity: mapView === 'heatmap' ? 0.18 : (ev.fatalities > 0 ? 0.82 : 0.6),
                weight: mapView === 'heatmap' ? 0 : 1.5,
              }}
            >
              {/* Only attach popups in markers mode to keep heatmap fast */}
              {mapView === 'markers' && (
                <Popup maxWidth={320} className="conflict-popup">
                  <EventPopup ev={ev} />
                </Popup>
              )}
            </CircleMarker>
          )
        })}

        {/* Controls (must be inside MapContainer to use useMap()) */}
        <MapControls
          mapView={mapView}
          tileKey={tileKey}
          onViewChange={setMapView}
          onLayerChange={cycleTileLayer}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </MapContainer>

      {/* Legend overlay */}
      <div
        className="absolute bottom-3 left-3 z-[1000] rounded-lg p-3 text-xs"
        style={{ background: 'rgba(17,24,39,0.88)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="font-semibold text-gray-400 mb-2 uppercase tracking-wider text-[10px]">Event Type</p>
        {[
          ['Battles', '#EF4444'],
          ['Explosions/Remote violence', '#F97316'],
          ['Violence against civilians', '#A855F7'],
          ['Strategic developments', '#3B82F6'],
          ['Protests / Riots', '#10B981'],
        ].map(([label, color]) => (
          <div key={label} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-gray-400">{label}</span>
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-white/10 text-gray-500 text-[10px]">
          {sampledEvents.length.toLocaleString()} of {events.length.toLocaleString()} markers shown
        </div>
      </div>

      {/* Tile layer badge */}
      <div
        className="absolute top-3 left-3 z-[1000] rounded px-2 py-1 text-[10px] text-gray-400 uppercase tracking-wider"
        style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(8px)' }}
      >
        {tileKey} · OpenStreetMap
      </div>

      {/* Inline styles for map controls */}
      <style>{`
        .map-ctrl-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(17,24,39,0.88);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 6px;
          color: #9CA3AF;
          cursor: pointer;
          transition: all 0.15s;
          backdrop-filter: blur(8px);
        }
        .map-ctrl-btn:hover {
          color: #F9FAFB;
          background: rgba(31,41,55,0.95);
          border-color: rgba(255,255,255,0.2);
        }
        /* Leaflet popup dark theme */
        .conflict-popup .leaflet-popup-content-wrapper {
          background: #111827 !important;
          color: #F9FAFB !important;
          border: 1px solid #1F2937 !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          padding: 0 !important;
        }
        .conflict-popup .leaflet-popup-content {
          margin: 12px !important;
        }
        .conflict-popup .leaflet-popup-tip {
          background: #111827 !important;
        }
        .conflict-popup .leaflet-popup-close-button {
          color: #6B7280 !important;
          font-size: 16px !important;
        }
        .leaflet-control-attribution {
          background: rgba(17,24,39,0.7) !important;
          color: #6B7280 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #9CA3AF !important;
        }
      `}</style>
    </div>
  )
}
