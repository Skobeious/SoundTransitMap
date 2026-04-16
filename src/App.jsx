import { useState } from 'react'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import LoadingOverlay from './components/LoadingOverlay'
import { useGtfsStatic } from './hooks/useGtfsStatic'
import { useVehiclePositions } from './hooks/useVehiclePositions'
import { LINES } from './utils/lineConfig'

// In production the Express server injects the OBA key server-side.
// In dev, set VITE_OBA_API_KEY in .env.local to use live data, or leave unset for mock.
const IS_DEV = import.meta.env.DEV
const OBA_KEY = IS_DEV ? (import.meta.env.VITE_OBA_API_KEY ?? '') : 'server'

export default function App() {
  const { data: gtfsData, loading: gtfsLoading, error: gtfsError } = useGtfsStatic()
  const { vehicles, lastUpdated, usingMock } = useVehiclePositions(OBA_KEY, gtfsData?.trips)

  const [visibleLines, setVisibleLines] = useState(
    Object.fromEntries(Object.keys(LINES).map(id => [id, true]))
  )

  function toggleLine(routeId) {
    setVisibleLines(prev => ({ ...prev, [routeId]: !prev[routeId] }))
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Map
        gtfsData={gtfsData}
        vehicles={vehicles}
        visibleLines={visibleLines}
        apiKey={OBA_KEY}
      />
      <Sidebar
        vehicles={vehicles}
        visibleLines={visibleLines}
        onToggleLine={toggleLine}
        lastUpdated={lastUpdated}
        usingMock={usingMock}
        gtfsLoading={gtfsLoading}
        gtfsError={gtfsError}
      />
      <LoadingOverlay visible={gtfsLoading} />
    </div>
  )
}
