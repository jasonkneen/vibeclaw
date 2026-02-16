---
title: "Llama 4 Scout: 10M Token Context on a Single GPU"
date: 2026-02-14
tags: [models, meta, open-source]
author: VibeClaw
image: /news/llama-4-scout.png
summary: "Meta drops Llama 4 Scout with 10 million token context and 16 mixture-of-experts — and it runs on a single H100."
---

Meta just released **Llama 4 Scout**, and it's a big deal for open-source AI.

## The Numbers

- **109B parameters** with 16 mixture-of-experts (MoE) — only 17B active at any time
- **10 million token context window** — that's roughly 30 full novels
- Runs on a **single H100 GPU** thanks to the MoE architecture
- Beats Gemma 3, Qwen 2.5, and GPT-4o on most benchmarks
- Licensed under Meta's community license (free for most use)

## Why It Matters

The 10M context window is the headline, but the real story is efficiency. By using mixture-of-experts, Meta gets GPT-4 class performance while only activating 17B parameters per token. That means you can run this on hardware that would choke on a dense 109B model.

For OpenClaw users, this means you can run a genuinely powerful model locally without renting a GPU cluster.

## Try It in VibeClaw

Boot a sandbox at [vibeclaw.dev](https://vibeclaw.dev) and test Llama models with free API access through OpenRouter. No API key needed.

## Links

- [HuggingFace: meta-llama](https://huggingface.co/meta-llama)
- [Meta AI Blog](https://ai.meta.com/blog/)
