import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
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
    host: true,
    allowedHosts: true
  }
});
