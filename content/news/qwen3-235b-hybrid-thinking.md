---
title: "Qwen3 235B: Hybrid Thinking in Eight Open-Source Models"
date: 2026-02-12
tags: [models, alibaba, multilingual, open-source]
author: VibeClaw
image: /news/qwen3-235b.png
summary: "Alibaba's Qwen3 family brings hybrid thinking — toggle between fast responses and deep reasoning. Eight models, all Apache 2.0."
source: "https://qwenlm.github.io/blog/qwen3/"
sourceLabel: "Qwen Blog"
sources:
  - url: "https://huggingface.co/Qwen/Qwen3-235B"
    label: "Qwen3 235B Model Card on Hugging Face"
  - url: "https://qwenlm.github.io/blog/qwen3/"
    label: "Qwen3 Official Blog Announcement"
  - url: "https://github.com/QwenLM/Qwen"
    label: "Qwen GitHub Repository"
---

Alibaba's **Qwen3 235B** introduces something genuinely new: **hybrid thinking mode**.

## Fast Mode vs Think Mode

Most reasoning models are always-on thinkers. They burn through tokens deliberating even simple questions. Qwen3 lets you toggle:

- **Fast mode**: Direct answers, minimal overhead. Like talking to GPT-4.
- **Think mode**: Full chain-of-thought reasoning. Like talking to o3.

You can switch mid-conversation, or let the model decide based on query complexity.

## Broad Multilingual Support

Qwen3 is one of the most multilingual open model families available, with support for a wide range of languages. For teams building agents that serve global users, this matters.

## The Model Family

Qwen3 comes in eight variants — two MoE and six dense, all Apache 2.0:

- **Qwen3-235B-A22B** — 235B total, 22B active (MoE, 128 experts)
- **Qwen3-30B-A3B** — 30B total, 3B active (MoE, 128 experts)
- **Qwen3-32B** — 32B dense, 128K context
- **Qwen3-14B** — 14B dense, 128K context
- **Qwen3-8B** — 8B dense, 128K context
- **Qwen3-4B** — 4B dense, 32K context
- Plus 1.7B and 0.6B for edge/mobile

The 8B version is free on OpenRouter and available in VibeClaw.

## Try It

The Qwen3 8B model is one of the free options in [VibeClaw](https://vibeclaw.dev). For the full 235B, you'll need OpenRouter credits or a local setup with serious hardware.

## Links

- [HuggingFace: Qwen](https://huggingface.co/Qwen)
- [Qwen3 Technical Report](https://qwenlm.github.io/blog/qwen3/)

## Sources

1. [Qwen3 235B Model Card on Hugging Face](https://huggingface.co/Qwen/Qwen3-235B)
2. [Qwen3 Official Blog Announcement](https://qwenlm.github.io/blog/qwen3/)
3. [Qwen GitHub Repository](https://github.com/QwenLM/Qwen)
