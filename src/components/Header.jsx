import { LINES } from '../utils/lineConfig'

export default function Header({ vehicles, usingMock, view, onViewChange }) {
  const countByLine = {}
  for (const v of vehicles) {
    countByLine[v.routeId] = (countByLine[v.routeId] ?? 0) + 1
  }
  const total = vehicles.length

  return (
    <div className="header-bar">
      {/* ST logo mark */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#005695"/>
        <text x="12" y="17" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="system-ui">ST</text>
      </svg>

      <div className="header-title">Sound Transit Live</div>

      {/* Line dots */}
      <div className="header-line-dots">
        {Object.entries(LINES).map(([routeId, line]) => (
          <div
            key={routeId}
            className="header-dot"
            title={`${line.name} — ${countByLine[routeId] ?? 0} trains`}
            style={{ background: line.color, opacity: countByLine[routeId] ? 1 : 0.25 }}
          />
        ))}
      </div>

      <div className="header-subtitle">
        {total} train{total !== 1 ? 's' : ''} tracked
      </div>

      <button
        onClick={() => onViewChange(view === 'map' ? 'diagram' : 'map')}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          padding: '4px 12px',
          color: '#ccc',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.2px',
        }}
      >
        {view === 'map' ? 'Route Map' : '← Live Map'}
      </button>

      {usingMock && (
        <div style={{
          marginLeft: 'auto',
          background: 'rgba(200,133,42,0.15)',
          border: '1px solid rgba(200,133,42,0.4)',
          borderRadius: '5px',
          padding: '3px 9px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#c8852a',
          letterSpacing: '0.3px',
        }}>
          DEMO — positions simulated
        </div>
      )}
    </div>
  )
}
