---
title: "OpenClaw 2026.2.14: Polls, Better Sandboxing, and 20+ Bug Fixes"
date: 2026-02-14
tags: [openclaw, release, changelog]
author: VibeClaw
image: /news/openclaw-release.png
summary: "The latest OpenClaw release brings Telegram polls, browser sandbox bind mounts, DM access controls, and a mountain of TUI fixes."
source: "https://github.com/openclaw/openclaw/releases"
sourceLabel: "GitHub Releases"
---

OpenClaw **2026.2.14** just dropped, and it's a hefty one. Here's what matters.

## New Features

### Telegram Polls
You can now send polls directly through OpenClaw. Duration, silent delivery, anonymity controls — the full Telegram poll API exposed through `openclaw message poll`. Your agent can now run surveys.

### Browser Sandbox Bind Mounts
New `sandbox.browser.binds` config lets you configure browser container bind mounts separately from exec containers. If you're running headless Chrome in a sandbox, you can now mount only what the browser needs without exposing your full exec filesystem.

### DM Access Controls
Slack and Discord now support `dmPolicy` and `allowFrom` config aliases for DM access control. Legacy keys still work, and `openclaw doctor --fix` can migrate them automatically.

### Discord Exec Approvals
Exec approval prompts can now target channels, DMs, or both via `channels.discord.execApprovals.target`. More flexibility for teams that want human-in-the-loop for dangerous commands.

## Notable Fixes

The TUI got a lot of love this release:

- **Streaming stability** — pre-tool streamed text no longer disappears when later tool deltas arrive
- **Binary history crash** — the TUI no longer crashes on startup when history contains binary attachments
- **Light theme support** — assistant text now renders in terminal default foreground instead of hardcoded light color
- **Narrow terminal handling** — long unbroken tokens are chunked properly to prevent rendering issues

Other fixes:
- **WhatsApp DM policy** — per-account overrides now work correctly
- **Cron delivery** — cron recipients get full output instead of summaries when `delivery.to` is set
- **Media paths** — MEDIA:-prefixed paths with whitespace now load correctly
- **LINE webhook** — "Verify" requests from the LINE Developer Console no longer fail

## Upgrade

```bash
openclaw update
openclaw doctor
```

The `doctor` command will flag any deprecated config keys and offer to migrate them.

## Links

- [Full Changelog](https://github.com/openclaw/openclaw/releases)
- [OpenClaw Docs](https://docs.openclaw.ai)
- [Build configs with VibeClaw](https://vibeclaw.dev/forge)
