import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

const LABEL_ZOOM = 11   // proper stations show name at this zoom
const STREET_ZOOM = 14  // street-level stops only appear at high zoom

export default function StationMarker({ stop, apiKey }) {
  const map = useMap()
  const markerRef = useRef(null)

  useEffect(() => {
    if (!map) return
    if (markerRef.current) return

    // Street-level stops (T Line streetcar etc.) hidden until zoomed right in
    const dotZoom = stop.isStation ? LABEL_ZOOM : STREET_ZOOM

    const marker = L.circleMarker([stop.lat, stop.lon], {
      radius: stop.isStation ? 6 : 4,
      color: '#fff',
      fillColor: '#0d1020',
      fillOpacity: 1,
      weight: 2.5,
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

    // Show/hide marker + label based on zoom
    function updateLabel() {
      const zoom = map.getZoom()
      const tooltip = marker.getTooltip()
      if (zoom >= dotZoom) {
        marker.setStyle({ opacity: 1, fillOpacity: 1 })
        if (tooltip) marker.openTooltip()
      } else {
        marker.setStyle({ opacity: 0, fillOpacity: 0 })
        if (tooltip) marker.closeTooltip()
      }
    }

    updateLabel()
    map.on('zoomend', updateLabel)

    return () => { map.off('zoomend', updateLabel) }
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
