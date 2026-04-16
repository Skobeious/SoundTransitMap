import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getLineColor, LINES } from '../utils/lineConfig'
import { deduplicateShapes } from '../utils/gtfsParser'
import TrainMarker from './TrainMarker'
import StationMarker from './StationMarker'

const SEATTLE_CENTER = [47.6062, -122.3321]
const INITIAL_ZOOM = 12
const MIN_ZOOM = 11
// Bounds covering the full Sound Transit service area (Everett → Lakewood)
const MAX_BOUNDS = [
  [46.95, -123.0],  // SW corner (south of Lakewood, west of coast)
  [48.10, -121.8],  // NE corner (north of Everett, east of Cascades)
]

// Slight offset (in degrees) to visually separate shared-corridor lines
const OFFSET_STEP = 0.0003

function FitBounds({ shapes }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (!shapes || shapes.length === 0 || fitted.current) return
    const allCoords = shapes.flatMap(s => s.coords)
    if (allCoords.length === 0) return
    const lats = allCoords.map(c => c[0])
    const lons = allCoords.map(c => c[1])
    map.fitBounds([
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)],
    ], { padding: [40, 40] })
    fitted.current = true
  }, [shapes, map])

  return null
}

export default function Map({ gtfsData, vehicles, visibleLines, apiKey }) {
  const shapes = useMemo(() => {
    if (!gtfsData) return []
    return deduplicateShapes(gtfsData.shapes)
  }, [gtfsData])

  const stops = gtfsData?.stops ?? []
  const lineIds = Object.keys(LINES)

  return (
    <MapContainer
      center={SEATTLE_CENTER}
      zoom={INITIAL_ZOOM}
      minZoom={MIN_ZOOM}
      maxBounds={MAX_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />

      {/* Route polylines — draw each line slightly offset if shared corridor */}
      {shapes.map((shape, idx) => {
        if (visibleLines[shape.routeId] === false) return null
        const color = getLineColor(shape.routeId)
        // Offset lines that share the 1-Line corridor
        const lineIdx = lineIds.indexOf(shape.routeId)
        const offsetCoords = shape.coords.map(([lat, lon]) => [
          lat + lineIdx * OFFSET_STEP * 0.5,
          lon + lineIdx * OFFSET_STEP,
        ])
        return (
          <Polyline
            key={shape.shapeId}
            positions={offsetCoords}
            pathOptions={{ color, weight: 6, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }}
          />
        )
      })}

      {/* Station markers */}
      {stops.map(stop => (
        <StationMarker key={stop.stopId} stop={stop} apiKey={apiKey} />
      ))}

      {/* Train markers */}
      {vehicles
        .filter(v => visibleLines[v.routeId] !== false)
        .map(v => (
          <TrainMarker key={v.vehicleId} vehicle={v} />
        ))}

      {shapes.length > 0 && <FitBounds shapes={shapes} />}
    </MapContainer>
  )
}
