---
title: "The OpenClaw Skills Ecosystem: From Smart Homes to Stock Trading"
date: 2026-02-10
tags: [openclaw, skills, ecosystem]
author: VibeClaw
image: /news/openclaw-skills.png
summary: "OpenClaw's skill system is where it gets interesting. Here's a tour of what's available and how to find what you need."
source: "https://clawhub.com"
sourceLabel: "ClawHub"
---

OpenClaw's core is the agent loop. Skills are what make it *useful*. Think of them as plugins — each one teaches your agent a new capability.

## What's a Skill?

A skill is a directory containing a `SKILL.md` file and optional scripts. The SKILL.md tells OpenClaw how to use the tool. Skills can include:

- CLI tools the agent can invoke
- Configuration templates
- Reference documentation
- Helper scripts

When you install a skill, your agent learns how to use it automatically.

## The Best Skills Right Now

### Smart Home
- **OpenHue** — control Philips Hue lights, scenes, rooms
- **SonosCLI** — play music, control volume, group speakers
- **BluCLI** — BluOS player control
- **EightCTL** — Eight Sleep pod temperature, alarms

### Productivity
- **Apple Notes** — create, search, edit notes via `memo` CLI
- **Apple Reminders** — manage reminders via `remindctl`
- **Things 3** — full task management via URL scheme
- **Obsidian** — vault management for Obsidian users
- **Bear Notes** — create and search Bear notes
- **Google Workspace** — Gmail, Calendar, Drive, Docs, Sheets via `gog`

### Communication
- **iMessage** — read and send iMessages
- **WhatsApp** — send WhatsApp messages (separate from channel integration)
- **Himalaya** — email management via IMAP/SMTP

### Development
- **GitHub** — issues, PRs, CI runs via `gh` CLI
- **Coding Agent** — spawn Codex, Claude Code, or other coding agents
- **MCPorter** — connect to any MCP server interactively

### Media
- **Summarize** — transcribe YouTube videos, podcasts, URLs
- **Nano Banana Pro** — generate images via Gemini
- **OpenAI Image Gen** — batch image generation
- **Whisper** — local speech-to-text
- **SongSee** — audio spectrograms and visualisations

### Monitoring
- **BlogWatcher** — monitor RSS/Atom feeds for updates
- **CamSnap** — capture frames from RTSP/ONVIF cameras
- **Weather** — current conditions and forecasts

## Finding Skills

**ClawHub** (`clawhub.com`) is the skill registry. Search, install, and update skills from the command line:

```bash
clawhub search "smart home"
clawhub install openhue
clawhub update --all
```

Or browse at [clawhub.com](https://clawhub.com).

## Building Your Own

Skills are just directories with a SKILL.md. If you have a CLI tool, you can wrap it in a skill in under 10 minutes. The `skill-creator` skill even helps you scaffold new ones.

## VibeClaw Integration

When you build a server config in VibeClaw's Forge, you can add skills in the Tools step. The export includes skill references that OpenClaw resolves on import.

## Links

- [ClawHub — Skill Registry](https://clawhub.com)
- [OpenClaw Skills Docs](https://docs.openclaw.ai)
- [Build configs at VibeClaw](https://vibeclaw.dev/forge)
