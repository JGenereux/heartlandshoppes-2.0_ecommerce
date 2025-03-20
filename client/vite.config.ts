import { defineConfig } from 'vite'; // ✅ FIX: Add this import
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 8080,  // Expose on port 8080
    allowedHosts: ['heartlandshoppes.ca', 'www.heartlandshoppes.ca'],
    hmr: {
      protocol: 'wss',  // ✅ Change to secure WebSocket (wss)
      host: 'heartlandshoppes.ca',  // ✅ Match your domain
      clientPort: 443,  // ✅ WebSockets should use port 443 for HTTPS
    }
  }
})
