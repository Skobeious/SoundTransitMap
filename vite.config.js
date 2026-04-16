import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/oba': {
        target: 'https://api.pugetsound.onebusaway.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/oba/, ''),
      },
      '/gtfs': {
        target: 'https://www.soundtransit.org/GTFS-rail',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gtfs/, ''),
        followRedirects: true,
      },
    },
  },
})
