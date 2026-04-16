import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { getLineConfig } from '../utils/lineConfig'

export default function TrainMarker({ vehicle }) {
  const map = useMap()
  const markerRef = useRef(null)

  const config = getLineConfig(vehicle.routeId)
  const color = config?.color ?? '#888'
  const label = config?.shortName ?? '?'

  useEffect(() => {
    if (!map) return

    const icon = L.divIcon({
      className: '',
      html: `<div class="train-icon" style="background:${color};transform:rotate(${vehicle.bearing}deg)">${label}</div>`,
      iconSize: [32, 18],
      iconAnchor: [16, 9],
      popupAnchor: [0, -10],
    })

    if (markerRef.current) {
      markerRef.current.setLatLng([vehicle.lat, vehicle.lon])
      markerRef.current.setIcon(icon)
    } else {
      const marker = L.marker([vehicle.lat, vehicle.lon], { icon, zIndexOffset: 500 })
      const adherence = vehicle.scheduleAdherence
      const adherenceStr = adherence == null
        ? 'Unknown'
        : adherence > 60
          ? `${Math.round(adherence / 60)}m late`
          : adherence < -60
            ? `${Math.round(-adherence / 60)}m early`
            : 'On time'

      marker.bindPopup(`
        <div>
          <div style="font-weight:700;color:${color};font-size:14px">${config?.name ?? 'Link'}</div>
          <div style="color:#555;margin-top:4px">Vehicle ${vehicle.vehicleId.replace('mock_', '')}</div>
          <div style="margin-top:6px">Schedule: <strong>${adherenceStr}</strong></div>
          ${vehicle.nextStop ? `<div>Next stop: <strong>${vehicle.nextStop}</strong></div>` : ''}
        </div>
      `)
      marker.addTo(map)
      markerRef.current = marker
    }
  }, [vehicle, map, color, label, config])

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
