import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // вихідна директорія
    assetsDir: 'assets',
  },
  server: {
    port: 4000,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
