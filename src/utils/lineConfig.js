// Sound Transit line configuration
// route_id values from Sound Transit GTFS (agency 40), verified April 2026
export const LINES = {
  '100479': {
    name: '1 Line',
    shortName: '1',
    color: '#28813F',
    darkColor: '#1e6030',
    description: 'Lynnwood City Center ↔ Federal Way Downtown',
    type: 'light-rail',
  },
  '2LINE': {
    name: '2 Line',
    shortName: '2',
    color: '#007CAD',
    darkColor: '#006090',
    description: 'Lynnwood City Center ↔ Downtown Redmond',
    type: 'light-rail',
  },
  'TLINE': {
    name: 'T Line',
    shortName: 'T',
    color: '#F38B00',
    darkColor: '#c46e00',
    description: 'Tacoma Dome ↔ St Joseph',
    type: 'streetcar',
  },
  'SNDR_EV': {
    name: 'N Line',
    shortName: 'N',
    color: '#4A7FA5',
    darkColor: '#3a6482',
    description: 'Everett ↔ Seattle (Sounder North)',
    type: 'commuter-rail',
    peakOnly: true,
  },
  'SNDR_TL': {
    name: 'S Line',
    shortName: 'S',
    color: '#6B9ABF',
    darkColor: '#527a9c',
    description: 'Seattle ↔ Tacoma/Lakewood (Sounder South)',
    type: 'commuter-rail',
    peakOnly: true,
  },
}

export function getLineConfig(routeId) {
  if (!routeId) return null
  if (LINES[routeId]) return { ...LINES[routeId], routeId }
  // Partial match for agency-prefixed IDs (e.g. "40_2LINE")
  for (const [id, config] of Object.entries(LINES)) {
    if (routeId.endsWith(id) || routeId.includes(id)) {
      return { ...config, routeId }
    }
  }
  return null
}

export function getLineColor(routeId) {
  return getLineConfig(routeId)?.color ?? '#888'
}
