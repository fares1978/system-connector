import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true, // needed for Docker
    watch: {
      usePolling: true, // needed for Docker on some systems
    },
  },
  build: {
    outDir: 'build',
  },
});
