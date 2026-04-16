import { useState, useEffect } from 'react'

const OBA_BASE = '/api/oba'

export function useArrivals(stopId, apiKey) {
  const [arrivals, setArrivals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!stopId || !apiKey) return
    let cancelled = false

    async function fetch_() {
      setLoading(true)
      setError(null)
      try {
        // OBA stop IDs for Sound Transit (agency 40) are '40_STOPID'
        const obaStopId = stopId.includes('_') ? stopId : `40_${stopId}`
        const url = `${OBA_BASE}/api/where/arrivals-and-departures-for-stop/${obaStopId}.json?key=${apiKey}&minutesBefore=0&minutesAfter=60`
        const resp = await globalThis.fetch(url)
        if (!resp.ok) throw new Error(`OBA ${resp.status}`)
        const json = await resp.json()
        const list = json.data?.entry?.arrivalsAndDepartures ?? []
        if (!cancelled) setArrivals(list.slice(0, 3))
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch_()
    return () => { cancelled = true }
  }, [stopId, apiKey])

  return { arrivals, loading, error }
}
