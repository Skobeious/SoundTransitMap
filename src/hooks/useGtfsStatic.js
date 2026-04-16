import { useState, useEffect } from 'react'
import { fetchAndParseGtfs } from '../utils/gtfsParser'

// Sound Transit GTFS static feed (agency 40 = Link light rail + ST Express)
// Served from /public/40_gtfs.zip — re-download periodically from:
// https://www.soundtransit.org/GTFS-rail/40_gtfs.zip
const GTFS_URL = '/40_gtfs.zip'

export function useGtfsStatic() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchAndParseGtfs(GTFS_URL)
        if (!cancelled) setData(result)
      } catch (err) {
        console.error('GTFS load error:', err)
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
