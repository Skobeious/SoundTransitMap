import { useState } from 'react'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import LoadingOverlay from './components/LoadingOverlay'
import Header from './components/Header'
import { useGtfsStatic } from './hooks/useGtfsStatic'
import { useVehiclePositions } from './hooks/useVehiclePositions'
import { LINES } from './utils/lineConfig'

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
    <div className="app-wrapper">
      <Header vehicles={vehicles} usingMock={usingMock} />
      <div className="map-area">
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
    </div>
  )
}
