// Underground tunnel segments for Sound Transit lines.
// Each box = [minLat, maxLat, minLon, maxLon]
// Only 1 Line and 2 Line have significant underground sections.

const TUNNEL_BOXES = [
  // Northgate tunnel — Northgate → U District (under I-5)
  [47.655, 47.715, -122.340, -122.305],
  // Broadway / Capitol Hill tunnel — U District → Westlake
  [47.607, 47.660, -122.340, -122.308],
  // DSTT — Westlake → International District
  [47.593, 47.614, -122.342, -122.318],
  // Beacon Hill tunnel — SODO → Columbia City (deep bore)
  [47.555, 47.584, -122.325, -122.293],
  // Bellevue Downtown tunnel (2 Line)
  [47.608, 47.622, -122.202, -122.183],
]

// Routes that have tunnel sections
const TUNNEL_ROUTES = new Set(['100479', '2LINE'])

function isInTunnel([lat, lon]) {
  return TUNNEL_BOXES.some(
    ([minLat, maxLat, minLon, maxLon]) =>
      lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
  )
}

/**
 * Split a shape's coord array into surface/tunnel segments.
 * Returns [{ coords: [[lat,lon],...], tunnel: bool }, ...]
 */
export function splitByTunnel(coords, routeId) {
  if (!TUNNEL_ROUTES.has(routeId) || coords.length === 0) {
    return [{ coords, tunnel: false }]
  }

  const segments = []
  let current = [coords[0]]
  let currentTunnel = isInTunnel(coords[0])

  for (let i = 1; i < coords.length; i++) {
    const inTunnel = isInTunnel(coords[i])
    if (inTunnel !== currentTunnel) {
      // Overlap by one point so segments join cleanly
      current.push(coords[i])
      segments.push({ coords: current, tunnel: currentTunnel })
      current = [coords[i]]
      currentTunnel = inTunnel
    } else {
      current.push(coords[i])
    }
  }
  if (current.length > 0) segments.push({ coords: current, tunnel: currentTunnel })

  return segments
}
