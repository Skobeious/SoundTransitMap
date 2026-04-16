import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const OBA_KEY = process.env.OBA_API_KEY || ''

// Proxy /api/oba/* → OneBusAway, injecting the API key server-side
app.use('/api/oba', createProxyMiddleware({
  target: 'https://api.pugetsound.onebusaway.org',
  changeOrigin: true,
  pathRewrite: { '^/api/oba': '' },
  on: {
    proxyReq: (proxyReq, req) => {
      // Inject server-side API key — replaces any key sent by the client
      const url = new URL('https://api.pugetsound.onebusaway.org' + proxyReq.path)
      url.searchParams.set('key', OBA_KEY)
      proxyReq.path = url.pathname + '?' + url.searchParams.toString()
    },
  },
}))

// Serve built frontend
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Sound Transit Map running on port ${PORT}`)
})
