import { strFromU8, unzipSync } from 'fflate'

/**
 * Fetch and parse Sound Transit GTFS static zip.
 * Returns { shapes, stops, routes, trips }
 *
 * We skip stop_times.txt (9.7MB) — since this is the Sound Transit-only feed,
 * all stops are Link/ST stops and no filtering is needed.
 */
export async function fetchAndParseGtfs(zipUrl) {
  const resp = await fetch(zipUrl)
  if (!resp.ok) throw new Error(`GTFS fetch failed: ${resp.status}`)
  const buf = await resp.arrayBuffer()
  const files = unzipSync(new Uint8Array(buf))

  const getText = (name) => {
    const f = files[name]
    if (!f) throw new Error(`${name} not found in GTFS zip`)
    return strFromU8(f)
  }

  const routes = parseRoutes(getText('routes.txt'))
  const trips = parseTrips(getText('trips.txt'))
  const shapes = parseShapes(getText('shapes.txt'), trips, routes)
  const stops = parseStops(getText('stops.txt'))

  return { shapes, stops, routes, trips }
}

function parseCsv(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].replace(/\r/g, '').split(',')
  return lines.slice(1).map(line => {
    const vals = line.replace(/\r/g, '').split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] ?? '').trim() })
    return obj
  })
}

function parseRoutes(text) {
  // Returns Map: route_id → route row
  // Include: 0 = tram/light rail, 1 = subway/metro, 2 = commuter rail (Sounder)
  // Exclude: 3 = bus (ST Express, shuttles)
  const routes = new Map()
  for (const row of parseCsv(text)) {
    if (row.route_type === '0' || row.route_type === '1' || row.route_type === '2') {
      routes.set(row.route_id, row)
    }
  }
  return routes
}

function parseTrips(text) {
  const trips = new Map()
  for (const row of parseCsv(text)) {
    trips.set(row.trip_id, row)
  }
  return trips
}

function parseShapes(text, trips, routes) {
  // Find shape_ids used by Link routes
  const linkShapeIds = new Set()
  const shapeToRoute = new Map()

  for (const [, trip] of trips) {
    if (routes.has(trip.route_id) && trip.shape_id) {
      linkShapeIds.add(trip.shape_id)
      if (!shapeToRoute.has(trip.shape_id)) {
        shapeToRoute.set(trip.shape_id, trip.route_id)
      }
    }
  }

  // Parse shape points, group by shape_id
  const shapePoints = new Map()
  for (const row of parseCsv(text)) {
    if (!linkShapeIds.has(row.shape_id)) continue
    if (!shapePoints.has(row.shape_id)) shapePoints.set(row.shape_id, [])
    shapePoints.get(row.shape_id).push({
      lat: parseFloat(row.shape_pt_lat),
      lon: parseFloat(row.shape_pt_lon),
      seq: parseInt(row.shape_pt_sequence, 10),
    })
  }

  const shapes = []
  for (const [shapeId, points] of shapePoints) {
    points.sort((a, b) => a.seq - b.seq)
    shapes.push({
      shapeId,
      routeId: shapeToRoute.get(shapeId),
      coords: points.map(p => [p.lat, p.lon]),
    })
  }

  return shapes
}

function parseStops(text) {
  // GTFS location_type:
  //   ''  = platform/stop (what we want)
  //   '1' = parent station record
  //   '2' = entrance
  // Deduplicate by both parent_station AND stop_name so stations shared
  // between routes (e.g. King Street used by Sounder N + S) appear only once.
  const seenStation = new Set()
  const seenName = new Set()
  const stops = []

  for (const row of parseCsv(text)) {
    if (row.location_type === '1' || row.location_type === '2') continue

    const lat = parseFloat(row.stop_lat)
    const lon = parseFloat(row.stop_lon)
    if (isNaN(lat) || isNaN(lon)) continue

    const stationKey = row.parent_station
    const nameKey = row.stop_name?.trim()

    // Skip if we've already placed a marker for this station or this name
    if (stationKey && seenStation.has(stationKey)) continue
    if (nameKey && seenName.has(nameKey)) continue

    if (stationKey) seenStation.add(stationKey)
    if (nameKey) seenName.add(nameKey)

    // Clean platform/bay info from name
    const cleanName = nameKey
      .replace(/\s*[-–]\s*Bay\s*\d+.*$/i, '')
      .replace(/\s+Bay\s+\d+.*$/i, '')
      .replace(/\s+Stop\s+\S+.*$/i, '')
      .replace(/\s+NE\s+Bay\s+\d+.*$/i, '')
      .replace(/\s+Bay\s+\w+.*$/i, '')
      .trim()

    // isStation: has "Station" in name → proper rail station
    // Otherwise it's a street-level stop (T Line streetcar, bus platform, etc.)
    const isStation = /station/i.test(cleanName)

    stops.push({ stopId: row.stop_id, name: cleanName, lat, lon, isStation })
  }

  return stops
}

/**
 * Pick one representative shape per route — the longest (most points = full extent).
 */
export function deduplicateShapes(shapes) {
  const byRoute = new Map()
  for (const shape of shapes) {
    const existing = byRoute.get(shape.routeId)
    if (!existing || shape.coords.length > existing.coords.length) {
      byRoute.set(shape.routeId, shape)
    }
  }
  return [...byRoute.values()]
}
