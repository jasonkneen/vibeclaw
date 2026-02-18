export const STYLES = (accent: string) => `
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
    border: 2px solid ${accent}44;
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
    border-color: ${accent}88;
    box-shadow: 0 6px 32px rgba(0,0,0,0.6), 0 0 20px ${accent}22;
  }
  .tc-bubble-btn img {
    width: 38px; height: 38px; object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
  }
  .tc-bubble-btn.tc-ready {
    border-color: ${accent}66;
    pointer-events: all;
    animation: tc-entrance 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards,
               tc-pulse-ring 3s ease-out 0.6s;
  }
  @keyframes tc-entrance {
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes tc-pulse-ring {
    0%   { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 0 ${accent}55; }
    60%  { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 18px ${accent}00; }
    100% { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 0 ${accent}00; }
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
    stroke: ${accent};
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 175.9;
    stroke-dashoffset: 175.9;
    transition: stroke-dashoffset 0.4s ease;
    filter: drop-shadow(0 0 4px ${accent}88);
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
    color: ${accent};
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
    border-color: ${accent}88;
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
    background: linear-gradient(90deg, transparent, ${accent}22, transparent);
  }
  .tc-header-avatar {
    width: 34px; height: 34px; object-fit: contain; flex-shrink: 0;
    filter: drop-shadow(0 0 8px ${accent}44);
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
  .tc-new-btn {
    width: 28px; height: 28px; border-radius: 50%;
    background: transparent; border: 1px solid #2a2a2a;
    color: #555; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; flex-shrink: 0;
  }
  .tc-new-btn:hover { background: #1a1a1a; color: #aaa; border-color: #444; }
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
    height: 100%; background: ${accent};
    border-radius: 3px;
    transition: width 0.3s ease;
    box-shadow: 0 0 6px ${accent}66;
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
    background: ${accent}; border: 1px solid ${accent};
    border-bottom-right-radius: 4px; color: #000; font-weight: 600;
    box-shadow: 0 2px 12px ${accent}44;
  }

  /* ── Typing indicator ── */
  .tc-typing-wrap {
    align-self: flex-start;
    background: #161616; border: 1px solid #2a2a2a;
    border-radius: 14px; border-bottom-left-radius: 4px;
    padding: 10px 14px;
    display: flex; gap: 6px; align-items: center;
  }
  .tc-thinking-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem; color: #777; font-style: italic;
    margin-right: 2px;
  }
  .tc-typing-wrap span {
    width: 5px; height: 5px; background: ${accent}; border-radius: 50%;
    animation: tc-dot 1.3s ease infinite;
    flex-shrink: 0;
  }
  .tc-typing-wrap span:nth-child(2) { animation-delay: 0.2s; }
  .tc-typing-wrap span:nth-child(3) { animation-delay: 0.4s; }
  .tc-typing-wrap span:nth-child(4) { animation-delay: 0.6s; }
  @keyframes tc-dot {
    0%, 100% { opacity: 0.25; transform: translateY(0); }
    50%       { opacity: 1;   transform: translateY(-4px); }
  }

  /* ── Markdown rendering in bot bubbles ── */
  .tc-bot .tc-msg-bubble p { margin: 0 0 8px; line-height: 1.65; }
  .tc-bot .tc-msg-bubble p:last-child { margin-bottom: 0; }
  .tc-bot .tc-msg-bubble strong { color: #fff; font-weight: 700; }
  .tc-bot .tc-msg-bubble em { opacity: 0.85; }
  .tc-bot .tc-msg-bubble code {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px; padding: 1px 6px;
    font-family: 'Fragment Mono', 'Courier New', monospace;
    font-size: 0.82em; color: ${accent};
  }
  .tc-bot .tc-msg-bubble pre {
    background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 12px 14px; overflow-x: auto;
    margin: 8px 0;
  }
  .tc-bot .tc-msg-bubble pre code {
    background: none; border: none; padding: 0;
    font-size: 0.8rem; color: #ccc;
  }
  .tc-bot .tc-msg-bubble ul, .tc-bot .tc-msg-bubble ol {
    padding-left: 18px; margin: 6px 0;
  }
  .tc-bot .tc-msg-bubble li { margin-bottom: 4px; line-height: 1.55; }
  .tc-bot .tc-msg-bubble h1,.tc-bot .tc-msg-bubble h2,.tc-bot .tc-msg-bubble h3 {
    color: #fff; font-family: 'DM Sans', sans-serif;
    font-weight: 700; margin: 12px 0 6px; line-height: 1.3;
  }
  .tc-bot .tc-msg-bubble h1 { font-size: 1rem; }
  .tc-bot .tc-msg-bubble h2 { font-size: 0.92rem; }
  .tc-bot .tc-msg-bubble h3 { font-size: 0.88rem; }
  .tc-bot .tc-msg-bubble a { color: ${accent}; text-decoration: none; }
  .tc-bot .tc-msg-bubble a:hover { text-decoration: underline; }
  .tc-bot .tc-msg-bubble blockquote {
    border-left: 3px solid ${accent}66; padding-left: 12px;
    margin: 8px 0; color: #888; font-style: italic;
  }
  .tc-bot .tc-msg-bubble hr { border: none; border-top: 1px solid #2a2a2a; margin: 10px 0; }

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
  .tc-text-input:focus { border-color: #333; box-shadow: 0 0 0 3px ${accent}11; }
  .tc-text-input:disabled { opacity: 0.35; }
  .tc-send-btn {
    width: 36px; height: 36px; flex-shrink: 0;
    background: ${accent}; border: none; border-radius: 50%;
    color: #000; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; font-weight: 700;
    transition: filter 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 2px 10px ${accent}44;
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
`;
