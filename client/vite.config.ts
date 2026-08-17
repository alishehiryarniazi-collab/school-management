import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite config for the client.
// - react(): JSX/Fast-Refresh support
// - tailwindcss(): Tailwind v4 plugin (reads @import "tailwindcss" in index.css)
// - server.proxy: forwards /api calls to the Express backend during development,
//   so the frontend can call "/api/..." without CORS headaches on localhost.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
