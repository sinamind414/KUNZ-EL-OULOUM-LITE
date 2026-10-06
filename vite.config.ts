import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// PWA يدوية: public/manifest.webmanifest + public/sw.js + src/utils/pwa.ts
// لا vite-plugin-pwa (تفادي تعارض الإصدارات)، لا d3/jspdf/motion (تطبيق خفيف 100%).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 3000 },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
