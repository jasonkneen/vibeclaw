# VibeClaw Platform Architecture

## Overview

VibeClaw is expanding from a server configurator into a full creation + discovery platform.
Think HuggingFace vibes -- build, browse, share, fork.

## Content Types

### 1. Servers (existing)
Build OpenClaw server configurations. Test in sandbox. Deploy.

### 2. Skills
Agent Skills following the agentskills.io open standard.
- SKILL.md with YAML frontmatter (name, description)
- Optional: scripts/, references/, assets/
- Build via guided form, test in chat, download or host on VibeClaw URL

### 3. Plugins
Packaged for specific agent marketplaces:
- Claude Code extensions
- OpenCode plugins
- Cursor rules
- Windsurf rules

### 4. Tools
Standalone tools that can be packaged for multiple targets:
- MCP servers
- ACP endpoints
- REST APIs
- Skill scripts
- Plugin components

### 5. Models (Virtual)
Custom model endpoints built from free inference:
- Pick a base model (from OpenRouter free tier)
- Add system prompt, tools, knowledge docs
- Configure parameters (temp, top_p, etc.)
- Expose as an OpenAI-compatible endpoint
- Includes code examples (AI SDK, curl, Python, etc.)

### 6. Recipes
Shared OpenClaw server configurations with community notes.
Fork and customize.

### 7. Knowledge Bases
Collections of documents (MD, PDF, SOUL files, etc.) that can be:
- Attached to models, skills, or servers
- Browsed and searched
- Forked and extended

## Page Structure

### /explore — HuggingFace-style discovery hub
- Search across all types
- Filter by type, tags, author, popularity
- Cards with preview, stats, tags
- Trending / Recently added / Most popular sections

### /create — Unified creation hub (replaces /forge for new types)
- Type selector: Server | Skill | Plugin | Tool | Model | Recipe | KB
- Each type has its own guided builder
- Shared chat interface for testing
- Download / Publish / Share

### /forge — Remains as the server builder (redirects from create?type=server)

### /{type}/{slug} — Individual item pages
- Full details, README, files, stats
- Fork / Download / Install buttons
- Version history
- Comments/discussion (future)

## Database Schema

All tables prefixed `vibeclaw_` in shared Neon DB.

### vibeclaw_items (unified)
- id TEXT PRIMARY KEY
- type TEXT NOT NULL (server|skill|plugin|tool|model|recipe|knowledge)
- slug TEXT NOT NULL
- title TEXT NOT NULL
- description TEXT
- author_id TEXT (nullable for anonymous)
- author_name TEXT DEFAULT 'Anonymous'
- tags TEXT[] DEFAULT '{}'
- spec JSONB NOT NULL (type-specific payload)
- files JSONB DEFAULT '[]' (list of {path, content} for skills/tools)
- readme TEXT
- visibility TEXT DEFAULT 'public' (public|unlisted|private)
- downloads INTEGER DEFAULT 0
- upvotes INTEGER DEFAULT 0
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()
- UNIQUE(type, slug)

### vibeclaw_votes (existing plan)
- user_id TEXT NOT NULL
- item_id TEXT NOT NULL
- PRIMARY KEY (user_id, item_id)

### vibeclaw_favourites (existing plan)
- user_id TEXT NOT NULL
- item_id TEXT NOT NULL
- PRIMARY KEY (user_id, item_id)

## API Endpoints

### /api/items
- GET ?type=skill&tag=mcp&q=search — list/search
- GET ?id=xxx — single item
- POST — create (auth required)
- PUT — update (auth + owner required)
- DELETE — delete (auth + owner required)

### /api/items/vote — POST toggle vote
### /api/items/favourite — POST toggle favourite
### /api/items/fork — POST fork an item
### /api/items/download — POST increment download count + return files

## Local Storage Fallback

All builders save to localStorage as they go (same pattern as forge).
Key pattern: `vibeclaw-{type}-draft`

When signed in, drafts sync to cloud on save.
When not signed in, everything works locally.
