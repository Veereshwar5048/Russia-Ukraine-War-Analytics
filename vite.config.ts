import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-is'],
          // Map library
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Charts
          'vendor-recharts': ['recharts'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Utilities
          'vendor-utils': ['papaparse', 'date-fns', 'clsx', 'tailwind-merge', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
