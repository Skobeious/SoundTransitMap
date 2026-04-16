import { useState, useEffect, useRef, useCallback } from 'react'
import { LINES } from '../utils/lineConfig'

const OBA_BASE = '/api/oba'
const POLL_INTERVAL = 15000 // 15 seconds

/**
 * Returns interpolated vehicle positions, polling the OBA API every 15s.
 * Falls back to mock data if no API key is set or request fails.
 *
 * Each vehicle: { vehicleId, routeId, lat, lon, bearing, tripId, status, nextStop }
 */
export function useVehiclePositions(apiKey, trips) {
  const [vehicles, setVehicles] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [usingMock, setUsingMock] = useState(false)
  const interpolatedRef = useRef([]) // current interpolated positions
  const targetRef = useRef([])       // latest polled positions
  const prevRef = useRef([])         // positions before last poll
  const frameRef = useRef(null)
  const lastPollTimeRef = useRef(null)

  // Interpolation loop: smoothly move markers between poll cycles
  useEffect(() => {
    let running = true
    function animate() {
      if (!running) return
      const now = Date.now()
      const lastPoll = lastPollTimeRef.current
      if (lastPoll && targetRef.current.length > 0) {
        const elapsed = now - lastPoll
        const t = Math.min(elapsed / POLL_INTERVAL, 1)
        const interpolated = targetRef.current.map((target) => {
          const prev = prevRef.current.find(v => v.vehicleId === target.vehicleId)
          if (!prev) return target
          return {
            ...target,
            lat: lerp(prev.lat, target.lat, t),
            lon: lerp(prev.lon, target.lon, t),
          }
        })
        setVehicles(interpolated)
      }
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => {
      running = false
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const fetchVehicles = useCallback(async () => {
    // 'server' = production mode, key is injected server-side by Express proxy
    // empty string = dev with no key → use mock
    if (!apiKey) {
      const mock = generateMockVehicles()
      prevRef.current = targetRef.current.length ? targetRef.current : mock
      targetRef.current = mock
      lastPollTimeRef.current = Date.now()
      setLastUpdated(new Date())
      setUsingMock(true)
      return
    }

    try {
      // In production (apiKey='server') the Express proxy injects the real key.
      // In dev with a real key, send it directly.
      const keyParam = apiKey === 'server' ? '' : `&key=${apiKey}`
      const url = `${OBA_BASE}/api/where/vehicles-for-agency/40.json?placeholder=1${keyParam}`
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`OBA ${resp.status}`)
      const json = await resp.json()

      const parsed = (json.data?.list ?? [])
        .filter(v => v.tripStatus?.predicted)
        .map(v => ({
          vehicleId: v.vehicleId,
          routeId: v.tripStatus?.activeTrip?.routeId ?? v.tripId,
          tripId: v.tripStatus?.activeTrip?.id ?? v.tripId,
          lat: v.location?.lat ?? 0,
          lon: v.location?.lon ?? 0,
          bearing: v.location?.heading ?? 0,
          status: v.tripStatus?.phase ?? 'IN_PROGRESS',
          nextStop: v.tripStatus?.nextStop ?? null,
          scheduleAdherence: v.tripStatus?.scheduleDeviation ?? 0,
        }))

      prevRef.current = targetRef.current.length ? targetRef.current : parsed
      targetRef.current = parsed
      lastPollTimeRef.current = Date.now()
      setLastUpdated(new Date())
      setUsingMock(false)
    } catch (err) {
      console.warn('OBA fetch failed, using mock:', err.message)
      const mock = generateMockVehicles()
      prevRef.current = targetRef.current.length ? targetRef.current : mock
      targetRef.current = mock
      lastPollTimeRef.current = Date.now()
      setLastUpdated(new Date())
      setUsingMock(true)
    }
  }, [apiKey])

  useEffect(() => {
    fetchVehicles()
    const timer = setInterval(fetchVehicles, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchVehicles])

  return { vehicles, lastUpdated, usingMock }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// ── Mock vehicle generator ──────────────────────────────────────────────
// Positions mock trains along approximate route coordinates for each line

const MOCK_ROUTES = {
  '100479': {
    // 1 Line: Lynnwood → Federal Way (N to S, simplified waypoints)
    waypoints: [
      [47.8215, -122.2835], // Lynnwood City Center
      [47.7769, -122.2895], // Mountlake Terrace
      [47.7562, -122.3052], // Shoreline North
      [47.7327, -122.3219], // Northgate
      [47.7076, -122.3290], // Roosevelt
      [47.6817, -122.3136], // U District
      [47.6585, -122.3133], // Capitol Hill
      [47.6097, -122.3321], // Westlake
      [47.5991, -122.3316], // University St
      [47.5934, -122.3272], // Pioneer Sq
      [47.5782, -122.3268], // SODO
      [47.5601, -122.3330], // Beacon Hill
      [47.5321, -122.2925], // Rainier Beach
      [47.4961, -122.2882], // Tukwila Int'l Blvd
      [47.4463, -122.2974], // SeaTac/Airport
      [47.4234, -122.3100], // Angle Lake
      [47.3576, -122.3011], // Star Lake
      [47.3223, -122.3133], // Federal Way Downtown
    ],
    trainCount: 7,
  },
  '2LINE': {
    // 2 Line: Lynnwood → Downtown Redmond (via Bellevue + Eastside)
    waypoints: [
      [47.8215, -122.2835], // Lynnwood City Center (shared corridor to Int'l District)
      [47.7327, -122.3219], // Northgate
      [47.6097, -122.3321], // Westlake
      [47.5991, -122.3316], // Int'l District — then branches east
      [47.5929, -122.2050], // Bellevue Downtown
      [47.6100, -122.2002], // Spring District
      [47.6170, -122.1889], // Bel-Red/130th
      [47.6236, -122.1485], // Overlake Village
      [47.6418, -122.1297], // Downtown Redmond
    ],
    trainCount: 4,
  },
  'TLINE': {
    // T Line: Tacoma Dome ↔ St Joseph (Tacoma streetcar)
    waypoints: [
      [47.2416, -122.4266], // Tacoma Dome
      [47.2467, -122.4360], // Theater District
      [47.2487, -122.4402], // Convention Center
      [47.2519, -122.4436], // Stadium
      [47.2561, -122.4470], // St Joseph
    ],
    trainCount: 2,
  },
  'SNDR_EV': {
    // Sounder North (N Line): Everett → Seattle King Street
    waypoints: [
      [47.9762, -122.2020], // Everett Station
      [47.8760, -122.2630], // Mukilteo Station
      [47.8494, -122.3396], // Edmonds Station
      [47.7338, -122.3430], // Shoreline/145th (future)
      [47.6097, -122.3302], // King Street Station (Seattle)
    ],
    trainCount: 2,
  },
  'SNDR_TL': {
    // Sounder South (S Line): Seattle → Tacoma Dome / Lakewood
    waypoints: [
      [47.6097, -122.3302], // King Street Station (Seattle)
      [47.5149, -122.2876], // Tukwila Station
      [47.4728, -122.2456], // Kent Station
      [47.3762, -122.2338], // Auburn Station
      [47.3210, -122.2323], // Sumner Station
      [47.2607, -122.2956], // Puyallup Station
      [47.2411, -122.4180], // Tacoma Dome Station
      [47.1586, -122.4432], // Lakewood Station
    ],
    trainCount: 3,
  },
}

let mockSeed = 0

function generateMockVehicles() {
  mockSeed += 0.003 // slowly advance position each call
  const vehicles = []

  for (const [routeId, { waypoints, trainCount }] of Object.entries(MOCK_ROUTES)) {
    const totalPoints = waypoints.length - 1
    for (let i = 0; i < trainCount; i++) {
      const offset = (i / trainCount + mockSeed) % 1
      const rawIdx = offset * totalPoints
      const segIdx = Math.floor(rawIdx)
      const segT = rawIdx - segIdx
      const a = waypoints[Math.min(segIdx, waypoints.length - 1)]
      const b = waypoints[Math.min(segIdx + 1, waypoints.length - 1)]

      const lat = lerp(a[0], b[0], segT)
      const lon = lerp(a[1], b[1], segT)
      const bearing = Math.atan2(b[1] - a[1], b[0] - a[0]) * (180 / Math.PI)

      vehicles.push({
        vehicleId: `mock_${routeId}_${i}`,
        routeId,
        tripId: `mock_trip_${routeId}_${i}`,
        lat,
        lon,
        bearing,
        status: 'IN_PROGRESS',
        nextStop: null,
        scheduleAdherence: Math.round((Math.random() - 0.5) * 120),
      })
    }
  }
  return vehicles
}
