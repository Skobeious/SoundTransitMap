import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getLineColor, LINES } from '../utils/lineConfig'
import { deduplicateShapes } from '../utils/gtfsParser'
import { splitByTunnel } from '../utils/tunnelZones'
import TrainMarker from './TrainMarker'
import StationMarker from './StationMarker'

// Centered on Seattle CBD — shows 1 Line, 2 Line, and top of S Line clearly.
// Users can scroll north to Everett or south to Tacoma.
const SEATTLE_CENTER = [47.62, -122.38]
const INITIAL_ZOOM = 11
const MIN_ZOOM = 9
const MAX_BOUNDS = [
  [46.95, -122.6],
  [48.10, -121.8],
]
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

export default function Map({ gtfsData, vehicles, visibleLines, apiKey, onSelectVehicle }) {
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
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />

      {shapes.map((shape) => {
        if (visibleLines[shape.routeId] === false) return null
        const color = getLineColor(shape.routeId)
        const lineIdx = lineIds.indexOf(shape.routeId)
        const offsetCoords = shape.coords.map(([lat, lon]) => [
          lat + lineIdx * OFFSET_STEP * 0.5,
          lon + lineIdx * OFFSET_STEP,
        ])
        const segments = splitByTunnel(offsetCoords, shape.routeId)

        return segments.map((seg, i) => {
          if (seg.tunnel) {
            return [
              // Glow under tunnel
              <Polyline
                key={`${shape.shapeId}-tglow-${i}`}
                positions={seg.coords}
                pathOptions={{ color, weight: 10, opacity: 0.08, lineJoin: 'round', lineCap: 'round' }}
              />,
              // Solid tunnel base (dimmed)
              <Polyline
                key={`${shape.shapeId}-tbase-${i}`}
                positions={seg.coords}
                pathOptions={{ color, weight: 4, opacity: 0.35, lineJoin: 'round', lineCap: 'round' }}
              />,
              // White dash overlay
              <Polyline
                key={`${shape.shapeId}-tdash-${i}`}
                positions={seg.coords}
                pathOptions={{ color: '#fff', weight: 2, opacity: 0.4, dashArray: '6 7', lineJoin: 'round', lineCap: 'butt' }}
              />,
            ]
          }
          return [
            // Glow layer
            <Polyline
              key={`${shape.shapeId}-glow-${i}`}
              positions={seg.coords}
              pathOptions={{ color, weight: 14, opacity: 0.12, lineJoin: 'round', lineCap: 'round' }}
            />,
            // Solid line
            <Polyline
              key={`${shape.shapeId}-line-${i}`}
              positions={seg.coords}
              pathOptions={{ color, weight: 5, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }}
            />,
          ]
        })
      })}

      {stops.map(stop => (
        <StationMarker key={stop.stopId} stop={stop} apiKey={apiKey} />
      ))}

      {vehicles
        .filter(v => visibleLines[v.routeId] !== false)
        .map(v => (
          <TrainMarker key={v.vehicleId} vehicle={v} onSelect={onSelectVehicle} />
        ))}

    </MapContainer>
  )
}
