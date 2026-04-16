const BG = '#0c0e17'

// Calibration: derived from pixel-scanning the official Sound Transit map PNG (1200×1800).
// Anchor: Lynnwood City Center (1 Line green centroid near top of route).
// Cross-checked against Downtown Redmond (2 Line easternmost pixel cluster).
const IMG_W = 1200
const IMG_H = 1800
const ANCHOR_LAT = 47.826   // Lynnwood City Center
const ANCHOR_LON = -122.291
const ANCHOR_PX_X = 744
const ANCHOR_PX_Y = 498
const LAT_SCALE = 1503       // px per degree latitude (southward = +y)
const LON_SCALE = 1443       // px per degree longitude (eastward = +x)

function latLonToPx(lat, lon) {
  const x = ANCHOR_PX_X + (lon - ANCHOR_LON) * LON_SCALE
  const y = ANCHOR_PX_Y + (ANCHOR_LAT - lat) * LAT_SCALE
  return [x, y]
}

export default function DiagramPage({ vehicles = [] }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 960, padding: '16px 12px 24px' }}>

        {/* Official Sound Transit service map */}
        <img
          src="/st-current-service-map.png"
          alt="Sound Transit current service map"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
        />

        {/* Train overlay — SVG sized to match image, uses same viewBox as PNG pixel space */}
        <svg
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          style={{
            position: 'absolute',
            top: 16,
            left: 12,
            right: 12,
            width: 'calc(100% - 24px)',
            height: 'auto',
            pointerEvents: 'none',
          }}
        >
          {vehicles.map(v => {
            const [px, py] = latLonToPx(v.lat, v.lon)
            // Skip anything that projects outside the image bounds
            if (px < 0 || px > IMG_W || py < 0 || py > IMG_H) return null
            return (
              <g key={v.vehicleId}>
                {/* Glow ring */}
                <circle cx={px} cy={py} r={18} fill={v.color} opacity={0.18} />
                {/* Body */}
                <circle cx={px} cy={py} r={11} fill={v.color} stroke="#fff" strokeWidth={1.5} />
                {/* Label */}
                <text
                  x={px} y={py + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fontFamily="system-ui, sans-serif"
                  fill="#fff"
                >
                  {v.label}
                </text>
              </g>
            )
          })}
        </svg>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#444', fontFamily: 'system-ui, sans-serif', marginTop: 10 }}>
          Sound Transit current service map — soundtransit.org
          {vehicles.length > 0 && ` · ${vehicles.length} trains shown`}
        </p>
      </div>
    </div>
  )
}
