# SoundTransitMap — Claude context

## What this is
React + Vite live train tracker for Sound Transit. Mock simulation mode (no API key needed).
Deployed on Railway as service "ST Rail Map", project "overflowing-charm".

## Commands
```bash
npm run dev                                          # local dev → http://localhost:5173
railway up --service "ST Rail Map" --detach         # deploy to Railway
```
Always deploy with `railway up` — GitHub auto-deploy is not reliable.

## Current state
- Live map working: animated mock trains on Stadia dark tiles, station markers, DEMO banner
- Route Map (diagram page) button is HIDDEN in Header.jsx — feature is WIP
- Next task: rebuild DiagramPage as proper SVG schematic with train overlay (see below)

## Next task — Route Map fix
**Problem:** PNG image + SVG overlay approach didn't work (trains looked like dots on a PDF).
**Fix:** Rebuild DiagramPage as a pure SVG schematic:
1. Use station coords in `src/utils/diagramData.js` as the layout
2. Map each vehicle's route + distance-progress to a position along the schematic paths
3. Draw colored train dots moving along the SVG lines
4. Re-enable the button in `src/components/Header.jsx` (currently commented out)

## Key files
| File | Purpose |
|------|---------|
| `src/App.jsx` | Root — view state, passes `vehicles` to DiagramPage |
| `src/components/Map.jsx` | Leaflet map, center [47.62,-122.38], zoom 11 |
| `src/components/Header.jsx` | Route Map button **disabled** — uncomment to re-enable |
| `src/components/DiagramPage.jsx` | Shows ST PNG + SVG overlay (replace with SVG schematic) |
| `src/utils/diagramData.js` | All station x/y coords + line paths for schematic |
| `src/hooks/useVehiclePositions.js` | OBA polling + mock sim, SIM_SPEED=60 |
| `src/utils/gtfsParser.js` | Dedup stations by cleaned name, skip location_type 1-4 |
| `public/st-current-service-map.png` | Official ST map PNG 1200×1800 (March 2026) |
| `public/40_gtfs.zip` | GTFS feed (gitignored, re-downloaded on build) |

## Simulation
- SIM_SPEED = 60 (60× real-time so trains visibly move at zoom 11)
- Routes: 100479 (1 Line), 2LINE, TLINE, SNDR_TL. SNDR_EV omitted (shape crosses water)
- Each vehicle has: vehicleId, routeId, lat, lon, bearing, color, label

## OBA API (not yet active)
- Key pending from: oba_api_key@soundtransit.org
- Set as VITE_OBA_API_KEY in .env.local when it arrives
- Without key → mock mode runs automatically

## Line colors
- 1 Line: #28813F  — routeId 100479
- 2 Line: #007CAD  — routeId 2LINE
- T Line: #F38B00  — routeId TLINE
- Sounder N: #4A7FA5 — routeId NLINE
- Sounder S: #6B9ABF — routeId SLINE
