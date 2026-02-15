// ============================================
// VibeClaw Feature Flags + Pro Tier
// ?preview=true enables preview features
// ============================================

const VibeclawFeatures = (() => {
  // Check for ?preview=true — persist in sessionStorage so it survives page navs
  const params = new URLSearchParams(window.location.search);
  if (params.get('preview') === 'true') {
    sessionStorage.setItem('vibeclaw-preview', '1');
  }
  const previewMode = sessionStorage.getItem('vibeclaw-preview') === '1';

  // Pro status — check from auth user metadata or localStorage cache
  let _isPro = false;
  let _proListeners = [];

  function notifyPro() {
    _proListeners.forEach(fn => fn(_isPro));
  }

  return {
    // Is preview mode active?
    isPreview() {
      return previewMode;
    },

    // Is user a Pro subscriber?
    isPro() {
      return _isPro;
    },

    // Set pro status (called from auth check or webhook)
    setPro(val) {
      _isPro = !!val;
      localStorage.setItem('vibeclaw-pro', _isPro ? '1' : '0');
      notifyPro();
    },

    // Listen for pro status changes
    onProChange(fn) {
      _proListeners.push(fn);
      return () => { _proListeners = _proListeners.filter(f => f !== fn); };
    },

    // Check pro status from server (call after auth init)
    async checkPro() {
      try {
        const token = await VibeclawAuth.getToken();
        if (!token) {
          this.setPro(false);
          return false;
        }
        const resp = await fetch('/api/subscription', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (resp.ok) {
          const data = await resp.json();
          this.setPro(data.active);
          return data.active;
        }
      } catch {}
      // Fallback to cached
      this.setPro(localStorage.getItem('vibeclaw-pro') === '1');
      return _isPro;
    },

    // Get list of models user can access
    getAvailableModels() {
      const freeModels = [
        { id: 'upstage/solar-pro-3:free', name: 'Solar Pro 3', provider: 'Upstage', free: true },
        { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', provider: 'Meta', free: true },
        { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 4B', provider: 'Google', free: true },
        { id: 'qwen/qwen3-8b:free', name: 'Qwen3 8B', provider: 'Alibaba', free: true },
        { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1', provider: 'DeepSeek', free: true },
        { id: 'microsoft/phi-4-reasoning:free', name: 'Phi 4 Reasoning', provider: 'Microsoft', free: true },
        { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', provider: 'Mistral AI', free: true },
      ];

      const proModels = [
        { id: 'anthropic/claude-opus-4.6', name: 'Claude Opus 4.6', provider: 'Anthropic', free: false, badge: 'PRO' },
        { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', free: false, badge: 'PRO' },
        { id: 'openai/gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', free: false, badge: 'PRO' },
        { id: 'openai/o3', name: 'o3', provider: 'OpenAI', free: false, badge: 'PRO' },
        { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'Google', free: false, badge: 'PRO' },
      ];

      if (_isPro || previewMode) {
        return [...freeModels, ...proModels];
      }
      return freeModels;
    },

    // Open Lemon Squeezy checkout
    openCheckout() {
      // TODO: Replace with actual Lemon Squeezy store URL when account is created
      const CHECKOUT_URL = 'https://vibeclaw.lemonsqueezy.com/checkout/buy/PRODUCT_ID';
      
      // Pre-fill email if logged in
      const user = VibeclawAuth?.getUserInfo();
      let url = CHECKOUT_URL;
      if (user?.email) {
        url += '?checkout[email]=' + encodeURIComponent(user.email);
      }

      // Use Lemon Squeezy overlay if loaded, otherwise redirect
      if (window.LemonSqueezy) {
        window.LemonSqueezy.Url.Open(url);
      } else {
        window.open(url, '_blank');
      }
    },

    // Render upgrade button (only in preview mode)
    renderUpgradeButton(container) {
      if (typeof container === 'string') container = document.getElementById(container);
      if (!container) return;
      if (!previewMode) { container.style.display = 'none'; return; }

      function update() {
        if (_isPro) {
          container.innerHTML = `
            <span class="pro-badge" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;background:linear-gradient(135deg,rgba(255,92,92,0.15),rgba(255,150,50,0.15));border:1px solid rgba(255,92,92,0.3);font-family:var(--mono,'Fragment Mono',monospace);font-size:0.65rem;color:var(--accent,#ff5c5c);letter-spacing:0.05em;text-transform:uppercase;">
              ⚡ Pro
            </span>`;
        } else {
          container.innerHTML = `
            <button class="upgrade-btn" style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:6px;background:linear-gradient(135deg,#ff5c5c,#ff8844);border:none;font-family:var(--mono,'Fragment Mono',monospace);font-size:0.65rem;color:#000;cursor:pointer;font-weight:600;letter-spacing:0.03em;transition:all 0.15s;text-transform:uppercase;">
              ⚡ Upgrade to Pro
            </button>`;
          const btn = container.querySelector('.upgrade-btn');
          btn.addEventListener('click', () => VibeclawFeatures.openCheckout());
          btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.03)'; btn.style.boxShadow = '0 0 15px rgba(255,92,92,0.3)'; });
          btn.addEventListener('mouseleave', () => { btn.style.transform = ''; btn.style.boxShadow = ''; });
        }
      }

      VibeclawFeatures.onProChange(update);
      update();
    },

    // Render pricing card (for inline upsell)
    renderPricingUpsell(container) {
      if (typeof container === 'string') container = document.getElementById(container);
      if (!container || !previewMode || _isPro) { if(container) container.style.display = 'none'; return; }

      container.innerHTML = `
        <div style="border:1px solid rgba(255,92,92,0.2);border-radius:10px;padding:20px;background:linear-gradient(135deg,rgba(255,92,92,0.04),rgba(255,150,50,0.04));margin:16px 0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:1.2rem;">⚡</span>
            <span style="font-family:var(--mono);font-size:0.85rem;font-weight:700;color:var(--text-bright);">VibeClaw Pro</span>
            <span style="font-family:var(--mono);font-size:0.75rem;color:var(--accent);">$20/mo</span>
          </div>
          <ul style="list-style:none;padding:0;margin:0 0 12px;font-size:0.75rem;color:var(--text);line-height:1.8;">
            <li>✅ Claude Sonnet 4, GPT-4o, Gemini Pro</li>
            <li>✅ Cloud sync — access servers anywhere</li>
            <li>✅ Unlimited sandbox messages</li>
            <li>✅ Priority support</li>
          </ul>
          <button class="pricing-upgrade-btn" style="width:100%;padding:10px;border-radius:6px;background:linear-gradient(135deg,#ff5c5c,#ff8844);border:none;font-family:var(--mono);font-size:0.75rem;color:#000;cursor:pointer;font-weight:600;transition:all 0.15s;">
            Upgrade Now
          </button>
        </div>`;
      container.querySelector('.pricing-upgrade-btn').addEventListener('click', () => VibeclawFeatures.openCheckout());
    }
  };
})();

// Load Lemon Squeezy JS (lightweight, only in preview mode)
if (VibeclawFeatures.isPreview()) {
  const ls = document.createElement('script');
  ls.src = 'https://assets.lemonsqueezy.com/lemon.js';
  ls.defer = true;
  document.head.appendChild(ls);
}

// Attach to window
window.VibeclawFeatures = VibeclawFeatures;
