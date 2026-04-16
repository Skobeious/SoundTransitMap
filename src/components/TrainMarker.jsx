import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { getLineConfig } from '../utils/lineConfig'

export default function TrainMarker({ vehicle, onSelect }) {
  const map = useMap()
  const markerRef = useRef(null)

  const config = getLineConfig(vehicle.routeId)
  const color = config?.color ?? '#888'
  const label = config?.shortName ?? '?'

  useEffect(() => {
    if (!map) return

    const icon = L.divIcon({
      className: '',
      html: `<div class="train-icon" style="background:${color}">${label}</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })

    if (markerRef.current) {
      markerRef.current.setLatLng([vehicle.lat, vehicle.lon])
      markerRef.current.setIcon(icon)
    } else {
      const marker = L.marker([vehicle.lat, vehicle.lon], { icon, zIndexOffset: 500 })
      marker.on('click', () => onSelect?.(vehicle))
      marker.addTo(map)
      markerRef.current = marker
    }
  }, [vehicle, map, color, label, onSelect])

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [])

  return null
}
