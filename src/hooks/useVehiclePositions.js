import { useState, useEffect, useRef, useCallback } from 'react'
import { deduplicateShapes } from '../utils/gtfsParser'

const OBA_BASE = '/api/oba'
const POLL_INTERVAL = 15000

// Simulation speed multiplier — 60× real-time so trains visibly move on screen
const SIM_SPEED = 60

// Service config: speed (m/s), headway (seconds), trains per direction
// SNDR_EV omitted — its GTFS shape crosses water and looks wrong in simulation
const SERVICE_CONFIG = {
  '100479': { speedMs: 15, headwaySec: 480,  trainsPerDir: 4, headsigns: ['Federal Way Downtown', 'Lynnwood City Center'] },
  '2LINE':  { speedMs: 13, headwaySec: 480,  trainsPerDir: 3, headsigns: ['Downtown Redmond', 'Lynnwood City Center'] },
  'TLINE':  { speedMs:  6, headwaySec: 720,  trainsPerDir: 1, headsigns: ['St Joseph', 'Tacoma Dome'] },
  'SNDR_TL':{ speedMs: 20, headwaySec: 1800, trainsPerDir: 2, headsigns: ['Lakewood Station', 'King Street Station'] },
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function haversineM([lat1, lon1], [lat2, lon2]) {
  const R = 6371000
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function buildProfile(coords) {
  const dists = [0]
  for (let i = 1; i < coords.length; i++) {
    dists.push(dists[i - 1] + haversineM(coords[i - 1], coords[i]))
  }
  return { coords, dists, totalDist: dists[dists.length - 1] }
}

function positionAtDist(profile, rawDist) {
  const total = profile.totalDist
  if (total === 0) return { lat: profile.coords[0][0], lon: profile.coords[0][1], bearing: 0 }

  const d = ((rawDist % total) + total) % total
  let lo = 0, hi = profile.dists.length - 2
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (profile.dists[mid] <= d) lo = mid; else hi = mid - 1
  }
  const i = lo
  const segLen = profile.dists[i + 1] - profile.dists[i]
  const t = segLen > 0 ? (d - profile.dists[i]) / segLen : 0
  const [lat1, lon1] = profile.coords[i]
  const [lat2, lon2] = profile.coords[i + 1] ?? profile.coords[i]
  return {
    lat: lat1 + (lat2 - lat1) * t,
    lon: lon1 + (lon2 - lon1) * t,
    bearing: Math.atan2(lon2 - lon1, lat2 - lat1) * 180 / Math.PI,
  }
}

// ── Simulation ────────────────────────────────────────────────────────────────

function buildShapeProfiles(gtfsShapes) {
  const profiles = {}
  for (const shape of deduplicateShapes(gtfsShapes)) {
    if (!SERVICE_CONFIG[shape.routeId]) continue
    const fwd = buildProfile(shape.coords)
    const rev = buildProfile([...shape.coords].reverse())
    profiles[shape.routeId] = { fwd, rev }
  }
  return profiles
}

function generateSimulatedVehicles(profiles) {
  const nowSec = (Date.now() / 1000) * SIM_SPEED
  const vehicles = []

  for (const [routeId, { speedMs, headwaySec, trainsPerDir, headsigns }] of Object.entries(SERVICE_CONFIG)) {
    const p = profiles[routeId]
    if (!p) continue

    for (let dir = 0; dir < 2; dir++) {
      const profile = dir === 0 ? p.fwd : p.rev
      const headsign = headsigns[dir]

      for (let i = 0; i < trainsPerDir; i++) {
        // Stagger trains evenly across the headway window, offset by direction
        const timeOffset = (i / trainsPerDir) * headwaySec * SIM_SPEED + dir * headwaySec * SIM_SPEED * 0.5
        const distTraveled = ((nowSec + timeOffset) * speedMs) % profile.totalDist
        const pos = positionAtDist(profile, distTraveled)

        vehicles.push({
          vehicleId: `sim_${routeId}_d${dir}_${i}`,
          routeId,
          tripId: `sim_trip_${routeId}_d${dir}_${i}`,
          lat: pos.lat,
          lon: pos.lon,
          bearing: pos.bearing,
          headsign,
          status: 'IN_PROGRESS',
          nextStop: null,
          scheduleAdherence: 0,
        })
      }
    }
  }
  return vehicles
}

// ── Hook ─────────────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t }

export function useVehiclePositions(apiKey, gtfsData) {
  const [vehicles, setVehicles] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const targetRef = useRef([])
  const prevRef = useRef([])
  const frameRef = useRef(null)
  const lastPollTimeRef = useRef(null)
  const profilesRef = useRef(null)

  // Build shape profiles once GTFS shapes are available
  useEffect(() => {
    if (gtfsData?.shapes) {
      profilesRef.current = buildShapeProfiles(gtfsData.shapes)
    }
  }, [gtfsData])

  // Simulation loop — runs every frame, positions based on real time
  useEffect(() => {
    if (!usingMock) return
    let running = true

    function tick() {
      if (!running) return
      if (profilesRef.current) {
        // Use real-time simulation when GTFS shapes are available
        setVehicles(generateSimulatedVehicles(profilesRef.current))
      } else if (targetRef.current.length > 0) {
        // Fall back to lerp interpolation with hardcoded waypoints
        const now = Date.now()
        const elapsed = now - (lastPollTimeRef.current ?? now)
        const t = Math.min(elapsed / POLL_INTERVAL, 1)
        setVehicles(targetRef.current.map(target => {
          const prev = prevRef.current.find(v => v.vehicleId === target.vehicleId)
          if (!prev) return target
          return { ...target, lat: lerp(prev.lat, target.lat, t), lon: lerp(prev.lon, target.lon, t) }
        }))
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => { running = false; if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [usingMock])

  // OBA poll (only when we have a real key)
  useEffect(() => {
    let running = true

    // Interpolation loop for live data
    function animateLive() {
      if (!running || usingMock) return
      const now = Date.now()
      const elapsed = now - (lastPollTimeRef.current ?? now)
      const t = Math.min(elapsed / POLL_INTERVAL, 1)
      setVehicles(targetRef.current.map(target => {
        const prev = prevRef.current.find(v => v.vehicleId === target.vehicleId)
        if (!prev) return target
        return { ...target, lat: lerp(prev.lat, target.lat, t), lon: lerp(prev.lon, target.lon, t) }
      }))
      frameRef.current = requestAnimationFrame(animateLive)
    }

    async function fetchVehicles() {
      if (!apiKey) {
        setUsingMock(true)
        setLastUpdated(new Date())
        return
      }

      try {
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
            nextStop: v.tripStatus?.nextStopName ?? v.tripStatus?.nextStop ?? null,
            headsign: v.tripStatus?.activeTrip?.tripHeadsign ?? null,
            scheduleAdherence: v.tripStatus?.scheduleDeviation ?? 0,
          }))

        prevRef.current = targetRef.current.length ? targetRef.current : parsed
        targetRef.current = parsed
        lastPollTimeRef.current = Date.now()
        setLastUpdated(new Date())
        setUsingMock(false)
        if (!frameRef.current) frameRef.current = requestAnimationFrame(animateLive)
      } catch (err) {
        console.warn('OBA fetch failed, using simulation:', err.message)
        setUsingMock(true)
        setLastUpdated(new Date())
      }
    }

    fetchVehicles()
    const timer = setInterval(fetchVehicles, POLL_INTERVAL)
    return () => {
      running = false
      clearInterval(timer)
      if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null }
    }
  }, [apiKey])

  // Kick off initial timestamp
  useEffect(() => { setLastUpdated(new Date()) }, [])

  return { vehicles, lastUpdated, usingMock }
}
