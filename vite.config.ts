import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function adminApiDevPlugin(): Plugin {
  return {
    name: 'admin-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/admin/')) {
          return next();
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('utf-8');
        let body: any = {};
        if (rawBody) {
          try {
            body = JSON.parse(rawBody);
          } catch {
            body = {};
          }
        }

        const adaptedReq: any = {
          method: req.method,
          headers: req.headers,
          url: req.url,
          body,
          socket: req.socket,
        };

        const adaptedRes: any = {
          setHeader: (name: string, val: string) => res.setHeader(name, val),
          status: (statusCode: number) => {
            res.statusCode = statusCode;
            return adaptedRes;
          },
          json: (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          },
          send: (text: string) => res.end(text),
          end: () => res.end(),
        };

        try {
          if (url.startsWith('/api/admin/login')) {
            const mod = await import('./api/admin/login.js');
            return mod.default(adaptedReq, adaptedRes);
          } else if (url.startsWith('/api/admin/verify')) {
            const mod = await import('./api/admin/verify.js');
            return mod.default(adaptedReq, adaptedRes);
          } else if (url.startsWith('/api/admin/change-pin')) {
            const mod = await import('./api/admin/change-pin.js');
            return mod.default(adaptedReq, adaptedRes);
          }
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), adminApiDevPlugin()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/sepay': {
        target: 'https://userapi.sepay.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sepay/, '/v2/transactions'),
      },
    },
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
