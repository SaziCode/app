import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // вихідна директорія
    assetsDir: 'assets',
    rollupOptions: {
      input: './public/index.html', // явно вказуємо на index.html
    },
  },
  server: {
    port: 4000,  // Порт для фронтенду
    proxy: {
      '/api': 'http://localhost:3000',  // Проксі для запитів до бекенду
    },
  },
});
