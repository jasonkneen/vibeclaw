import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { WebSocketServer } from 'ws';

const isTest = process.env.VITEST === 'true';
export default defineConfig({
  base: '/',
  test: {
    // Exclude e2e tests - they should be run with `npm run test:e2e`
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/examples/**/e2e/**',
      '**/.openclaw-staging/**',
    ],
  },
  plugins: isTest ? [] : [
    wasm(),
    topLevelAwait(),
    // Server-side chat proxy — key stays on server, only free models allowed
    {
      name: 'chat-proxy',
      configureServer(server) {
        const env = loadEnv('', process.cwd(), '');
        const OPENROUTER_KEY = env.OPENROUTER_API_KEY || '';

        // Only models with :free suffix or in this allowlist
        const FREE_MODELS = new Set([
          'upstage/solar-pro-3:free',
          'meta-llama/llama-3.1-8b-instruct:free',
          'meta-llama/llama-3.2-3b-instruct:free',
          'meta-llama/llama-3.2-1b-instruct:free',
          'google/gemma-2-9b-it:free',
          'google/gemma-3-4b-it:free',
          'google/gemma-3-1b-it:free',
          'qwen/qwen3-8b:free',
          'qwen/qwen3-4b:free',
          'qwen/qwen3-1.7b:free',
          'qwen/qwen3-0.6b:free',
          'qwen/qwen-2.5-coder-32b-instruct:free',
          'microsoft/phi-4-reasoning:free',
          'microsoft/phi-3-mini-128k-instruct:free',
          'mistralai/mistral-small-3.1-24b-instruct:free',
          'deepseek/deepseek-r1-0528:free',
          'deepseek/deepseek-chat-v3-0324:free',
          'deepseek/deepseek-r1:free',
          'nousresearch/hermes-3-llama-3.1-405b:free',
          'moonshotai/kimi-vl-a3b-thinking:free',
        ]);

        server.middlewares.use('/api/chat', async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405); res.end('POST only'); return;
          }
          if (!OPENROUTER_KEY) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY not configured on server' }));
            return;
          }

          // Read body
          let body = '';
          for await (const chunk of req) body += chunk;
          let parsed;
          try { parsed = JSON.parse(body); } catch {
            res.writeHead(400); res.end('Invalid JSON'); return;
          }

          // Enforce free models only
          const model = parsed.model || '';
          if (!model.endsWith(':free') && !FREE_MODELS.has(model)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Model "${model}" is not free. Only :free models are allowed.` }));
            return;
          }

          // Proxy to OpenRouter with server-side key
          try {
            const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + OPENROUTER_KEY,
                'HTTP-Referer': 'https://vibeclaw.dev',
                'X-Title': 'vibeclaw sandbox',
              },
              body: JSON.stringify(parsed),
            });

            res.writeHead(upstream.status, {
              'Content-Type': upstream.headers.get('content-type') || 'application/json',
              'Cache-Control': 'no-cache',
            });

            // Stream the response through
            const reader = upstream.body.getReader();
            const pump = async () => {
              while (true) {
                const { done, value } = await reader.read();
                if (done) { res.end(); return; }
                res.write(value);
              }
            };
            await pump();
          } catch (err) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
          }
        });
      },
    },
    // Gateway relay — browser sandbox ↔ external OpenClaw instance
    {
      name: 'gateway-relay',
      configureServer(server) {
          const sessions = new Map();
          const genId = () => Math.random().toString(36).slice(2, 10);
          const wss = new WebSocketServer({ noServer: true });

          // REST: create/list/delete relay sessions
          server.middlewares.use((req, res, next) => {
            if (!req.url.startsWith('/api/relay')) return next();
            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'POST') {
              const id = genId();
              sessions.set(id, { browser: null, external: null, created: Date.now() });
              const host = req.headers.host || 'localhost:5173';
              const proto = req.headers['x-forwarded-proto'] === 'https' ? 'wss' : 'ws';
              res.end(JSON.stringify({
                id,
                url: `${proto}://${host}/relay/${id}`,
                connectUrl: `${proto}://${host}/relay/${id}/connect`,
              }));
              return;
            }

            if (req.method === 'GET') {
              const list = [];
              for (const [id, s] of sessions) {
                list.push({ id, created: s.created, browser: !!s.browser, external: !!s.external });
              }
              res.end(JSON.stringify({ sessions: list }));
              return;
            }

            if (req.method === 'DELETE') {
              const u = new URL(req.url, 'http://x');
              const id = u.searchParams.get('id');
              const s = sessions.get(id);
              if (s) {
                if (s.browser) try { s.browser.close(); } catch {}
                if (s.external) try { s.external.close(); } catch {}
                sessions.delete(id);
              }
              res.end(JSON.stringify({ ok: true }));
              return;
            }

            res.writeHead(405); res.end('{}');
          });

          // WebSocket upgrade for relay paths
          server.httpServer?.on('upgrade', (req, socket, head) => {
            const u = new URL(req.url, 'http://x');
            const m = u.pathname.match(/^\/relay\/(\w+)(\/connect)?$/);
            if (!m) return;

            const id = m[1];
            const isExternal = !!m[2];
            const session = sessions.get(id);
            if (!session) { socket.destroy(); return; }

            wss.handleUpgrade(req, socket, head, (ws) => {
              const role = isExternal ? 'external' : 'browser';
              const peer = isExternal ? 'browser' : 'external';

              session[role] = ws;
              console.log(`[relay:${id}] ${role} connected`);

              ws.on('message', (data) => {
                const other = session[peer];
                if (other?.readyState === 1) other.send(data);
              });

              ws.on('close', () => {
                console.log(`[relay:${id}] ${role} disconnected`);
                session[role] = null;
                const other = session[peer];
                if (other?.readyState === 1) other.send(JSON.stringify({ type: 'relay', event: 'peer_disconnected', peer: role }));
              });

              ws.on('error', () => { session[role] = null; });

              const other = session[peer];
              if (other?.readyState === 1) other.send(JSON.stringify({ type: 'relay', event: 'peer_connected', peer: role }));
            });
          });

          // Cleanup stale sessions every 5 min
          setInterval(() => {
            const now = Date.now();
            for (const [id, s] of sessions) {
              if (!s.browser && !s.external && now - s.created > 300000) sessions.delete(id);
            }
          }, 60000);
      },
    },
    {
      name: 'browser-shims',
      enforce: 'pre',
      resolveId(source) {
        if (source === 'node:zlib' || source === 'zlib') {
          return resolve(__dirname, 'src/shims/zlib.ts');
        }
        if (source === 'brotli-wasm/pkg.web/brotli_wasm.js') {
          return resolve(__dirname, 'node_modules/brotli-wasm/pkg.web/brotli_wasm.js');
        }
        if (source === 'brotli-wasm/pkg.web/brotli_wasm_bg.wasm?url') {
          return {
            id: resolve(__dirname, 'node_modules/brotli-wasm/pkg.web/brotli_wasm_bg.wasm') + '?url',
            external: false,
          };
        }
        return null;
      },
    },
  ],
  define: isTest ? {} : {
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: [resolve(__dirname, './'), resolve(__dirname, 'node_modules')],
    },
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        headers: { 'anthropic-dangerous-direct-browser-access': 'true' },
      },
      '/openclaw-ws': {
        target: 'ws://localhost:18789',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openclaw-ws/, ''),
      },
    },
  },
  resolve: {
    alias: isTest ? {} : {
      'node:zlib': resolve(__dirname, 'src/shims/zlib.ts'),
      'zlib': resolve(__dirname, 'src/shims/zlib.ts'),
      'buffer': 'buffer',
      'process': 'process/browser',
    },
  },
  optimizeDeps: {
    include: isTest ? [] : ['buffer', 'process', 'pako'],
    exclude: ['brotli-wasm', 'convex'],
    esbuildOptions: { target: 'esnext' },
  },
  worker: {
    format: 'es',
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        forge: resolve(__dirname, 'forge.html'),
        'examples/index': resolve(__dirname, 'examples/index.html'),
        'examples/next-demo': resolve(__dirname, 'examples/next-demo.html'),
        'examples/vite-demo': resolve(__dirname, 'examples/vite-demo.html'),
        'examples/express-demo': resolve(__dirname, 'examples/express-demo.html'),
        'examples/agent-manager-demo': resolve(__dirname, 'examples/agent-manager-demo.html'),
        'examples/openclaw-demo': resolve(__dirname, 'examples/openclaw-demo.html'),
        'examples/openclaw-gateway-demo': resolve(__dirname, 'examples/openclaw-gateway-demo.html'),
        'docs/index': resolve(__dirname, 'docs/index.html'),
      },
    },
    outDir: 'dist-site',
  },
  assetsInclude: ['**/*.wasm'],
});
