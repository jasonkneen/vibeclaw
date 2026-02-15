# 🦀 vibeclaw.dev

**Try OpenClaw in your browser in less than 3 seconds.**

Boot a full OpenClaw agent sandbox, chat with it, then click through to a real-time gateway dashboard — all from the browser. No install, no Docker, no CLI.

[![vibeclaw](https://img.shields.io/badge/🦀_vibeclaw-ff5c5c?style=for-the-badge&logoColor=white)](https://vibeclaw.dev)
[![GitHub stars](https://img.shields.io/github/stars/jasonkneen/vibeclaw?style=for-the-badge&color=2a2a2a&labelColor=1a1a1a)](https://github.com/jasonkneen/vibeclaw/stargazers)
[![License](https://img.shields.io/github/license/jasonkneen/vibeclaw?style=for-the-badge&color=2a2a2a&labelColor=1a1a1a)](LICENSE)

**[🔗 vibeclaw.dev](https://vibeclaw.dev)** · **[𝕏 Community](https://x.com/vibeclaw)**

---

## What is vibeclaw?

vibeclaw is two things:

1. **📦 Sandbox mode** — Boot an OpenClaw agent right in your browser. A real Node.js container (powered by [almostnode](https://github.com/nicholasgriffintn/almostnode)) loads the OpenClaw runtime, and you chat via free models through OpenRouter. No API keys needed.

2. **🔴 Live Gateway mode** — Connect to your running OpenClaw instance and get a full dashboard: sessions, agents, files, skills, cron jobs, metrics, presence, logs, and streaming chat.

---

## Quick Start

### Sandbox (no setup required)

1. Go to **[vibeclaw.dev](https://vibeclaw.dev)**
2. Pick a flavour from the dropdown
3. Click **▶ Start Now**
4. Chat with the agent
5. Click **🔴 Connect →** to open the gateway dashboard

### Live Gateway

1. Start your OpenClaw gateway locally
2. Open the [Gateway Dashboard](https://vibeclaw.dev/examples/openclaw-gateway-demo.html)
3. Enter your gateway URL and token
4. See everything — all sessions, agents, workspace files, skills, cron jobs, cost tracking, and live logs

---

## Flavours

Flavours are swappable sandbox personalities. Each one defines its own agents, skills, teams, and system prompt. Pick one before booting — the entire sandbox (and gateway dashboard) adapts.

| Emoji | Name | Agents | Focus |
|-------|------|--------|-------|
| 🦀 | **OpenClaw** | 4 | Default coding assistant |
| 🦞 | **TinyClaw** | 5 | Multi-agent orchestrator with team routing |
| 🚀 | **ShipIt** | 5 | DevOps — Docker, K8s, CI/CD, monitoring |
| 💀 | **R00t** | 5 | Security — red/blue teams, pen testing, CTF |
| ✨ | **Pixie** | 5 | Creative studio — UI/UX, branding, animation |
| 🎓 | **Professor** | 4 | Education — teaching, exercises, mentoring |

### Create your own flavour

Add a directory under `vfs-flavours/` with a `manifest.json`:

```json
{
  "id": "my-flavour",
  "name": "My Flavour",
  "emoji": "🔥",
  "version": "1.0.0",
  "description": "What this flavour does",
  "agents": [
    { "id": "main", "name": "Lead", "emoji": "🔥", "description": "The main agent" },
    { "id": "helper", "name": "Helper", "emoji": "🤖", "description": "A helper agent" }
  ],
  "teams": [
    { "id": "core", "name": "Core Team", "leader": "main", "agents": ["main", "helper"] }
  ],
  "skills": [
    { "name": "my-skill", "emoji": "⚡", "description": "What it does" }
  ],
  "systemPrompt": "You are 🔥 My Flavour, a specialist in..."
}
```

Then rebuild:

```bash
npm run flavours:build
```

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   vibeclaw.dev                    │
├──────────────────────┬───────────────────────────┤
│   📦 Sandbox Mode    │   🔴 Live Gateway Mode    │
│                      │                           │
│  almostnode container│  WebSocket to your         │
│  + OpenClaw VFS      │  OpenClaw gateway          │
│  + OpenRouter proxy  │  (JSON-RPC protocol v3)    │
│  + BroadcastChannel  │                           │
│    bridge to dash    │  Ed25519 auth via          │
│                      │  @noble/ed25519            │
├──────────────────────┴───────────────────────────┤
│              Gateway Dashboard                    │
│  Sessions · Agents · Files · Skills · Cron       │
│  Metrics · Presence · Logs · Streaming Chat      │
└──────────────────────────────────────────────────┘
```

### Sandbox ↔ Dashboard Bridge

When you boot a sandbox and click **🔴 Connect →**, the gateway dashboard opens in a new tab. Communication happens via `BroadcastChannel` (same-origin, cross-tab) — no server needed. The sandbox mimics a full OpenClaw gateway, responding to all dashboard API calls.

### Key Technologies

- **[almostnode](https://github.com/nicholasgriffintn/almostnode)** — Browser-native Node.js runtime with virtual filesystem
- **[OpenClaw](https://github.com/nicholasgriffintn/openclaw)** — AI agent framework with gateway protocol
- **[@noble/ed25519](https://github.com/paulmillr/noble-ed25519)** — Pure JS Ed25519 for gateway auth (works on HTTP origins)
- **[OpenRouter](https://openrouter.ai)** — Free model access (server-proxied, no API key needed)

---

## Development

### Prerequisites

- Node.js 20+

### Setup

```bash
git clone https://github.com/jasonkneen/vibeclaw.git
cd vibeclaw
npm install
```

### Dev Server

```bash
npm run dev
```

Opens on `http://localhost:5173` with hot reload.

### Build

```bash
npm run flavours:build   # Build flavour index
npm run build            # Production build
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run flavours:build` | Rebuild `public/flavours.json` from `vfs-flavours/` |
| `npm run vfs:merge` | Merge `vfs-extra/` files into VFS snapshot |
| `npm run openclaw:build` | Build OpenClaw VFS snapshot |

### Project Structure

```
├── index.html                    # Homepage + sandbox
├── examples/
│   ├── openclaw-gateway-demo.html  # Full gateway dashboard
│   ├── openclaw-connect-demo.html  # Minimal connect demo
│   ├── openclaw-client.js          # Reusable WS client
│   └── shared-styles.css           # Shared demo styles
├── vfs-flavours/                 # Flavour definitions
│   ├── default/manifest.json       # 🦀 OpenClaw
│   ├── tinyclaw/                   # 🦞 TinyClaw (full workspace)
│   ├── devops/manifest.json        # 🚀 ShipIt
│   ├── hacker/manifest.json        # 💀 R00t
│   ├── pixie/manifest.json         # ✨ Pixie
│   └── professor/manifest.json     # 🎓 Professor
├── vfs-extra/                    # Extra VFS files merged into snapshot
│   └── data/workspace/            # Agent workspace (SOUL.md, skills, docs)
├── netlify/functions/
│   └── chat.mjs                   # Serverless OpenRouter proxy
├── scripts/
│   ├── build-flavours.mjs         # Flavour index builder
│   └── build-vfs-extra.mjs        # VFS merger
├── public/
│   └── flavours.json              # Built flavour index
├── docs/                          # Documentation pages
├── src/                           # almostnode runtime source
└── dist/openclaw/                 # Built OpenClaw VFS snapshot
```

---

## Deployment

vibeclaw.dev runs on **Netlify**:

- Static site build via Vite
- Serverless function at `/api/chat` proxies to OpenRouter (API key stays server-side)
- Custom domain: `vibeclaw.dev`
- COOP/COEP headers for SharedArrayBuffer support

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `OPENROUTER_API_KEY` | `.env` (dev) / Netlify env (prod) | Server-side OpenRouter proxy |

---

## OpenClaw Gateway Protocol

The gateway dashboard communicates via WebSocket JSON-RPC:

```js
// Request
{ type: "req", id: 1, method: "status", params: {} }

// Response
{ type: "res", id: 1, ok: true, payload: { ... } }

// Event (server push)
{ type: "event", event: "chat", payload: { state: "delta", message: { content: "..." } } }
```

### Connection Flow

1. WebSocket open → server sends `connect.challenge` event with nonce
2. Client signs nonce with Ed25519 → sends `connect` request
3. Server responds with hello + session info

### Supported Methods

| Method | Description |
|--------|-------------|
| `status` | Gateway status, session count, heartbeat config |
| `agents.list` | List all agents |
| `agent.identity.get` | Agent name, emoji, description |
| `sessions.list` | All sessions with token usage |
| `skills.status` | Available and active skills |
| `models.list` | Available models |
| `cron.list` | Scheduled jobs |
| `agents.files.list` | Workspace files |
| `agents.files.get` | File contents |
| `logs.tail` | Gateway log stream |
| `system-presence` | Connected nodes |
| `usage.cost` | Daily cost and token usage |
| `chat.send` | Send message (streams response via events) |
| `chat.history` | Session chat history |

---

## Roadmap

- [ ] **WebGPU local LLM** — Qwen2.5-Coder 1.5B via WebLLM (~900MB, fully offline)
- [ ] **More free models** — as they appear on OpenRouter
- [ ] **Flavour workspace loading** — full VFS snapshots per flavour (not just manifest)
- [ ] **Community flavours** — submit your own via PR
- [ ] **Live gateway relay** — connect to remote gateways from any network

---

## Credits

- **[almostnode](https://github.com/nicholasgriffintn/almostnode)** — The browser-native Node.js runtime that makes this possible
- **[OpenClaw](https://github.com/nicholasgriffintn/openclaw)** — The AI agent framework
- **[TinyClaw](https://github.com/jlia0/tinyclaw)** — Multi-agent orchestrator (inspiration for the TinyClaw flavour)
- **[OpenRouter](https://openrouter.ai)** — Free model API access

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <a href="https://vibeclaw.dev">vibeclaw.dev</a> · Built by <a href="https://github.com/jasonkneen">@jasonkneen</a>
</p>
