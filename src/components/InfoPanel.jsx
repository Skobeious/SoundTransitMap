import { getLineConfig } from '../utils/lineConfig'

export default function InfoPanel({ vehicle, onClose }) {
  const open = !!vehicle
  const config = vehicle ? getLineConfig(vehicle.routeId) : null
  const color = config?.color ?? '#888'

  const adherence = vehicle?.scheduleAdherence
  const adherenceStr = !adherence
    ? null
    : adherence > 60
      ? `${Math.round(adherence / 60)}m late`
      : adherence < -60
        ? `${Math.round(-adherence / 60)}m early`
        : 'On time'

  const adherenceColor = !adherence ? '#888'
    : adherence > 60 ? '#e05252'
    : adherence < -60 ? '#e0a020'
    : '#4caf70'

  return (
    <div className={`info-panel ${open ? 'open' : ''}`}>
      <div className="info-panel-inner">
        {vehicle && (
          <>
            {/* Line badge */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '22px',
              color: '#fff',
              flexShrink: 0,
              boxShadow: `0 0 20px ${color}60`,
            }}>
              {config?.shortName ?? '?'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>
                {config?.name ?? 'Train'}
              </div>
              {vehicle.headsign && (
                <div style={{ fontSize: '13px', color: '#aaa', marginTop: '2px' }}>
                  To <strong style={{ color: '#ddd' }}>{vehicle.headsign}</strong>
                </div>
              )}
              {vehicle.nextStop && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                  Next stop: {vehicle.nextStop}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {adherenceStr ? (
                <>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: adherenceColor }}>{adherenceStr}</div>
                  <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>schedule</div>
                </>
              ) : (
                <div style={{ fontSize: '10px', color: '#444', lineHeight: 1.5, textAlign: 'right' }}>
                  Live delays available<br/>with OBA API key
                </div>
              )}
            </div>
          </>
        )}
        <button className="info-panel-close" onClick={onClose}>✕</button>
      </div>
    </div>
  )
}
