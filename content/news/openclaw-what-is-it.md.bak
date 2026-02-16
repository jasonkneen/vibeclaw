---
title: "What Is OpenClaw? The Personal AI Assistant You Actually Own"
date: 2026-02-10
tags: [openclaw, guide, getting-started]
author: VibeClaw
image: /news/openclaw-intro.png
summary: "A no-nonsense guide to OpenClaw — what it is, what it does, how it works, and why it's different from ChatGPT or Copilot."
source: "https://docs.openclaw.ai"
sourceLabel: "OpenClaw Docs"
---

You've probably heard of ChatGPT and Copilot. OpenClaw is different. Here's the short version:

**OpenClaw is a personal AI assistant that runs on your own hardware and talks to you on the apps you already use.**

That's it. No cloud account. No subscription portal. No "your data improves our models." Just an agent on your machine, connected to your life.

## How It Works

1. **Install it** — `npm install -g openclaw@latest` on any machine with Node.js 22+
2. **Configure it** — pick your AI model (Claude, GPT, Gemini, open-source, whatever)
3. **Connect channels** — WhatsApp, Telegram, Discord, Slack, Signal, iMessage, Teams, webchat
4. **Talk to it** — message your agent like you'd message a friend

The Gateway runs as a background daemon. It's always on, always listening on your channels, always ready.

## What Can It Do?

OpenClaw is a framework, not a fixed product. What it does depends on how you set it up:

**Out of the box:**
- Chat on any connected messaging platform
- Search the web, fetch pages, read documents
- Run shell commands (with approval if you want)
- Read and write files
- Control a headless browser
- Set reminders and scheduled tasks
- Text to speech and speech to text

**With skills (plugins):**
- Manage your calendar (Google, Apple)
- Send emails
- Control smart home devices (Hue, Sonos, BluOS)
- Manage GitHub repos
- Read and write Apple Notes, Reminders, Things 3
- Monitor RSS feeds
- Connect to any MCP server

**With paired devices:**
- Camera access (phone, IP cameras)
- Screen capture
- Location tracking
- Run commands on remote machines

## What Makes It Different

| Feature | ChatGPT | Copilot | OpenClaw |
|---------|---------|---------|----------|
| Runs locally | ❌ | ❌ | ✅ |
| Your data stays private | ❌ | ❌ | ✅ |
| Multi-channel messaging | ❌ | ❌ | ✅ |
| Custom tools/skills | Limited | Limited | Unlimited |
| Open source | ❌ | ❌ | ✅ |
| Works offline | ❌ | ❌ | Partially |
| MCP support | ❌ | ❌ | ✅ |

## The Model Question

OpenClaw works with any model provider:

- **Anthropic** (Claude) — recommended, best prompt injection resistance
- **OpenAI** (GPT) — strong alternative
- **Google** (Gemini) — good multimodal
- **OpenRouter** — access to hundreds of models, including free ones
- **Local models** (Ollama, llama.cpp) — fully offline

You can even set up fallback chains: try Claude first, fall back to GPT if it's down, fall back to a local model if you lose internet.

## Getting Started

The fastest way to try OpenClaw without installing anything: **[VibeClaw](https://vibeclaw.dev)**. Boot a sandbox in your browser, test configurations, then export to a real server when you're ready.

For a real install:

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

The wizard walks you through everything.

## Links

- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Getting Started Guide](https://docs.openclaw.ai/start/getting-started)
- [Try in browser at VibeClaw](https://vibeclaw.dev)
