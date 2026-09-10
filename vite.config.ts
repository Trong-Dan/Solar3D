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
    sourcemap: false,
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-three')) return 'r3f';
          if (id.includes('three')) return 'three-vendor';
          if (id.includes('node_modules/react') || id.includes('node_modules/zustand') || id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react') || id.includes('node_modules/maath')) return 'vendor';
        },
      },
    },
  },
})
