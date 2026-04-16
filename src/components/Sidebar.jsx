import { useState } from 'react'
import { LINES } from '../utils/lineConfig'
import { SERVICE_FACTS } from '../utils/serviceFacts'

function FactsPanel() {
  const [open, setOpen] = useState(null)
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '2px' }}>
        About the services
      </div>
      {Object.entries(SERVICE_FACTS).map(([key, svc]) => (
        <div key={key} style={{ marginBottom: '4px' }}>
          <button
            onClick={() => setOpen(open === key ? null : key)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '7px',
              padding: '6px 9px',
              cursor: 'pointer',
              color: '#aaa',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <span>{svc.label}</span>
            <span style={{ opacity: 0.4, fontSize: '10px' }}>{open === key ? '▲' : '▼'}</span>
          </button>
          {open === key && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderTop: 'none',
              borderRadius: '0 0 7px 7px',
              padding: '8px 9px',
            }}>
              <div style={{ fontSize: '10px', color: '#555', marginBottom: '5px' }}>
                {svc.lines.join(' · ')}
              </div>
              {svc.facts.map((fact, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#666', lineHeight: 1.5, display: 'flex', gap: '5px' }}>
                  <span style={{ color: '#333', flexShrink: 0 }}>·</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

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
      left: '12px',
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
                      <div style={{ fontWeight: 600, fontSize: '12px', color: active ? '#fff' : '#444', transition: 'color 0.15s' }}>
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

            {/* Facts */}
            <FactsPanel />

            {/* Footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              <div style={{ fontSize: '10px', color: '#3a3a3a', display: 'flex', justifyContent: 'space-between' }}>
                <span>Updated {timeStr}</span>
                <span>Refreshes every 15s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
