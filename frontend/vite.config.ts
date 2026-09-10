import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            // Suppress noisy ECONNREFUSED logs while backend starts or is in offline mode
            if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
              return;
            }
            console.error('[vite-proxy error]', err);
          });
        },
      },
    },
  },
})