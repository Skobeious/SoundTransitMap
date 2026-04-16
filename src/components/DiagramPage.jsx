import { DIAGRAM_LINES, DIAGRAM_PATHS, DIAGRAM_STATIONS } from '../utils/diagramData'

const W = 1000
const H = 1580
const LBL_OFF = 14
const LBL_SIZE = 11.5
const BG = '#0c0e17'

function labelProps(s) {
  switch (s.lbl) {
    case 'right': return { x: s.x + LBL_OFF, y: s.y,            anchor: 'start',  base: 'middle' }
    case 'left':  return { x: s.x - LBL_OFF, y: s.y,            anchor: 'end',    base: 'middle' }
    case 'above': return { x: s.x,            y: s.y - LBL_OFF,  anchor: 'middle', base: 'auto' }
    case 'below': return { x: s.x,            y: s.y + LBL_OFF,  anchor: 'middle', base: 'hanging' }
    default:      return { x: s.x + LBL_OFF, y: s.y,            anchor: 'start',  base: 'middle' }
  }
}

function primaryColor(s) {
  return DIAGRAM_LINES[s.lines[0]]?.color ?? '#fff'
}

export default function DiagramPage() {
  return (
    <div style={{ flex: 1, background: BG, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'center', padding: '20px 20px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', width: '100%', maxWidth: 900 }}>
        {Object.entries(DIAGRAM_LINES).map(([id, line]) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: 26, height: 5, background: line.color, borderRadius: 3 }} />
            <span style={{ color: '#888', fontSize: 11, fontFamily: 'system-ui, sans-serif' }}>{line.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <svg width="16" height="16"><circle cx="8" cy="8" r="6" fill="transparent" stroke="#fff" strokeWidth="2" /></svg>
          <span style={{ color: '#888', fontSize: 11, fontFamily: 'system-ui, sans-serif' }}>Interchange</span>
        </div>
      </div>

      {/* Diagram */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 900, height: 'auto', display: 'block', padding: '0 8px' }}>
        <rect width={W} height={H} fill={BG} />

        {/* Paths */}
        {DIAGRAM_PATHS.map((path, i) => {
          const line = DIAGRAM_LINES[path.line]
          return (
            <polyline
              key={i}
              points={path.pts.map(([x,y]) => `${x},${y}`).join(' ')}
              stroke={line?.color ?? '#555'}
              strokeWidth={line ? 5 : 1.5}
              strokeDasharray={path.dashed ? '5 4' : undefined}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={path.dashed ? 0.35 : 1}
            />
          )
        })}

        {/* Stations */}
        {DIAGRAM_STATIONS.map(s => {
          const lp = labelProps(s)
          return (
            <g key={s.id}>
              {s.xchg ? (
                <>
                  <circle cx={s.x} cy={s.y} r={10} fill={BG} stroke="#fff" strokeWidth={3} />
                  <circle cx={s.x} cy={s.y} r={4}  fill="#fff" />
                </>
              ) : (
                <circle cx={s.x} cy={s.y} r={6} fill={BG} stroke={primaryColor(s)} strokeWidth={2.5} />
              )}
              <text
                x={lp.x} y={lp.y}
                textAnchor={lp.anchor}
                dominantBaseline={lp.base}
                fontSize={LBL_SIZE}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight={s.xchg ? 700 : 400}
                fill={s.xchg ? '#fff' : '#bbb'}
              >
                {s.name}
              </text>
            </g>
          )
        })}

        {/* Terminus labels */}
        {[
          { x:420, y:34,   text:'LYNNWOOD · 1 & 2 LINE NORTH TERMINUS' },
          { x:100, y:34,   text:'N LINE NORTH TERMINUS' },
          { x:830, y:262,  text:'2 LINE EAST TERMINUS' },
          { x:420, y:1424, text:'1 LINE SOUTH TERMINUS' },
          { x:280, y:1554, text:'S LINE SOUTH TERMINUS' },
          { x:790, y:1454, text:'T LINE EAST TERMINUS' },
        ].map((t, i) => (
          <text key={i} x={t.x} y={t.y} textAnchor="middle" fontSize={8} fill="#444" fontFamily="system-ui" letterSpacing="0.5">
            {t.text}
          </text>
        ))}

        {/* Footer note */}
        <text x={W/2} y={H - 14} textAnchor="middle" fontSize={9} fill="#333" fontFamily="system-ui">
          Sound Transit network diagram — schematic only, not to geographic scale
        </text>
      </svg>
    </div>
  )
}
