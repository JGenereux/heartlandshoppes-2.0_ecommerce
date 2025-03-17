import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 80,  // Expose on port 3000
    hmr: {
      protocol: 'ws',  // Use WebSocket protocol for HMR
      host: 'localhost',  // Adjust WebSocket connection to point to localhost (the Docker host)
      clientPort: 80,  // Ensure the WebSocket client is on the correct port
    }
  }
})