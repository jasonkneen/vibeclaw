---
title: "Llama 4 Scout: 10M Token Context on a Single GPU"
date: 2026-02-14
tags: [models, meta, open-source]
author: VibeClaw
image: /news/llama-4-scout.png
summary: "Meta drops Llama 4 Scout with 10 million token context and 16 mixture-of-experts — and it runs on a single H100."
source: "https://huggingface.co/meta-llama"
sourceLabel: "HuggingFace"
sources:
  - url: "https://huggingface.co/meta-llama"
    label: "Meta Llama Models on Hugging Face"
  - url: "https://github.com/meta-llama/llama"
    label: "Meta Llama GitHub Repository"
  - url: "https://github.com/meta-llama/llama-models"
    label: "Llama Models - Central Repository for Foundation Models"
---

Meta just released **Llama 4 Scout**, and it's a big deal for open-source AI.

## The Numbers

- **109B parameters** with 16 mixture-of-experts (MoE) — only 17B active at any time
- **10 million token context window** — that's roughly 30 full novels
- **MoE architecture** means lower compute per token than a dense 109B model
- **Natively multimodal** — handles text and images
- Licensed under the **Llama 4 Community License** (commercial use allowed)

## Why It Matters

The 10M context window is the headline, but the real story is efficiency. By using mixture-of-experts, Meta gets strong performance while only activating 17B parameters per token — far less compute than a dense 109B model would require.

There's also Llama 4 Maverick (17B x 128 experts, 400B total) with a 1M context window for even more capable workloads.

## Try It in VibeClaw

Boot a sandbox at [vibeclaw.dev](https://vibeclaw.dev) and test Llama models with free API access through OpenRouter. No API key needed.

## Links

- [HuggingFace: meta-llama](https://huggingface.co/meta-llama)
- [Meta AI Blog](https://ai.meta.com/blog/)

## Sources

1. [Meta Llama Models on Hugging Face](https://huggingface.co/meta-llama)
2. [Meta Llama GitHub Repository](https://github.com/meta-llama/llama)
3. [Llama Models - Central Repository for Foundation Models](https://github.com/meta-llama/llama-models)
