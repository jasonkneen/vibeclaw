---
title: "We Tested 5 Free Models on the Same Coding Challenge"
date: 2026-02-13
tags: [review, comparison, coding, free-models]
author: VibeClaw
image: ⚔️
summary: "Solar Pro 3, DeepSeek R1, Llama 3.1, Qwen3 8B, and Gemma 3 walk into a coding challenge. Here's what happened."
---

All five models are free on OpenRouter and available in VibeClaw. We gave them the same task: **build a working todo app with localStorage persistence in vanilla JavaScript**.

## The Task

> Write a complete, working todo app in a single HTML file. It should support adding todos, marking them complete, deleting them, and persisting to localStorage. Use vanilla JS, no frameworks. Make it look decent.

## Results

### 🥇 DeepSeek R1
**Time**: ~45 seconds (long thinking chain)
**Result**: Perfect. Clean code, good CSS, localStorage working, even added a filter for active/completed. Over-engineered slightly but everything worked first try.

### 🥈 Solar Pro 3
**Time**: ~8 seconds
**Result**: Excellent. Clean, minimal, everything worked. Slightly less polished CSS than DeepSeek but the code was arguably cleaner. Best speed-to-quality ratio.

### 🥉 Qwen3 8B
**Time**: ~12 seconds
**Result**: Good. Working app, decent styling. Minor issue with the delete button not having hover states. localStorage worked fine.

### 4th — Gemma 3 4B
**Time**: ~10 seconds
**Result**: Functional but basic. The CSS was minimal — white background, no border-radius, felt like 2015. But the logic was correct.

### 5th — Llama 3.1 8B
**Time**: ~15 seconds
**Result**: Mostly worked but had a bug — completed todos lost their state on page refresh due to a JSON serialisation issue. The code structure was good but needed a fix.

## Verdict

**For coding tasks**: DeepSeek R1 wins on quality, Solar Pro 3 wins on speed. Both are free.

**For quick answers**: Solar Pro 3 is the best default — fast, accurate, and doesn't burn tokens thinking out loud.

**The surprise**: Gemma 3 at 4B parameters held its own against 8B models. Google's training data is doing work.

## Try It Yourself

All five models are available for free at [vibeclaw.dev](https://vibeclaw.dev). Boot a sandbox, pick a flavour, and run your own comparison.
