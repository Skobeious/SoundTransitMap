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
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        return download(res.headers.location, dest, redirects - 1).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const file = createWriteStream(dest)
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
      file.on('error', reject)
    }).on('error', reject)
  })
}

console.log('Downloading Sound Transit GTFS...')
await download(URL, DEST)
console.log(`GTFS saved to ${DEST}`)
