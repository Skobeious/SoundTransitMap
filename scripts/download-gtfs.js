#!/usr/bin/env node
// Downloads the Sound Transit GTFS zip at build time so it's always fresh.
import { createWriteStream, existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import https from 'https'
import http from 'http'

const URL = 'https://www.soundtransit.org/GTFS-rail/40_gtfs.zip'
const DEST = 'public/40_gtfs.zip'

await mkdir('public', { recursive: true })

function download(url, dest, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects === 0) return reject(new Error('Too many redirects'))
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        return download(res.headers.location, dest, redirects - 1).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const file = createWriteStream(dest)
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
      file.on('error', reject)
    })
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout after 30s')) })
    req.on('error', reject)
  })
}

async function tryDownload(attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(`Downloading Sound Transit GTFS (attempt ${i}/${attempts})...`)
      await download(URL, DEST)
      console.log(`GTFS saved to ${DEST}`)
      return true
    } catch (err) {
      console.warn(`  Attempt ${i} failed: ${err.message}`)
      if (i < attempts) await new Promise(r => setTimeout(r, 2000))
    }
  }
  return false
}

const ok = await tryDownload()
if (!ok) {
  if (existsSync(DEST)) {
    console.warn('GTFS download failed — using existing file.')
  } else {
    console.warn('GTFS download failed and no existing file found. Build will continue without GTFS.')
  }
  // Exit 0 so the Vite build still runs — app handles missing GTFS gracefully
  process.exit(0)
}
