import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { buildSync } from 'esbuild';
import { defineConfig, type Plugin } from 'vite';

function vercelApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const apiPath = url.pathname.replace(/^\/api\//, '').split('?')[0];
        const filePath = path.resolve(__dirname, 'api', `${apiPath}.ts`);

        if (!fs.existsSync(filePath)) {
          return next();
        }

        try {
          // Parse request body for POST/PUT/PATCH
          let body: any = {};
          if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const dataStr = Buffer.concat(buffers).toString('utf-8');
            if (dataStr) {
              try {
                body = JSON.parse(dataStr);
              } catch (e) {
                body = {};
              }
            }
          }

          // Compile TS Vercel function using esbuild in isolation from Vite SSR module graph
          const result = buildSync({
            entryPoints: [filePath],
            bundle: true,
            platform: 'node',
            format: 'cjs',
            write: false,
            target: 'node18',
            external: ['@vercel/node', 'razorpay', 'crypto', 'express']
          });

          const outputCode = result.outputFiles[0].text;
          const customModule: any = { exports: {} };
          const runFn = new Function('module', 'exports', 'require', '__filename', '__dirname', outputCode);
          runFn(customModule, customModule.exports, require, filePath, path.dirname(filePath));

          const handler = customModule.exports.default || customModule.exports;

          if (typeof handler !== 'function') {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: `Vercel API handler default export missing in /api/${apiPath}.ts` }));
          }

          // Construct Vercel-compatible Request and Response objects
          const vercelReq = Object.assign(req, {
            query: Object.fromEntries(url.searchParams),
            body,
            cookies: {},
          });

          const vercelRes = Object.assign(res, {
            status(statusCode: number) {
              res.statusCode = statusCode;
              return vercelRes;
            },
            json(jsonBody: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(jsonBody));
              return vercelRes;
            },
            send(data: any) {
              if (typeof data === 'object') {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } else {
                res.end(data);
              }
              return vercelRes;
            }
          });

          return await handler(vercelReq as any, vercelRes as any);
        } catch (err: any) {
          console.error(`Error executing Vercel API endpoint /api/${apiPath}:`, err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vercelApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
