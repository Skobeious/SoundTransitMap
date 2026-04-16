import { useState } from 'react'
import { LINES } from '../utils/lineConfig'

const TYPE_ICON = {
  'light-rail': '🚇',
  'streetcar': '🚋',
  'commuter-rail': '🚆',
}

export default function Sidebar({ vehicles, visibleLines, onToggleLine, lastUpdated, usingMock, gtfsLoading, gtfsError }) {
  const [collapsed, setCollapsed] = useState(false)

  const countByLine = {}
  for (const v of vehicles) {
    countByLine[v.routeId] = (countByLine[v.routeId] ?? 0) + 1
  }

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  const totalTrains = vehicles.length

  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      right: '12px',
      zIndex: 1000,
      width: collapsed ? 'auto' : '220px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'rgba(12, 14, 22, 0.93)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#e0e0e0',
        overflow: 'hidden',
      }}>

        {/* Header — always visible, acts as toggle on mobile */}
        <div
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', letterSpacing: '-0.2px' }}>
              Sound Transit
            </div>
            {!collapsed && (
              <div style={{ fontSize: '11px', color: '#555', marginTop: '1px' }}>
                {usingMock ? 'Demo' : 'Live'} · {totalTrains} train{totalTrains !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div style={{ color: '#444', fontSize: '12px', marginLeft: '8px' }}>
            {collapsed ? '▼' : '▲'}
          </div>
        </div>

        {!collapsed && (
          <div style={{ padding: '0 10px 12px' }}>
            {/* GTFS loading */}
            {gtfsLoading && (
              <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px', paddingLeft: '4px' }}>
                Loading routes…
              </div>
            )}
            {gtfsError && (
              <div style={{ fontSize: '11px', color: '#e05252', marginBottom: '8px', paddingLeft: '4px' }}>
                ⚠ Route load failed
              </div>
            )}

            {/* Line toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
              {Object.entries(LINES).map(([routeId, line]) => {
                const active = visibleLines[routeId] !== false
                const count = countByLine[routeId] ?? 0
                const icon = TYPE_ICON[line.type] ?? '🚉'
                const noService = line.peakOnly && count === 0

                return (
                  <button
                    key={routeId}
                    onClick={() => onToggleLine(routeId)}
                    title={line.description}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: `1px solid ${active ? line.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      background: active
                        ? `linear-gradient(135deg, ${line.color}20, ${line.color}0a)`
                        : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: active ? line.color : 'rgba(255,255,255,0.07)',
                      border: `2px solid ${active ? line.color : 'rgba(255,255,255,0.12)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '12px',
                      color: '#fff',
                      flexShrink: 0,
                      opacity: active ? 1 : 0.3,
                      transition: 'all 0.15s',
                    }}>
                      {line.shortName}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: active ? '#ddd' : '#444', transition: 'color 0.15s' }}>
                        {line.name}
                      </div>
                      <div style={{ fontSize: '10px', marginTop: '1px', color: noService ? '#555' : active ? line.color : '#333', transition: 'color 0.15s' }}>
                        {noService ? 'Weekdays peak only' : count > 0 ? `${count} active` : 'No service'}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', opacity: active ? 0.6 : 0.15 }}>{icon}</div>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              {usingMock && (
                <div style={{
                  fontSize: '10px',
                  color: '#c8852a',
                  background: 'rgba(230,126,34,0.08)',
                  border: '1px solid rgba(230,126,34,0.2)',
                  borderRadius: '5px',
                  padding: '5px 7px',
                  marginBottom: '7px',
                  lineHeight: 1.4,
                }}>
                  Demo · set <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: '3px', fontSize: '10px' }}>OBA_API_KEY</code> in Railway for live data
                </div>
              )}
              <div style={{ fontSize: '10px', color: '#3a3a3a', display: 'flex', justifyContent: 'space-between' }}>
                <span>Updated {timeStr}</span>
                <span>15s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
