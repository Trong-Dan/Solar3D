import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', 'three-stdlib'],
          'r3f': ['@react-three/fiber', '@react-three/drei'],
          'react-vendor': ['react', 'react-dom', 'zustand', 'framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
