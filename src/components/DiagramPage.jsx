const BG = '#0c0e17'

export default function DiagramPage() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 960, padding: '16px 12px 24px' }}>
        <img
          src="/st-current-service-map.png"
          alt="Sound Transit current service map"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
        />
        <p style={{ textAlign: 'center', fontSize: 10, color: '#444', fontFamily: 'system-ui, sans-serif', marginTop: 10 }}>
          Sound Transit current service map — soundtransit.org
        </p>
      </div>
    </div>
  )
}
