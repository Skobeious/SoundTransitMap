import { LINES } from '../utils/lineConfig'

const LINE_COLORS = Object.values(LINES).map(l => l.color)

export default function LoadingOverlay({ visible }) {
  if (!visible) return null

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#0f111a',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Animated line dots */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {LINE_COLORS.map((color, i) => (
          <div key={i} style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: color,
            animation: `bounce 1.1s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <div style={{ color: '#666', fontSize: '13px', letterSpacing: '0.5px' }}>
        Loading route data…
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
