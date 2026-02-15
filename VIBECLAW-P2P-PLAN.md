# VibeClaw + ClawForge: Build, Preview, Deploy OpenClaw Servers

## The Pitch

**"Configure your AI server like you'd spec a Mac. Preview it live in your browser. Deploy it anywhere with one click."**

---

## The User Journey

```
┌──────────────────────────────────────────────────────────────────┐
│                        vibeclaw.dev                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    LANDING PAGE                              │ │
│  │                                                             │ │
│  │   "OpenClaw in your browser in 30 seconds"                  │ │
│  │                                                             │ │
│  │   [▶ Try it now]          [🔧 Build your server →]          │ │
│  │   (instant sandbox)        (goes to ClawForge)              │ │
│  └─────────┬───────────────────────────┬───────────────────────┘ │
│             │                           │                        │
│             ▼                           ▼                        │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  INSTANT DEMO     │    │  CLAWFORGE CONFIGURATOR          │   │
│  │                  │    │  (apple.com-style)               │   │
│  │  Pick a flavour  │    │                                  │   │
│  │  Boot instantly  │    │  Step 1: Core Runtime            │   │
│  │  Chat & play     │    │  Step 2: Agents & Roles          │   │
│  │                  │    │  Step 3: Skills & Tools           │   │
│  │  Like it?        │    │  Step 4: Personality & Prompts    │   │
│  │  [🔧 Customize →]│    │  Step 5: Workspace & Files        │   │
│  │                  │    │  Step 6: Model & Provider          │   │
│  └──────────────────┘    │                                  │   │
│                          │  [Live Preview ▶]                 │   │
│                          │  (boots config in sandbox)        │   │
│                          │                                  │   │
│                          │  Happy? ───────────────────────┐ │   │
│                          └──────────────────────────────┐ │ │   │
│                                                         │ │ │   │
│  ┌──────────────────────────────────────────────────────┼─┘ │   │
│  │                DEPLOY / EXPORT                       │   │   │
│  │                                                     │   │   │
│  │  📦 Download package     (tar.gz with everything)   │   │   │
│  │  🐳 Docker               (docker run one-liner)     │   │   │
│  │  💻 CLI                  (npx openclaw init <url>)   │   │   │
│  │  ☁️  One-click deploy:                               │   │   │
│  │     • Railway                                       │   │   │
│  │     • Fly.io                                        │   │   │
│  │     • Render                                        │   │   │
│  │     • DigitalOcean App Platform                     │   │   │
│  │     • Vercel (edge)                                 │   │   │
│  │  🌐 Share on mesh        (MoltRats P2P)             │   │   │
│  │  💾 Save to My Servers   (library)                  │   │   │
│  └──────────────────────────────────────────────────────┘   │   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Two Entry Points, One Flow

### 1. "Try it now" (instant demo — stays exactly as today)
- Landing page, pick flavour, boot, chat
- Zero friction, 30 seconds to first message
- **NEW:** After playing, a CTA appears: *"Like this? Build your own →"*
- Takes you to ClawForge with the current flavour pre-loaded as a starting point

### 2. "Build your server" (ClawForge configurator)
- Apple.com Mac Studio-style step-by-step configurator
- Pick components from libraries
- Live preview — test your config in the sandbox before committing
- When happy: deploy, download, or save

---

## The ClawForge Configurator

### UX: Apple.com Meets AI

Think Mac Studio configuration page. Clean, visual, scrolling through options with a persistent "Your Server" summary sidebar.

```
┌────────────────────────────────────────────────────────────┐
│  🔧 ClawForge                                    $0/month │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  ┌─────────────────────────────────┐  ┌────────────────┐  │
│  │                                 │  │ YOUR SERVER     │  │
│  │  STEP 1: CORE RUNTIME           │  │                │  │
│  │                                 │  │ 🚀 "DevBot"    │  │
│  │  ○ Standard (single agent)      │  │                │  │
│  │  ● Multi-agent (team routing)   │  │ Runtime:       │  │
│  │  ○ Minimal (lightweight)        │  │  Multi-agent   │  │
│  │                                 │  │                │  │
│  │  STEP 2: AGENTS                  │  │ Agents: 3      │  │
│  │                                 │  │  🚀 Ship       │  │
│  │  [🚀 Ship — Lead Dev     ]  ✓  │  │  🔍 Lint       │  │
│  │  [🔍 Lint — Code Review  ]  ✓  │  │  ✍️ Docs       │  │
│  │  [✍️ Docs — Documentation]  ✓  │  │                │  │
│  │  [🎨 Pixel — Design      ]     │  │ Skills: 4      │  │
│  │  [+ Add custom agent     ]     │  │  github        │  │
│  │                                 │  │  docker        │  │
│  │  STEP 3: SKILLS                  │  │  filesystem    │  │
│  │                                 │  │  chat          │  │
│  │  [⚡ GitHub Integration  ]  ✓  │  │                │  │
│  │  [🐳 Docker & Deploy     ]  ✓  │  │ Model:         │  │
│  │  [📁 Filesystem          ]  ✓  │  │  Gemini Flash  │  │
│  │  [💬 Chat                ]  ✓  │  │                │  │
│  │  [🌐 Web Browsing        ]     │  │ ──────────────│  │
│  │  [🔒 Security Audit      ]     │  │                │  │
│  │  [+ Browse ClawForge...  ]     │  │ [▶ Preview]    │  │
│  │                                 │  │ [📦 Deploy →]  │  │
│  │  STEP 4: PERSONALITY             │  │ [💾 Save]      │  │
│  │  ┌─────────────────────────┐   │  └────────────────┘  │
│  │  │ You are 🚀 Ship, a     │   │                       │
│  │  │ direct, no-nonsense    │   │                       │
│  │  │ full-stack dev...      │   │                       │
│  │  └─────────────────────────┘   │                       │
│  │  [Use template ▼]              │                       │
│  │                                 │                       │
│  │  STEP 5: WORKSPACE FILES        │                       │
│  │                                 │                       │
│  │  📄 AGENTS.md        [edit]    │                       │
│  │  📄 SOUL.md          [edit]    │                       │
│  │  📄 USER.md          [edit]    │                       │
│  │  📄 TOOLS.md         [edit]    │                       │
│  │  [+ Add file]                  │                       │
│  │                                 │                       │
│  │  STEP 6: MODEL & PROVIDER       │                       │
│  │                                 │                       │
│  │  ○ Gemini 2.0 Flash (free)     │                       │
│  │  ● Gemini 2.5 Pro              │                       │
│  │  ○ Claude 3.5 Sonnet            │                       │
│  │  ○ GPT-4o                       │                       │
│  │  ○ Local (Ollama)               │                       │
│  │  ○ Bring your own key           │                       │
│  │                                 │                       │
│  └─────────────────────────────────┘                       │
└────────────────────────────────────────────────────────────┘
```

### "Preview" = Boot in Sandbox
Click **Preview** → your config assembles into a VFS flavour on-the-fly → boots in the sandbox → you chat with your server live. If something's not right, go back and tweak. Zero cost to iterate.

---

## Deploy Options (the "checkout")

When the user clicks **Deploy**, they see deployment options:

### 📦 Download Package
- Generates a `my-server.tar.gz` containing:
  - `gateway.yaml` (OpenClaw config)
  - `AGENTS.md`, `SOUL.md`, workspace files
  - `skills/` directory
  - `Dockerfile`
  - `docker-compose.yml`
  - `README.md` with setup instructions
- User downloads and runs locally

### 💻 CLI One-liner
```bash
npx openclaw init https://vibeclaw.dev/forge/srv_abc123
```
- Fetches the server config from VibeClaw/ClawForge
- Scaffolds the local directory
- Installs dependencies
- Ready to `openclaw gateway start`

### 🐳 Docker
```bash
docker run -e ANTHROPIC_API_KEY=sk-... ghcr.io/openclaw/server:latest \
  --config https://vibeclaw.dev/forge/srv_abc123
```
- Pre-built OpenClaw image that pulls config from a URL
- Or bake config into a custom image via Dockerfile in the download

### ☁️ One-Click Deploy
Buttons for each provider that pre-fill the config:

| Provider | Method |
|----------|--------|
| **Railway** | `railway.app/new/template` with env vars |
| **Fly.io** | `fly launch` with fly.toml (gasrats already has this!) |
| **Render** | render.yaml blueprint |
| **DigitalOcean** | App Platform spec |
| **Vercel** | Edge functions (lightweight mode) |

Each button links to the provider's deploy flow with the server config pre-loaded.

### 🌐 Share on Mesh
- Registers the sandbox on MoltRats P2P mesh
- Gets a public URL: `mesh.moltrats.com/node/{id}/v1/chat/completions`
- Anyone can use it from any OpenAI-compatible client
- Earns crumbs for serving requests

### 💾 Save to My Servers
- Saves to local IndexedDB + syncs to backend (if logged in)
- Appears in "My Servers" library
- Boot, edit, fork, delete anytime

---

## The Server Config Format

Everything gets serialized as a single JSON blob — the **Server Spec**:

```json
{
  "specVersion": "1.0",
  "id": "srv_abc123",
  "name": "DevBot Pro",
  "emoji": "🚀",
  "description": "Full-stack dev assistant with GitHub and Docker skills",
  "author": { "ratId": "rat_xyz", "name": "jason" },
  "visibility": "public",

  "runtime": {
    "type": "multi-agent",
    "model": { "provider": "openrouter", "model": "google/gemini-2.0-flash-001" }
  },

  "agents": [
    {
      "id": "main",
      "name": "Ship",
      "emoji": "🚀",
      "role": "lead",
      "systemPrompt": "You are 🚀 Ship, a direct full-stack dev..."
    }
  ],

  "teams": [
    { "id": "core", "name": "Core Dev", "leader": "main", "agents": ["main", "reviewer"] }
  ],

  "skills": [
    { "source": "builtin:filesystem" },
    { "source": "builtin:chat" },
    { "source": "forge:github-integration@1.2.0" },
    { "source": "forge:docker-deploy@0.9.0" },
    { "source": "inline", "name": "my-custom-skill", "config": { "...": "..." } }
  ],

  "workspace": {
    "AGENTS.md": "# My Agent Setup\n...",
    "SOUL.md": "# Personality\n...",
    "USER.md": "# About the User\n...",
    "TOOLS.md": "# Tool Config\n..."
  },

  "mesh": {
    "enabled": false,
    "modalities": ["chat", "code"],
    "tier": "claw"
  }
}
```

This single spec can:
- Boot a sandbox (VibeClaw preview)
- Generate a download package (tar.gz with gateway.yaml, Dockerfile, etc.)
- Feed a CLI init command
- Register on the mesh
- Be shared/forked on ClawForge

---

## Implementation Phases

### Phase 1: Instant Demo + "Build Your Own" CTA
**Keep today's UX intact. Add the bridge to the forge.**

- Landing page stays the same — instant flavour picker + boot
- Add "Build your own →" button alongside "Try it now"
- After sandbox session, show CTA: "Like this? Customize it →"
- "Customize" pre-loads the current flavour into the builder

**Effort:** Small — mostly UI/routing

---

### Phase 2: ClawForge Configurator (In-Browser Builder)
**The apple.com experience.**

- Step-by-step configurator page (`/forge` or `/build`)
- Pick from built-in components initially (agents, skills from existing flavours)
- Edit system prompts, workspace files inline
- Persistent summary sidebar showing your config
- **Preview button** — assembles a dynamic flavour, boots sandbox
- **Save locally** — IndexedDB persistence, "My Servers" library page

**Effort:** Medium-Large — new UI, config assembly, dynamic flavour generation

---

### Phase 3: Deploy / Export Options
**Turn a config into something real.**

- **Download package generator** — Server spec → tar.gz with:
  - `gateway.yaml` / OpenClaw config
  - Workspace files
  - `Dockerfile` + `docker-compose.yml`
  - `README.md`
- **CLI integration** — `npx openclaw init <forge-url>`
  - Fetches spec from VibeClaw API
  - Scaffolds directory
- **One-click deploy buttons** — Pre-filled templates for Railway, Fly.io, Render, etc.
- **Docker image** — `docker run` with config URL

**Effort:** Medium — templating, API endpoint for spec retrieval, deploy button links

---

### Phase 4: Backend + Accounts (Share & Sync)
**Powered by MoltRats/GasRats backend.**

- User accounts (register/login via MoltRats API)
- Server configs sync to Postgres
- Public server gallery — browse what others have built
- Fork, star, install counts
- "My Servers" syncs across devices

**New backend tables:**
```sql
-- Server configs
CREATE TABLE servers (
  id TEXT PRIMARY KEY,
  rat_id TEXT REFERENCES rats(id),
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  spec JSONB NOT NULL,
  visibility TEXT DEFAULT 'private',
  fork_of TEXT REFERENCES servers(id),
  stars INTEGER DEFAULT 0,
  boots INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Forge components (Phase 5)
CREATE TABLE forge_components (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  author_id TEXT REFERENCES rats(id),
  config JSONB NOT NULL,
  version TEXT NOT NULL,
  tags TEXT[],
  stars INTEGER DEFAULT 0,
  installs INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);
```

**Effort:** Medium — backend routes, auth flow, sync logic

---

### Phase 5: ClawForge Marketplace (Component Library)
**Community-driven component ecosystem.**

- Browse/search components by type (agents, skills, prompts, templates)
- Publish your own
- Version management
- In the configurator, "Browse ClawForge" opens the marketplace
- One-click add components to your server config
- Star, review, fork components

**Effort:** Large — marketplace UI, publishing flow, moderation

---

### Phase 6: P2P Mesh (MoltRats Integration)
**The multiplayer layer.**

- Sandbox registers on MoltRats mesh
- Gets a public inference endpoint
- Other users/agents can discover and use your server
- Crumb economy for serving/using
- Agent-to-agent delegation across the mesh

**Effort:** Medium — WS client, mesh handler, discovery UI

---

## Summary

| # | Phase | What | Depends On |
|---|-------|------|------------|
| 1 | Demo + CTA | Add "Build your own" to landing | Nothing |
| 2 | Configurator | Apple-style builder + local save | Phase 1 |
| 3 | Deploy/Export | Download, Docker, CLI, one-click | Phase 2 |
| 4 | Backend/Accounts | Sync, share, gallery | Phase 2 + gasrats |
| 5 | Marketplace | Component library | Phase 4 |
| 6 | P2P Mesh | Live sharing, discovery | Phase 4 |

**Phase 1 + 2 are the foundation. Phase 3 is the payoff. Phases 4-6 are the ecosystem.**

---

*Start with Phase 1? It's small and sets up everything else.*
