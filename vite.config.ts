import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/')) {
              return 'vendor';
            }
            if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('micromark') || id.includes('mdast') || id.includes('unist')) {
              return 'markdown';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_REMOTE_API === '1' ? 'https://clbsach.pages.dev' : 'http://127.0.0.1:8788',
        changeOrigin: true,
        secure: true,
        agent: process.env.VITE_REMOTE_API === '1' ? new https.Agent({ keepAlive: false }) : undefined,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res: any) => {
            console.error('[Vite Proxy Error]', err.message);
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
            }
          });
        },
      },
    },
  }
});
