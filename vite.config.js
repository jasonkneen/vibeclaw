import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { readFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
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
    // Dev proxy for /api/gateway-live — mirrors the Netlify function
    {
      name: 'gateway-live-dev',
      configureServer(server) {
        const OC = join(homedir(), '.openclaw');
        const SKILLS_PATH = join(homedir(), '.nvm', 'versions', 'node', 'v22.14.0', 'lib', 'node_modules', 'openclaw', 'skills');
        const AGENT_SKILLS_PATH = join(homedir(), '.agents', 'skills');

        const readJSON = async (p, fallback = null) => {
          try { return JSON.parse(await readFile(p, 'utf8')); } catch { return fallback; }
        };

        server.middlewares.use('/api/gateway-live', async (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          try {
            const config = await readJSON(join(OC, 'openclaw.json'), {});

            // Skills
            const skills = [];
            for (const base of [SKILLS_PATH, AGENT_SKILLS_PATH]) {
              if (!existsSync(base)) continue;
              const dirs = await readdir(base, { withFileTypes: true }).catch(() => []);
              for (const d of dirs) {
                if (!d.isDirectory()) continue;
                const skillMd = join(base, d.name, 'SKILL.md');
                let title = d.name;
                try {
                  const c = await readFile(skillMd, 'utf8');
                  const m = c.match(/^#\s*(.+)/m);
                  if (m) title = m[1].trim();
                } catch {}
                const enabled = config.skills?.entries?.[d.name]?.enabled !== false;
                skills.push({ id: d.name, title, enabled });
              }
            }

            // Agents
            const agentDefaults = config.agents?.defaults ?? {};
            const agentDefs = config.agents?.entries ?? {};
            const defaultModel = agentDefaults.model?.primary || 'unknown';
            const agents = [
              { id: 'main', name: 'main', model: defaultModel, enabled: true,
                systemPrompt: agentDefaults.systemPrompt || '', workspace: agentDefaults.workspace || '' },
              ...Object.entries(agentDefs).map(([id, ag]) => ({
                id, name: ag.name || id, model: ag.model?.primary || defaultModel,
                systemPrompt: ag.systemPrompt || '', enabled: ag.enabled !== false,
              })),
            ];

            // Channels
            const channels = Object.entries(config.channels ?? {}).map(([id, ch]) => ({
              id, type: id, enabled: ch.enabled !== false,
            }));

            // Models
            const models = [];
            for (const [provider, pc] of Object.entries(config.models?.providers ?? {})) {
              for (const m of (pc.models ?? [])) {
                models.push({ id: `${provider}/${m.id}`, provider, name: m.name || m.id });
              }
            }

            // Cron jobs
            const cronData = await readJSON(join(OC, 'cron', 'jobs.json'), { jobs: [] });
            const cronJobs = (cronData.jobs || []).map(j => ({
              id: j.id, name: j.name || j.id, enabled: j.enabled !== false,
              schedule: j.schedule, lastStatus: j.state?.lastStatus,
              payloadKind: j.payload?.kind,
              payloadMessage: j.payload?.message?.slice?.(0, 200) || j.payload?.text?.slice?.(0, 200) || '',
            }));

            // Nodes
            const nodesData = await readJSON(join(OC, 'nodes', 'paired.json'), {});
            const nodes = Object.values(nodesData).map(n => ({
              id: n.nodeId, name: n.displayName || n.nodeId, platform: n.platform,
            }));

            // Sessions
            const sessionsDir = join(OC, 'agents', 'main', 'sessions');
            let sessions = [];
            if (existsSync(sessionsDir)) {
              const files = await readdir(sessionsDir).catch(() => []);
              const withStats = await Promise.all(
                files.filter(f => f.endsWith('.jsonl')).map(async f => {
                  const s = await stat(join(sessionsDir, f)).catch(() => null);
                  return { id: f.replace('.jsonl',''), mtime: s?.mtime };
                })
              );
              sessions = withStats.filter(s => s.mtime)
                .sort((a,b) => b.mtime - a.mtime).slice(0, 12)
                .map(s => ({ id: s.id, lastActive: s.mtime?.toISOString() }));
            }

            res.end(JSON.stringify({
              ok: true,
              gateway: { port: config.gateway?.port || 18789, version: config.meta?.lastTouchedVersion },
              agents, skills, channels, models, cronJobs, nodes, sessions, defaultModel,
              connection: {
                wsUrl: "ws://127.0.0.1:" + (config.gateway?.port || 18789),
                httpUrl: "http://127.0.0.1:" + (config.gateway?.port || 18789),
                token: config.gateway?.auth?.token || null,
              },
            }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: err.message }));
          }
        });

        server.middlewares.use('/api/gateway-patch', async (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          let body = '';
          for await (const chunk of req) body += chunk;
          try {
            const { patch } = JSON.parse(body);
            const r = await fetch(`http://127.0.0.1:18789/api/config`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config?.gateway?.auth?.token || ''}` },
              body: JSON.stringify(patch),
            });
            res.end(JSON.stringify({ ok: r.ok }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: err.message }));
          }
        });
      },
    },
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
        explore: resolve(__dirname, 'explore.html'),
        library: resolve(__dirname, 'library.html'),
        chat: resolve(__dirname, 'chat.html'),
        news: resolve(__dirname, 'news.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        create: resolve(__dirname, 'create.html'),
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
