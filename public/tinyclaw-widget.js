(function(l,d){typeof exports=="object"&&typeof module<"u"?d(exports):typeof define=="function"&&define.amd?define(["exports"],d):(l=typeof globalThis<"u"?globalThis:l||self,d(l.TinyClaw={}))})(this,function(l){"use strict";var E=Object.defineProperty;var S=(l,d,g)=>d in l?E(l,d,{enumerable:!0,configurable:!0,writable:!0,value:g}):l[d]=g;var n=(l,d,g)=>S(l,typeof d!="symbol"?d+"":d,g);const d=s=>`
  /* Shadow DOM — styles are fully isolated from the host page */
  :host { display: block; }

  *, *::before, *::after {
    box-sizing: border-box; margin: 0; padding: 0;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  }

  /* ── Bubble Button ── */
  .tc-bubble-btn {
    width: 62px; height: 62px;
    border-radius: 50%;
    background: #111;
    border: 2px solid ${s}44;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
    position: absolute;
    bottom: 28px; right: 28px;
    padding: 0;
    opacity: 0;
    transform: scale(0.5) translateY(10px);
    pointer-events: none;
  }
  .tc-bubble-btn:hover {
    transform: scale(1.06);
    border-color: ${s}88;
    box-shadow: 0 6px 32px rgba(0,0,0,0.6), 0 0 20px ${s}22;
  }
  .tc-bubble-btn img {
    width: 38px; height: 38px; object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
  }
  .tc-bubble-btn.tc-ready {
    border-color: ${s}66;
    pointer-events: all;
    animation: tc-entrance 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards,
               tc-pulse-ring 3s ease-out 0.6s;
  }
  @keyframes tc-entrance {
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes tc-pulse-ring {
    0%   { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 0 ${s}55; }
    60%  { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 18px ${s}00; }
    100% { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 0 ${s}00; }
  }

  /* ── Loading ring ── */
  .tc-loading-ring {
    position: absolute;
    bottom: 28px; right: 28px;
    width: 62px; height: 62px;
    display: flex; align-items: center; justify-content: center;
    opacity: 1;
    transition: opacity 0.4s ease;
  }
  .tc-loading-ring.done { opacity: 0; pointer-events: none; }
  .tc-ring-svg {
    position: absolute; top: 0; left: 0;
    width: 62px; height: 62px;
    transform: rotate(-90deg);
  }
  .tc-ring-track {
    fill: none;
    stroke: #1e1e1e;
    stroke-width: 3;
  }
  .tc-ring-fill {
    fill: none;
    stroke: ${s};
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 175.9;
    stroke-dashoffset: 175.9;
    transition: stroke-dashoffset 0.4s ease;
    filter: drop-shadow(0 0 4px ${s}88);
  }
  .tc-ring-inner {
    width: 50px; height: 50px;
    border-radius: 50%;
    background: #111;
    border: 1px solid #1e1e1e;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 1px;
  }
  .tc-ring-img {
    width: 26px; height: 26px;
    object-fit: contain;
    opacity: 0.6;
  }
  .tc-ring-pct {
    font-size: 0.5rem;
    color: ${s};
    font-family: 'Fragment Mono', 'Courier New', monospace;
    letter-spacing: 0.02em;
    line-height: 1;
  }

  /* ── Suggestion chips ── */
  .tc-suggestions {
    display: flex; flex-wrap: wrap; gap: 7px;
    padding: 4px 0 10px;
    animation: tcFadeIn 0.35s ease both;
  }
  @keyframes tcFadeIn {
    from { opacity:0; transform: translateY(6px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .tc-chip {
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #2a2a2a;
    background: #161616;
    color: #aaa;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.74rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    line-height: 1.3;
    text-align: left;
  }
  .tc-chip:hover {
    border-color: ${s}88;
    color: #fff;
    background: #1e1e1e;
  }

  .tc-status-badge {
    position: absolute; top: 1px; right: 1px;
    width: 14px; height: 14px; border-radius: 50%;
    background: #333; border: 2px solid #0a0a0a;
    transition: background 0.4s, box-shadow 0.4s;
  }
  .tc-status-badge.ready {
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74,222,128,0.7);
    animation: tc-led 3s ease-in-out infinite;
  }
  .tc-status-badge.loading {
    background: #facc15;
    box-shadow: 0 0 8px rgba(250,204,21,0.7);
    animation: tc-led 0.8s ease-in-out infinite;
  }
  @keyframes tc-led { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* ── Chat Window ── */
  .tc-window {
    position: absolute;
    bottom: 104px; right: 28px;
    width: 360px;
    max-height: 520px;
    background: #0d0d0d;
    border: 1px solid #1e1e1e;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px #ffffff06, inset 0 1px 0 #ffffff08;
    transform-origin: bottom right;
    transform: scale(0.9) translateY(12px);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.25s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.2s ease;
  }
  .tc-window.tc-open {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  /* ── Header ── */
  .tc-header {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    background: linear-gradient(180deg, #141414 0%, #0f0f0f 100%);
    border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
    position: relative;
  }
  .tc-header::after {
    content: '';
    position: absolute; bottom: 0; left: 14px; right: 14px; height: 1px;
    background: linear-gradient(90deg, transparent, ${s}22, transparent);
  }
  .tc-header-avatar {
    width: 34px; height: 34px; object-fit: contain; flex-shrink: 0;
    filter: drop-shadow(0 0 8px ${s}44);
  }
  .tc-header-info { flex: 1; min-width: 0; }
  .tc-header-name {
    font-size: 0.85rem; font-weight: 700;
    color: #fff; letter-spacing: 0.01em;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-header-status {
    display: flex; align-items: center; gap: 5px; margin-top: 1px;
  }
  .tc-header-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #333; flex-shrink: 0;
    transition: background 0.4s, box-shadow 0.4s;
  }
  .tc-header-dot.ready { background: #4ade80; box-shadow: 0 0 5px rgba(74,222,128,0.8); }
  .tc-header-dot.loading { background: #facc15; animation: tc-led 0.8s infinite; }
  .tc-header-label {
    font-size: 0.68rem; color: #555; font-weight: 500;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-close-btn {
    margin-left: auto; flex-shrink: 0;
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 50%;
    color: #555; cursor: pointer;
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; transition: all 0.15s;
  }
  .tc-close-btn:hover { background: #252525; color: #ccc; border-color: #3a3a3a; }

  /* ── Download progress ── */
  .tc-download-bar {
    padding: 10px 14px;
    background: #111;
    border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .tc-download-label {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.72rem; color: #555; margin-bottom: 6px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-download-label span:last-child { color: #facc15; font-weight: 600; }
  .tc-download-track {
    height: 3px; background: #1e1e1e; border-radius: 3px; overflow: hidden;
  }
  .tc-download-fill {
    height: 100%; background: ${s};
    border-radius: 3px;
    transition: width 0.3s ease;
    box-shadow: 0 0 6px ${s}66;
  }

  /* ── Messages ── */
  .tc-messages {
    flex: 1; overflow-y: auto; padding: 14px 12px;
    display: flex; flex-direction: column; gap: 8px;
    scrollbar-width: thin; scrollbar-color: #1e1e1e transparent;
    min-height: 0;
  }
  .tc-messages::-webkit-scrollbar { width: 3px; }
  .tc-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }

  .tc-msg {
    display: flex; flex-direction: column; max-width: 86%;
    animation: tc-msg-in 0.18s ease forwards;
  }
  @keyframes tc-msg-in {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tc-msg.tc-bot  { align-self: flex-start; }
  .tc-msg.tc-user { align-self: flex-end; }

  .tc-msg-bubble {
    padding: 10px 13px;
    font-size: 0.875rem; line-height: 1.55; font-weight: 400;
    word-break: break-word; border-radius: 14px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-bot .tc-msg-bubble {
    background: #161616; border: 1px solid #222;
    border-bottom-left-radius: 4px; color: #ccc;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .tc-user .tc-msg-bubble {
    background: ${s}; border: 1px solid ${s};
    border-bottom-right-radius: 4px; color: #000; font-weight: 600;
    box-shadow: 0 2px 12px ${s}44;
  }

  /* ── Typing indicator ── */
  .tc-typing-wrap {
    align-self: flex-start;
    background: #161616; border: 1px solid #222;
    border-radius: 14px; border-bottom-left-radius: 4px;
    padding: 13px 16px;
    display: flex; gap: 5px; align-items: center;
  }
  .tc-typing-wrap span {
    width: 5px; height: 5px; background: #444; border-radius: 50%;
    animation: tc-dot 1.3s ease infinite;
  }
  .tc-typing-wrap span:nth-child(2) { animation-delay: 0.2s; }
  .tc-typing-wrap span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes tc-dot {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50%       { opacity: 1;   transform: translateY(-3px); }
  }

  /* ── Input bar ── */
  .tc-input-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px;
    background: #0a0a0a; border-top: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .tc-text-input {
    flex: 1; background: #161616; border: 1px solid #222; border-radius: 22px;
    padding: 10px 16px;
    color: #e8e8e8; font-size: 0.875rem; outline: none;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .tc-text-input::placeholder { color: #555; }
  .tc-text-input:focus { border-color: #333; box-shadow: 0 0 0 3px ${s}11; }
  .tc-text-input:disabled { opacity: 0.35; }
  .tc-send-btn {
    width: 36px; height: 36px; flex-shrink: 0;
    background: ${s}; border: none; border-radius: 50%;
    color: #000; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; font-weight: 700;
    transition: filter 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 2px 10px ${s}44;
  }
  .tc-send-btn:hover { filter: brightness(1.1); transform: scale(1.06); }
  .tc-send-btn:active { transform: scale(0.94); }
  .tc-send-btn:disabled { opacity: 0.35; cursor: default; transform: none; box-shadow: none; }

  /* ── Footer ── */
  .tc-powered {
    text-align: center; padding: 6px;
    font-size: 0.58rem; color: #555; letter-spacing: 0.08em; text-transform: uppercase;
    flex-shrink: 0; font-family: 'Fragment Mono', monospace;
  }
  .tc-powered a { color: #777; text-decoration: none; transition: color 0.15s; }
  .tc-powered a:hover { color: #aaa; }
`,g=`
# VibeClaw — Browser-Native OpenClaw Runtime

VibeClaw (vibeclaw.dev) is the world's first one-click deployment of a private, secure, instantly usable OpenClaw AI agent server — running entirely in the browser. No installation, no Docker, no CLI.

## How It Works
1. Visit vibeclaw.dev
2. Select a Flavour (agent personality/squad)
3. Click "Power On"
4. Your OpenClaw server boots in ~5 seconds, entirely in your browser tab

## Key Features
- Full Node.js runtime in the browser via almostnode (40+ shimmed modules)
- Virtual filesystem — read, write, create files
- npm package support — install packages inside the container
- Multi-agent orchestration with team routing
- Your API key goes DIRECT to Anthropic — never touches our servers
- WebSocket gateway for connecting live OpenClaw instances
- Cron jobs & scheduled tasks
- Streaming chat with session management
- Skill management & cost tracking
- Flavour system — swap agent personalities in one click

## Available Flavours
- 🦀 **OpenClaw** (default) — General coding assistant with file access, code review, and project skills
- 🚀 **ShipIt** — DevOps & infrastructure squad (Docker, K8s, CI/CD, monitoring)
- 💀 **R00t** — Security research squad (pen testing, CTF, vulnerability analysis)
- ✨ **Pixie** — Creative studio squad (UI/UX, branding, animation, copy)
- 🎓 **Professor** — Teaching assistant squad (explains concepts, exercises, code review)
- 🦞 **TinyClaw** — Multi-agent orchestrator (Coder, Writer, Reviewer, Designer)

## Pricing
- Free to use — bring your own API key
- Key stored locally in browser, never sent to vibeclaw servers
- Compatible with OpenRouter (free models available) and direct Anthropic

## Tech Stack
- **almostnode** — browser-native Node.js runtime (github.com/macaly/almostnode)
- **OpenClaw** — AI agent framework (openclaw.ai)
- **VibeClaw** — the browser shell & playground (vibeclaw.dev)

## Getting Started
\`\`\`
1. Go to https://vibeclaw.dev
2. Pick a flavour (start with 🦀 OpenClaw)
3. Click Power On
4. Paste your Anthropic or OpenRouter API key
5. Chat with your in-browser AI agent
\`\`\`

## Links
- Site: https://vibeclaw.dev
- GitHub: https://github.com/jasonkneen/vibeclaw
- Docs: https://vibeclaw.dev/docs
- OpenClaw: https://openclaw.ai
- almostnode: https://github.com/macaly/almostnode
`.trim(),m=s=>`You are 🦞 Clawdio, a friendly and enthusiastic assistant for VibeClaw. You are PROOF that this technology works — you're running entirely in the visitor's browser right now, powered by almostnode and OpenClaw.

Keep responses concise and conversational. Be enthusiastic about the tech but not annoying. Use the knowledge base below to answer questions accurately.

${s}

If asked something you don't know, say so honestly. Always encourage people to try VibeClaw — it's free and boots in seconds.`,C="https://esm.run/@mlc-ai/web-llm",_="Qwen2.5-1.5B-Instruct-q4f16_1-MLC",y="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fragment+Mono&display=swap";class w{constructor(t={}){n(this,"cfg");n(this,"host",null);n(this,"shadow",null);n(this,"loadingRing",null);n(this,"ringFill",null);n(this,"ringPct",null);n(this,"bubbleBtn",null);n(this,"abortCtrl",null);n(this,"win",null);n(this,"messagesEl",null);n(this,"inputEl",null);n(this,"sendBtn",null);n(this,"headerDot",null);n(this,"headerLabel",null);n(this,"badge",null);n(this,"dlBar",null);n(this,"dlFill",null);n(this,"dlPct",null);n(this,"history",[]);n(this,"ready",!1);n(this,"engine",null);n(this,"useLocal",!1);n(this,"_suggestionsEl",null);this.cfg={apiKey:t.apiKey||localStorage.getItem("tc-api-key")||"",model:t.model||"upstage/solar-pro-3:free",webllmModel:t.webllmModel||_,preferLocal:t.preferLocal??!0,kb:t.kb||g,avatar:t.avatar||"https://vibeclaw.dev/crab.png",accent:t.accent||"#ff5c5c",position:t.position||"bottom-right",title:t.title||"Clawdio",greeting:t.greeting||"Hey! I'm 🦞 Clawdio — running entirely in your browser. Ask me anything about VibeClaw!",openRouterReferer:t.openRouterReferer||(typeof location<"u"?location.origin:"https://vibeclaw.dev")}}mount(t){var u,p,b,f;const e=t instanceof HTMLElement?t:t?document.querySelector(t):document.body;if(!e)throw new Error("TinyClaw: mount target not found");if(!document.getElementById("tc-fonts")){const h=document.createElement("link");h.id="tc-fonts",h.rel="stylesheet",h.href=y,document.head.appendChild(h)}this.host=document.createElement("div"),this.host.id="tc-host";const i=this.cfg.position==="bottom-left"?"left:0":"right:0";this.host.setAttribute("style",`position:fixed;bottom:0;${i};width:0;height:0;z-index:2147483647;overflow:visible;`),e.appendChild(this.host),this.shadow=this.host.attachShadow({mode:"open"});const a=document.createElement("link");a.rel="stylesheet",a.href=y,this.shadow.appendChild(a);const r=document.createElement("style");r.textContent=d(this.cfg.accent),this.shadow.appendChild(r);const c=document.createElement("div");c.innerHTML=this._html(),this.shadow.appendChild(c);const o=h=>this.shadow.querySelector(h);return this.loadingRing=o(".tc-loading-ring"),this.ringFill=o(".tc-ring-fill"),this.ringPct=o(".tc-ring-pct"),this.bubbleBtn=o(".tc-bubble-btn"),this.win=o(".tc-window"),this.messagesEl=o(".tc-messages"),this.inputEl=o(".tc-text-input"),this.sendBtn=o(".tc-send-btn"),this.headerDot=o(".tc-header-dot"),this.headerLabel=o(".tc-header-label"),this.badge=o(".tc-status-badge"),this.dlBar=o(".tc-download-bar"),this.dlFill=o(".tc-download-fill"),this.dlPct=o(".tc-dl-pct"),(u=this.bubbleBtn)==null||u.addEventListener("click",()=>this._toggle()),(p=o(".tc-close-btn"))==null||p.addEventListener("click",()=>this._close()),(b=this.sendBtn)==null||b.addEventListener("click",()=>this._send()),(f=this.inputEl)==null||f.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),this._send())}),this._boot(),this}unmount(){var t;(t=this.host)==null||t.remove()}open(){var t,e;(t=this.win)==null||t.classList.add("tc-open"),(e=this.inputEl)==null||e.focus(),localStorage.setItem("tc-open","1")}close(){this._close()}setApiKey(t){this.cfg.apiKey=t,localStorage.setItem("tc-api-key",t)}_html(){return`
      <div class="tc-loading-ring">
        <svg class="tc-ring-svg" viewBox="0 0 62 62">
          <circle class="tc-ring-track" cx="31" cy="31" r="28"/>
          <circle class="tc-ring-fill"  cx="31" cy="31" r="28"/>
        </svg>
        <div class="tc-ring-inner">
          <img src="${this.cfg.avatar}" class="tc-ring-img" alt="">
          <span class="tc-ring-pct">0%</span>
        </div>
      </div>

      <div class="tc-window">
        <div class="tc-header">
          <img src="${this.cfg.avatar}" class="tc-header-avatar" alt="Clawdio">
          <div class="tc-header-info">
            <div class="tc-header-name">${this.cfg.title}</div>
            <div class="tc-header-status">
              <span class="tc-header-dot"></span>
              <span class="tc-header-label">Starting…</span>
            </div>
          </div>
          <button class="tc-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="tc-download-bar" style="display:none">
          <div class="tc-download-label">
            <span>Downloading local model</span>
            <span class="tc-dl-pct">0%</span>
          </div>
          <div class="tc-download-track"><div class="tc-download-fill" style="width:0%"></div></div>
        </div>
        <div class="tc-messages"></div>
        <div class="tc-input-bar">
          <input class="tc-text-input" placeholder="Ask me anything…" disabled>
          <button class="tc-send-btn" disabled>↑</button>
        </div>
        <div class="tc-powered">Powered by <a href="https://vibeclaw.dev" target="_blank">VibeClaw</a> · running in your browser</div>
      </div>
      <button class="tc-bubble-btn" aria-label="Chat with Clawdio">
        <img src="${this.cfg.avatar}" alt="">
        <span class="tc-status-badge"></span>
      </button>`}async _boot(){this._setStatus("Starting…",!1);const[t]=await Promise.all([this.cfg.preferLocal?this._checkWebGPU():Promise.resolve(!1),this._fetchKB()]);t?await this._loadLocal():(this.loadingRing&&this.loadingRing.classList.add("done"),await new Promise(e=>setTimeout(e,300)),this._setReady())}async _fetchKB(){const t="tc-llm-txt-v2",e="tc-llm-txt-v2-ts";try{const a=localStorage.getItem(t),r=Number(localStorage.getItem(e)||0);if(a&&Date.now()-r<36e5){this.cfg.kb=a;return}const c=await fetch("/llm.txt",{cache:"no-store"});if(c.ok){const o=await c.text();this.cfg.kb=o;try{localStorage.setItem(t,o),localStorage.setItem(e,String(Date.now()))}catch{}}}catch{}}async _checkWebGPU(){try{return"gpu"in navigator?!!await navigator.gpu.requestAdapter():!1}catch{return!1}}async _loadLocal(){this._setStatus("Loading local model…","loading"),this.dlBar&&(this.dlBar.style.display="block");try{const t=await import(C);this.engine=await t.CreateMLCEngine(this.cfg.webllmModel,{initProgressCallback:e=>{const i=Math.round((e.progress||0)*100);this.dlFill&&(this.dlFill.style.width=`${i}%`),this.dlPct&&(this.dlPct.textContent=`${i}%`),this._setStatus(`Loading ${i}%`,"loading")}}),this.useLocal=!0,this.dlBar&&(this.dlBar.style.display="none"),this._setReady("Local · no API key")}catch(t){console.warn("TinyClaw WebLLM failed, using API fallback",t),this.dlBar&&(this.dlBar.style.display="none"),this._setReady()}}_setReady(t="Ready"){var e;this._setStatus(t,"ready"),this.ready=!0,(e=this.bubbleBtn)==null||e.classList.add("tc-ready"),this.inputEl&&(this.inputEl.disabled=!1),this.sendBtn&&(this.sendBtn.disabled=!1),this._addMsg("assistant",this.cfg.greeting),this._addSuggestions()}_addSuggestions(){var i;const t=["What is VibeClaw?","How does Sandbox mode work?","What are Flavours?","What is Live Gateway mode?","Tell me about ClawForge","How do I get an API key?","Is my API key safe?","What models are supported?"],e=document.createElement("div");e.className="tc-suggestions",t.forEach(a=>{const r=document.createElement("button");r.className="tc-chip",r.textContent=a,r.addEventListener("click",()=>{this._removeSuggestions(),this.inputEl&&(this.inputEl.value=a),this._send()}),e.appendChild(r)}),this._suggestionsEl=e,(i=this.messagesEl)==null||i.appendChild(e),this._scroll()}_removeSuggestions(){this._suggestionsEl&&(this._suggestionsEl.style.opacity="0",this._suggestionsEl.style.transition="opacity 0.2s ease",setTimeout(()=>{var t;return(t=this._suggestionsEl)==null?void 0:t.remove()},200),this._suggestionsEl=null)}_setStatus(t,e=!1){this.headerLabel&&(this.headerLabel.textContent=t),this.headerDot&&(this.headerDot.className="tc-header-dot"+(e?` ${e}`:"")),this.badge&&(this.badge.className="tc-status-badge"+(e?` ${e}`:""))}_toggle(){var t;(t=this.win)!=null&&t.classList.contains("tc-open")?this._close():this.open()}_close(){var t;(t=this.win)==null||t.classList.remove("tc-open"),localStorage.setItem("tc-open","0")}_addMsg(t,e){var r;const i=document.createElement("div");i.className=`tc-msg ${t==="user"?"tc-user":"tc-bot"}`;const a=document.createElement("div");return a.className="tc-msg-bubble",a.textContent=e,i.appendChild(a),(r=this.messagesEl)==null||r.appendChild(i),this._scroll(),a}_showTyping(){var e;const t=document.createElement("div");return t.className="tc-typing-wrap",t.innerHTML="<span></span><span></span><span></span>",(e=this.messagesEl)==null||e.appendChild(t),this._scroll(),t}_scroll(){this.messagesEl&&(this.messagesEl.scrollTop=this.messagesEl.scrollHeight)}async _send(){var i,a;const t=(a=(i=this.inputEl)==null?void 0:i.value)==null?void 0:a.trim();if(!t||!this.ready)return;this._removeSuggestions(),this.inputEl&&(this.inputEl.value=""),this.inputEl&&(this.inputEl.disabled=!0),this.sendBtn&&(this.sendBtn.disabled=!0),this._addMsg("user",t),this.history.push({role:"user",content:t});const e=this._showTyping();try{this.useLocal&&this.engine?await this._chatLocal(e):await this._chatRemote(e)}catch{e.remove(),this._addMsg("assistant","Sorry, something went wrong. Please try again!"),this.history.pop()}this.inputEl&&(this.inputEl.disabled=!1,this.inputEl.focus()),this.sendBtn&&(this.sendBtn.disabled=!1)}async _chatLocal(t){var c,o;const e=[{role:"system",content:m(this.cfg.kb)},...this.history];t.remove();const i=this._addMsg("assistant","");let a="";const r=await this.engine.chat.completions.create({messages:e,stream:!0});for await(const u of r){const p=((o=(c=u.choices[0])==null?void 0:c.delta)==null?void 0:o.content)||"";p&&(a+=p,i.textContent=a,this._scroll())}this.history.push({role:"assistant",content:a})}async _chatRemote(t){var u,p,b;const e=this.cfg.apiKey||localStorage.getItem("tc-api-key")||"";if(!e){t.remove(),this._showKeyPrompt(),this.history.pop();return}const i=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`,"HTTP-Referer":this.cfg.openRouterReferer,"X-Title":"VibeClaw Clawdio"},body:JSON.stringify({model:this.cfg.model,messages:[{role:"system",content:m(this.cfg.kb)},...this.history],stream:!0})});if(!i.ok)throw new Error(`API ${i.status}`);t.remove();const a=this._addMsg("assistant",""),r=i.body.getReader(),c=new TextDecoder;let o="";for(;;){const{done:f,value:h}=await r.read();if(f)break;for(const x of c.decode(h).split(`
`)){if(!x.startsWith("data:"))continue;const v=x.slice(5).trim();if(v==="[DONE]")break;try{const k=(b=(p=(u=JSON.parse(v).choices)==null?void 0:u[0])==null?void 0:p.delta)==null?void 0:b.content;k&&(o+=k,a.textContent=o,this._scroll())}catch{}}}this.history.push({role:"assistant",content:o})}_showKeyPrompt(){var e,i;const t=document.createElement("div");t.className="tc-msg tc-bot",t.innerHTML=`<div class="tc-msg-bubble" style="background:#161616;border:1px solid #222;border-bottom-left-radius:4px;color:#999;font-size:0.82rem;line-height:1.55;max-width:280px;">
      WebGPU not available. Add an <a href="https://openrouter.ai" target="_blank" style="color:${this.cfg.accent};text-decoration:none;">OpenRouter</a> key:
      <div style="display:flex;margin-top:10px;border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;">
        <input placeholder="sk-or-..." class="tc-key-inp" style="flex:1;background:#0a0a0a;border:none;padding:9px 11px;color:#ccc;font-size:0.8rem;font-family:DM Sans,system-ui,sans-serif;outline:none;">
        <button class="tc-key-ok" style="background:${this.cfg.accent};border:none;color:#000;padding:0 14px;cursor:pointer;font-weight:700;font-size:0.75rem;font-family:DM Sans,system-ui,sans-serif;">SAVE</button>
      </div>
    </div>`,(e=this.messagesEl)==null||e.appendChild(t),this._scroll(),(i=t.querySelector(".tc-key-ok"))==null||i.addEventListener("click",()=>{var r,c;const a=(c=(r=t.querySelector(".tc-key-inp"))==null?void 0:r.value)==null?void 0:c.trim();a&&(this.setApiKey(a),t.remove(),this._addMsg("assistant","Key saved! What would you like to know? 🦞"),this.inputEl&&(this.inputEl.disabled=!1,this.inputEl.focus()),this.sendBtn&&(this.sendBtn.disabled=!1))})}}typeof document<"u"&&document.addEventListener("DOMContentLoaded",()=>{const s=document.querySelector("script[data-tc-auto]");if(!s)return;const t={apiKey:s.dataset.apiKey,model:s.dataset.model,accent:s.dataset.accent,avatar:s.dataset.avatar,position:s.dataset.position,title:s.dataset.title,greeting:s.dataset.greeting};new w(t).mount()}),l.DEFAULT_KB=g,l.DEFAULT_SYSTEM=m,l.TinyClawWidget=w,l.default=w,Object.defineProperties(l,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
//# sourceMappingURL=tinyclaw-widget.umd.js.map
