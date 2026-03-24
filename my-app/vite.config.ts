import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req) => {
            // Only log /solve responses
            if (!req.url?.includes('/solve')) return;
            let body = '';
            proxyRes.on('data', (chunk: Buffer) => { body += chunk.toString(); });
            proxyRes.on('end', () => {
              console.log('\n' + '='.repeat(60));
              console.log(`[SOLVE API] ${req.method} ${req.url}`);
              console.log(`[SOLVE API] Status: ${proxyRes.statusCode}`);
              try {
                const json = JSON.parse(body);
                console.log('[SOLVE API] solution:');
                console.log(json.solution);
                console.log('[SOLVE API] remaining_queries:', json.remaining_queries);
              } catch {
                console.log('[SOLVE API] Raw body:', body.slice(0, 500));
              }
              console.log('='.repeat(60) + '\n');
            });
          });
        },
      },
    },
  },
})
