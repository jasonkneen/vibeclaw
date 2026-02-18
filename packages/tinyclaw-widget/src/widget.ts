import { marked } from 'marked';
import { STYLES } from './styles';
import { DEFAULT_KB, DEFAULT_SYSTEM } from './kb';

// Configure marked — no async, sanitize links
marked.setOptions({ async: false, breaks: true, gfm: true });

export interface TinyClawConfig {
  apiKey?: string;
  model?: string;
  webllmModel?: string;
  preferLocal?: boolean;
  kb?: string;
  avatar?: string;
  accent?: string;
  position?: 'bottom-right' | 'bottom-left';
  title?: string;
  greeting?: string;
  openRouterReferer?: string;
}

interface Message { role: 'user' | 'assistant'; content: string; }

const WEBLLM_CDN      = 'https://esm.run/@mlc-ai/web-llm';
const DEFAULT_LOCAL   = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
const FONT_URL        = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fragment+Mono&display=swap';

export class TinyClawWidget {
  private cfg: Required<TinyClawConfig>;
  private host: HTMLElement | null        = null;
  private shadow: ShadowRoot | null       = null;
  private loadingRing: HTMLElement | null = null;
  private ringFill: SVGCircleElement | null = null;
  private ringPct: HTMLElement | null     = null;
  private bubbleBtn: HTMLElement | null   = null;
  private abortCtrl: AbortController | null = null;
  private win: HTMLElement | null        = null;
  private messagesEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private sendBtn: HTMLElement | null    = null;
  private headerDot: HTMLElement | null  = null;
  private headerLabel: HTMLElement | null = null;
  private badge: HTMLElement | null      = null;
  private dlBar: HTMLElement | null      = null;
  private dlFill: HTMLElement | null     = null;
  private dlPct: HTMLElement | null      = null;
  private history: Message[] = [];
  private ready   = false;
  private engine: any = null;
  private useLocal = false;

  constructor(config: TinyClawConfig = {}) {
    this.cfg = {
      apiKey:            config.apiKey || localStorage.getItem('tc-api-key') || '',
      model:             config.model || 'upstage/solar-pro-3:free',
      webllmModel:       config.webllmModel || DEFAULT_LOCAL,
      preferLocal:       config.preferLocal ?? true,
      kb:                config.kb || DEFAULT_KB,
      avatar:            config.avatar || 'https://vibeclaw.dev/crab.png',
      accent:            config.accent || '#ff5c5c',
      position:          config.position || 'bottom-right',
      title:             config.title || 'Clawdio',
      greeting:          config.greeting || "Hey! I'm 🦞 Clawdio — running entirely in your browser. Ask me anything about VibeClaw!",
      openRouterReferer: config.openRouterReferer || (typeof location !== 'undefined' ? location.origin : 'https://vibeclaw.dev'),
    };
  }

  mount(target?: string | HTMLElement) {
    const root = (target instanceof HTMLElement ? target
      : target ? document.querySelector(target)
      : document.body) as HTMLElement;
    if (!root) throw new Error('TinyClaw: mount target not found');

    // ── Pre-load fonts into document head so Shadow DOM can use them ──
    if (!document.getElementById('tc-fonts')) {
      const link = document.createElement('link');
      link.id   = 'tc-fonts';
      link.rel  = 'stylesheet';
      link.href = FONT_URL;
      document.head.appendChild(link);
    }

    // ── Host element (fixed position, no styles of its own) ──
    this.host = document.createElement('div');
    this.host.id = 'tc-host';
    // Anchor at corner — zero size, children use absolute offsets
    const side = this.cfg.position === 'bottom-left' ? 'left:0' : 'right:0';
    this.host.setAttribute('style',
      `position:fixed;bottom:0;${side};width:0;height:0;z-index:2147483647;overflow:visible;`
    );
    root.appendChild(this.host);

    // ── Shadow root — fully isolated ──
    this.shadow = this.host.attachShadow({ mode: 'open' });

    // Inject styles + font link inside shadow
    const fontLink = document.createElement('link');
    fontLink.rel  = 'stylesheet';
    fontLink.href = FONT_URL;
    this.shadow.appendChild(fontLink);

    const style = document.createElement('style');
    style.textContent = STYLES(this.cfg.accent);
    this.shadow.appendChild(style);

    // Inject HTML
    const wrap = document.createElement('div');
    wrap.innerHTML = this._html();
    this.shadow.appendChild(wrap);

    // ── Refs ──
    const $ = (s: string) => this.shadow!.querySelector(s) as any;
    this.loadingRing = $('.tc-loading-ring');
    this.ringFill    = $('.tc-ring-fill');
    this.ringPct     = $('.tc-ring-pct');
    this.bubbleBtn   = $('.tc-bubble-btn');
    this.win         = $('.tc-window');
    this.messagesEl  = $('.tc-messages');
    this.inputEl     = $('.tc-text-input');
    this.sendBtn     = $('.tc-send-btn');
    this.headerDot   = $('.tc-header-dot');
    this.headerLabel = $('.tc-header-label');
    this.badge       = $('.tc-status-badge');
    this.dlBar       = $('.tc-download-bar');
    this.dlFill      = $('.tc-download-fill');
    this.dlPct       = $('.tc-dl-pct');

    // ── Events ──
    this.bubbleBtn?.addEventListener('click', () => this._toggle());
    $('.tc-close-btn')?.addEventListener('click', () => this._close());
    $('.tc-new-btn')?.addEventListener('click', () => this._newChat());
    this.sendBtn?.addEventListener('click', () => this._send());
    this.inputEl?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(); }
    });

    this._boot();
    return this;
  }

  unmount() { this.host?.remove(); }
  open()    { this.win?.classList.add('tc-open'); this.inputEl?.focus(); localStorage.setItem('tc-open','1'); }
  close()   { this._close(); }
  setApiKey(k: string) { this.cfg.apiKey = k; localStorage.setItem('tc-api-key', k); }

  // ── Private ──

  private _html() {
    // r=28, circumference = 2π×28 ≈ 175.9
    return `
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
          <button class="tc-new-btn" aria-label="New chat" title="New chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
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
      </button>`;
  }

  private async _boot() {
    this._setStatus('Starting…', false);
    // Fetch KB + GPU check in parallel — neither blocks the other
    const [hasGPU] = await Promise.all([
      this.cfg.preferLocal ? this._checkWebGPU() : Promise.resolve(false),
      this._fetchKB(),
    ]);
    if (hasGPU) {
      await this._loadLocal();
    } else {
      if (this.loadingRing) this.loadingRing.classList.add('done');
      await new Promise(r => setTimeout(r, 300));
      this._setReady();
    }
  }

  private async _fetchKB(): Promise<void> {
    const CACHE_KEY = 'tc-llm-txt-v2';
    const CACHE_TS  = 'tc-llm-txt-v2-ts';
    const TTL       = 60 * 60 * 1000; // 1 hour
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const ts     = Number(localStorage.getItem(CACHE_TS) || 0);
      if (cached && Date.now() - ts < TTL) {
        this.cfg.kb = cached;
        return;
      }
      const res = await fetch('/llm.txt', { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        this.cfg.kb = text;
        try {
          localStorage.setItem(CACHE_KEY, text);
          localStorage.setItem(CACHE_TS, String(Date.now()));
        } catch { /* storage full — just use in-memory */ }
      }
    } catch { /* network unavailable — keep DEFAULT_KB */ }
  }

  private async _checkWebGPU(): Promise<boolean> {
    try {
      if (!('gpu' in navigator)) return false;
      return !!(await (navigator as any).gpu.requestAdapter());
    } catch { return false; }
  }

  private async _loadLocal() {
    this._setStatus('Loading local model…', 'loading');
    if (this.dlBar) this.dlBar.style.display = 'block';
    try {
      const webllm = await import(/* @vite-ignore */ WEBLLM_CDN);
      this.engine = await webllm.CreateMLCEngine(this.cfg.webllmModel, {
        initProgressCallback: (p: any) => {
          const pct = Math.round((p.progress || 0) * 100);
          if (this.dlFill) this.dlFill.style.width = `${pct}%`;
          if (this.dlPct)  this.dlPct.textContent  = `${pct}%`;
          this._setStatus(`Loading ${pct}%`, 'loading');
        },
      });
      this.useLocal = true;
      if (this.dlBar) this.dlBar.style.display = 'none';
      this._setReady('Local · no API key');
    } catch (e) {
      console.warn('TinyClaw WebLLM failed, using API fallback', e);
      if (this.dlBar) this.dlBar.style.display = 'none';
      this._setReady();
    }
  }

  private _setReady(label = 'Ready') {
    this._setStatus(label, 'ready');
    this.ready = true;
    this.bubbleBtn?.classList.add('tc-ready');
    if (this.inputEl) this.inputEl.disabled = false;
    if (this.sendBtn) this.sendBtn.disabled = false;
    if (!this._restoreHistory()) {
      this._addMsg('assistant', this.cfg.greeting);
      this._addSuggestions();
    }
  }

  private _newChat() {
    this.history = [];
    sessionStorage.removeItem('tc-history');
    if (this.messagesEl) this.messagesEl.innerHTML = '';
    this._suggestionsEl = null;
    this._addMsg('assistant', this.cfg.greeting);
    this._addSuggestions();
  }

  private _saveHistory() {
    try {
      sessionStorage.setItem('tc-history', JSON.stringify(this.history));
    } catch { /* quota exceeded — ignore */ }
  }

  private _restoreHistory(): boolean {
    try {
      const raw = sessionStorage.getItem('tc-history');
      if (!raw) return false;
      const msgs: Message[] = JSON.parse(raw);
      if (!msgs.length) return false;
      this.history = msgs;
      msgs.forEach(m => this._addMsg(m.role, m.content));
      this._scroll();
      return true;
    } catch { return false; }
  }

  private _suggestionsEl: HTMLElement | null = null;

  private _addSuggestions() {
    const questions = [
      'What is VibeClaw?',
      'How does Sandbox mode work?',
      'What are Flavours?',
      'What is Live Gateway mode?',
      'Tell me about ClawForge',
      'How do I get an API key?',
      'Is my API key safe?',
      'What models are supported?',
    ];
    const wrap = document.createElement('div');
    wrap.className = 'tc-suggestions';
    questions.forEach(q => {
      const chip = document.createElement('button');
      chip.className = 'tc-chip';
      chip.textContent = q;
      chip.addEventListener('click', () => {
        this._removeSuggestions();
        if (this.inputEl) this.inputEl.value = q;
        this._send();
      });
      wrap.appendChild(chip);
    });
    this._suggestionsEl = wrap;
    this.messagesEl?.appendChild(wrap);
    this._scroll();
  }

  private _removeSuggestions() {
    if (this._suggestionsEl) {
      this._suggestionsEl.style.opacity = '0';
      this._suggestionsEl.style.transition = 'opacity 0.2s ease';
      setTimeout(() => this._suggestionsEl?.remove(), 200);
      this._suggestionsEl = null;
    }
  }

  private _setStatus(label: string, state: 'ready' | 'loading' | false = false) {
    if (this.headerLabel) this.headerLabel.textContent = label;
    if (this.headerDot)   this.headerDot.className = 'tc-header-dot' + (state ? ` ${state}` : '');
    if (this.badge)       this.badge.className = 'tc-status-badge' + (state ? ` ${state}` : '');
  }

  private _toggle() { this.win?.classList.contains('tc-open') ? this._close() : this.open(); }
  private _close()  { this.win?.classList.remove('tc-open'); localStorage.setItem('tc-open','0'); }

  private _addMsg(role: 'user' | 'assistant', text: string): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = `tc-msg ${role === 'user' ? 'tc-user' : 'tc-bot'}`;
    const bubble = document.createElement('div');
    bubble.className = 'tc-msg-bubble';
    if (role === 'assistant' && text) {
      bubble.innerHTML = marked.parse(text) as string;
    } else {
      bubble.textContent = text;
    }
    wrap.appendChild(bubble);
    this.messagesEl?.appendChild(wrap);
    this._scroll();
    return bubble;
  }

  private _renderMarkdown(bubble: HTMLElement, text: string) {
    bubble.innerHTML = marked.parse(text) as string;
  }

  private _showTyping(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'tc-typing-wrap';
    el.innerHTML = '<span class="tc-thinking-label">Thinking</span><span></span><span></span><span></span>';
    this.messagesEl?.appendChild(el);
    this._scroll();
    return el;
  }

  private _scroll() {
    if (this.messagesEl) this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  private async _send() {
    const text = this.inputEl?.value?.trim();
    if (!text || !this.ready) return;
    this._removeSuggestions();
    if (this.inputEl) this.inputEl.value = '';
    if (this.inputEl) this.inputEl.disabled = true;
    if (this.sendBtn) this.sendBtn.disabled = true;

    this._addMsg('user', text);
    this.history.push({ role: 'user', content: text });
    const typing = this._showTyping();

    try {
      this.useLocal && this.engine
        ? await this._chatLocal(typing)
        : await this._chatRemote(typing);
    } catch {
      typing.remove();
      this._addMsg('assistant', 'Sorry, something went wrong. Please try again!');
      this.history.pop();
    }

    this._saveHistory();
    if (this.inputEl) { this.inputEl.disabled = false; this.inputEl.focus(); }
    if (this.sendBtn) this.sendBtn.disabled = false;
  }

  private async _chatLocal(typing: HTMLElement) {
    const messages = [
      { role: 'system', content: DEFAULT_SYSTEM(this.cfg.kb) },
      ...this.history,
    ];
    typing.remove();
    const bubble = this._addMsg('assistant', '');
    let full = '';
    const stream = await this.engine.chat.completions.create({ messages, stream: true });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) { full += delta; bubble.textContent = full; this._scroll(); }
    }
    this._renderMarkdown(bubble, full);
    this._scroll();
    this.history.push({ role: 'assistant', content: full });
  }

  private async _chatRemote(typing: HTMLElement) {
    const key = this.cfg.apiKey || localStorage.getItem('tc-api-key') || '';
    if (!key) { typing.remove(); this._showKeyPrompt(); this.history.pop(); return; }

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': this.cfg.openRouterReferer,
        'X-Title': 'VibeClaw Clawdio',
      },
      body: JSON.stringify({
        model: this.cfg.model,
        messages: [{ role: 'system', content: DEFAULT_SYSTEM(this.cfg.kb) }, ...this.history],
        stream: true,
      }),
    });
    if (!resp.ok) throw new Error(`API ${resp.status}`);

    typing.remove();
    const bubble = this._addMsg('assistant', '');
    const reader = resp.body!.getReader();
    const dec = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of dec.decode(value).split('\n')) {
        if (!line.startsWith('data:')) continue;
        const d = line.slice(5).trim();
        if (d === '[DONE]') break;
        try {
          const delta = JSON.parse(d).choices?.[0]?.delta?.content;
          if (delta) { full += delta; bubble.textContent = full; this._scroll(); }
        } catch {}
      }
    }
    this._renderMarkdown(bubble, full);
    this._scroll();
    this.history.push({ role: 'assistant', content: full });
  }

  private _showKeyPrompt() {
    const el = document.createElement('div');
    el.className = 'tc-msg tc-bot';
    el.innerHTML = `<div class="tc-msg-bubble" style="background:#161616;border:1px solid #222;border-bottom-left-radius:4px;color:#999;font-size:0.82rem;line-height:1.55;max-width:280px;">
      WebGPU not available. Add an <a href="https://openrouter.ai" target="_blank" style="color:${this.cfg.accent};text-decoration:none;">OpenRouter</a> key:
      <div style="display:flex;margin-top:10px;border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;">
        <input placeholder="sk-or-..." class="tc-key-inp" style="flex:1;background:#0a0a0a;border:none;padding:9px 11px;color:#ccc;font-size:0.8rem;font-family:DM Sans,system-ui,sans-serif;outline:none;">
        <button class="tc-key-ok" style="background:${this.cfg.accent};border:none;color:#000;padding:0 14px;cursor:pointer;font-weight:700;font-size:0.75rem;font-family:DM Sans,system-ui,sans-serif;">SAVE</button>
      </div>
    </div>`;
    this.messagesEl?.appendChild(el);
    this._scroll();
    el.querySelector('.tc-key-ok')?.addEventListener('click', () => {
      const val = (el.querySelector('.tc-key-inp') as HTMLInputElement)?.value?.trim();
      if (val) {
        this.setApiKey(val);
        el.remove();
        this._addMsg('assistant', 'Key saved! What would you like to know? 🦞');
        if (this.inputEl) { this.inputEl.disabled = false; this.inputEl.focus(); }
        if (this.sendBtn) this.sendBtn.disabled = false;
      }
    });
  }
}
