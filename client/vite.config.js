import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], build: { rollupOptions: { output: { manualChunks(id) {
  if (id.includes('node_modules') && /recharts|d3-|victory-vendor/.test(id)) return 'charts';
  if (id.includes('node_modules') && /react-dom|react-router|\/react\//.test(id.replaceAll('\\', '/'))) return 'react';
} } } } });
