import { LINES } from '../utils/lineConfig'

const TYPE_ICON = {
  'light-rail': '🚇',
  'streetcar': '🚋',
  'commuter-rail': '🚆',
}

export default function Sidebar({ vehicles, visibleLines, onToggleLine, lastUpdated, usingMock, gtfsLoading, gtfsError }) {
  const countByLine = {}
  for (const v of vehicles) {
    countByLine[v.routeId] = (countByLine[v.routeId] ?? 0) + 1
  }

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  const totalTrains = vehicles.length

  return (
    <div className="sidebar">
      <div style={{
        background: 'rgba(15, 17, 26, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        padding: '16px',
        fontFamily: 'system-ui, sans-serif',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#e0e0e0',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff', letterSpacing: '-0.2px' }}>
            Sound Transit
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '1px' }}>
            {usingMock ? 'Demo mode' : 'Live'} · {totalTrains} train{totalTrains !== 1 ? 's' : ''} tracked
          </div>
        </div>

        {/* GTFS loading */}
        {gtfsLoading && (
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#555', animation: 'pulse 1.2s infinite' }} />
            Loading routes…
          </div>
        )}
        {gtfsError && (
          <div style={{ fontSize: '11px', color: '#e05252', marginBottom: '10px' }}>
            ⚠ Route load failed
          </div>
        )}

        {/* Line toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
          {Object.entries(LINES).map(([routeId, line]) => {
            const active = visibleLines[routeId] !== false
            const count = countByLine[routeId] ?? 0
            const icon = TYPE_ICON[line.type] ?? '🚉'
            return (
              <button
                key={routeId}
                onClick={() => onToggleLine(routeId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '9px',
                  border: `1px solid ${active ? line.color + '60' : 'rgba(255,255,255,0.07)'}`,
                  background: active
                    ? `linear-gradient(135deg, ${line.color}22, ${line.color}10)`
                    : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {/* Line badge — circular like official Sound Transit branding */}
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: active ? line.color : 'rgba(255,255,255,0.08)',
                  border: `2px solid ${active ? line.color : 'rgba(255,255,255,0.15)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '13px',
                  color: '#fff',
                  flexShrink: 0,
                  opacity: active ? 1 : 0.35,
                  transition: 'all 0.15s',
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  {line.shortName}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: active ? '#fff' : '#555', transition: 'color 0.15s' }}>
                    {line.name}
                  </div>
                  <div style={{ fontSize: '10px', color: active ? line.color : '#444', marginTop: '1px', transition: 'color 0.15s' }}>
                    {count > 0 ? `${count} active` : 'No service'}
                  </div>
                </div>
                <div style={{ fontSize: '14px', opacity: active ? 0.7 : 0.2 }}>
                  {icon}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '10px' }}>
          {usingMock && (
            <div style={{
              fontSize: '10px',
              color: '#e67e22',
              background: 'rgba(230,126,34,0.1)',
              border: '1px solid rgba(230,126,34,0.25)',
              borderRadius: '5px',
              padding: '5px 7px',
              marginBottom: '8px',
              lineHeight: 1.4,
            }}>
              Demo · set <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px', fontSize: '10px' }}>VITE_OBA_API_KEY</code> for live data
            </div>
          )}
          <div style={{ fontSize: '10px', color: '#444', display: 'flex', justifyContent: 'space-between' }}>
            <span>Updated {timeStr}</span>
            <span>15s refresh</span>
          </div>
        </div>
      </div>
    </div>
  )
}
