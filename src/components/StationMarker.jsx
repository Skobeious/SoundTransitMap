import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function StationMarker({ stop, apiKey }) {
  const map = useMap()
  const markerRef = useRef(null)

  useEffect(() => {
    if (!map) return
    if (markerRef.current) return

    const marker = L.circleMarker([stop.lat, stop.lon], {
      radius: 5,
      color: '#fff',
      fillColor: '#1a1a2e',
      fillOpacity: 1,
      weight: 2,
      zIndexOffset: 200,
    })

    marker.bindTooltip(stop.name, {
      permanent: true,
      direction: 'right',
      offset: [8, 0],
      className: 'station-label',
    })

    marker.bindPopup(`
      <div style="font-family:system-ui,sans-serif">
        <div style="font-weight:700;font-size:14px;color:#111">${stop.name}</div>
        <div style="color:#999;font-size:11px;margin-top:3px">Stop ${stop.stopId}</div>
        ${!apiKey ? '<div style="color:#bbb;font-size:11px;margin-top:8px;padding-top:8px;border-top:1px solid #eee">Add OBA key for live arrivals</div>' : ''}
      </div>
    `)

    marker.addTo(map)
    markerRef.current = marker
  }, [map, stop, apiKey])

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
