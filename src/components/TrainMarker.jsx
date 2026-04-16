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
      html: `<div class="train-icon" style="background:${color};color:${color}"><span class="train-pulse"></span>${label}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14],
    })

    if (markerRef.current) {
      markerRef.current.setLatLng([vehicle.lat, vehicle.lon])
      markerRef.current.setIcon(icon)
    } else {
      const marker = L.marker([vehicle.lat, vehicle.lon], { icon, zIndexOffset: 500 })

      const adherence = vehicle.scheduleAdherence
      const adherenceStr = adherence == null
        ? ''
        : adherence > 60
          ? `🔴 ${Math.round(adherence / 60)}m late`
          : adherence < -60
            ? `🟡 ${Math.round(-adherence / 60)}m early`
            : '🟢 On time'

      const headsignRow = vehicle.headsign
        ? `<div style="color:#333;margin-top:4px">To <strong>${vehicle.headsign}</strong></div>`
        : ''
      const nextStopRow = vehicle.nextStop
        ? `<div style="color:#555;font-size:12px;margin-top:2px">Next: ${vehicle.nextStop}</div>`
        : ''
      const scheduleRow = adherenceStr
        ? `<div style="font-size:12px;margin-top:6px">${adherenceStr}</div>`
        : ''

      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:140px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:22px;height:22px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff">${label}</div>
            <div style="font-weight:700;font-size:14px;color:#111">${config?.name ?? 'Train'}</div>
          </div>
          ${headsignRow}
          ${nextStopRow}
          ${scheduleRow}
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
