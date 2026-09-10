import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    open: true,
  },
  esbuild: {
    // Loại bỏ toàn bộ chú thích nội bộ để tránh lộ cấu trúc code
    legalComments: 'none',
    // Loại bỏ lệnh console.log và debugger trong bản build production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // Tuyệt đối không sinh Source Maps (.map) -> Trình duyệt không thể giải ngược ra code gốc TypeScript
    sourcemap: false,
    minify: 'esbuild',
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
