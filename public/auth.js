// ============================================
// VibeClaw Auth — Netlify Identity wrapper
// Shared across all pages
// ============================================

const AUTH_WIDGET_URL = 'https://identity.netlify.com/v1/netlify-identity-widget.js';

// Ensure the Identity widget modal renders above everything
const authStyles = document.createElement('style');
authStyles.textContent = `
  .netlifyIdentityButton,
  .netlify-identity-signup,
  .netlify-identity-login,
  .netlify-identity-widget,
  .netlify-identity-menu,
  [class*="netlify-identity"],
  [data-netlify-identity-menu],
  [data-netlify-identity-button] {
    z-index: 2147483647 !important;
    position: relative !important;
  }
  /* The widget creates a React root div with inline background-color — target specifically */
  div[style*="position: fixed"][style*="background-color"],
  div[style*="position:fixed"][style*="background-color"] {
    z-index: 2147483647 !important;
  }
  /* Ensure modal and close button are visible above everything */
  .netlify-identity-modal {
    z-index: 2147483647 !important;
  }
  .netlify-identity-modal *[class*="close"],
  .netlify-identity-modal *[class*="Close"],
  .netlify-identity-modal button[aria-label="close"],
  .netlify-identity-modal button[aria-label="Close"],
  .netlify-identity-modal button[type="button"],
  .netlify-identity-modal svg {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    cursor: pointer !important;
    z-index: 100000 !important;
  }
  .netlify-identity-modal button,
  .netlify-identity-modal *[role="button"] {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  /* Target absolute positioned buttons (likely close buttons) */
  .netlify-identity-modal button[style*="position"],
  .netlify-identity-modal > div > button,
  .netlify-identity-modal > button {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    cursor: pointer !important;
    z-index: 100000 !important;
    position: absolute !important;
    top: 12px !important;
    right: 12px !important;
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(255, 255, 255, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 6px !important;
    color: #fff !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .netlify-identity-modal button svg {
    width: 20px !important;
    height: 20px !important;
    stroke-width: 2 !important;
  }
  .netlify-identity-modal *[class*="close"]:hover,
  .netlify-identity-modal *[class*="Close"]:hover,
  .netlify-identity-modal button[aria-label="close"]:hover,
  .netlify-identity-modal button[aria-label="Close"]:hover,
  .netlify-identity-modal button[style*="position"]:hover {
    background: rgba(255, 92, 92, 0.4) !important;
    border-color: rgba(255, 92, 92, 0.6) !important;
  }
  /* Mobile-specific styles */
  @media (max-width: 600px) {
    .netlify-identity-modal button[style*="position"],
    .netlify-identity-modal > div > button,
    .netlify-identity-modal > button {
      top: 8px !important;
      right: 8px !important;
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      min-height: 40px !important;
      background: rgba(255, 255, 255, 0.2) !important;
      border: 2px solid rgba(255, 255, 255, 0.4) !important;
    }
    .netlify-identity-modal button svg {
      width: 22px !important;
      height: 22px !important;
    }
  }
  @media (max-width: 380px) {
    .netlify-identity-modal button[style*="position"],
    .netlify-identity-modal > div > button,
    .netlify-identity-modal > button {
      width: 44px !important;
      height: 44px !important;
      min-width: 44px !important;
      min-height: 44px !important;
    }
    .netlify-identity-modal button svg {
      width: 24px !important;
      height: 24px !important;
    }
  }
`;
document.head.appendChild(authStyles);

// Load the Netlify Identity widget script
function loadWidget() {
  return new Promise((resolve, reject) => {
    if (window.netlifyIdentity) return resolve(window.netlifyIdentity);
    const script = document.createElement('script');
    script.src = AUTH_WIDGET_URL;
    script.onload = () => resolve(window.netlifyIdentity);
    script.onerror = () => reject(new Error('Failed to load auth widget'));
    document.head.appendChild(script);
  });
}

// Current user state
let _user = null;
let _listeners = [];

function notify() {
  _listeners.forEach(fn => fn(_user));
}

// Public API
const VibeclawAuth = {
  // Initialize auth — call once per page
  async init() {
    const identity = await loadWidget();
    identity.on('init', user => {
      _user = user;
      notify();
    });
    identity.on('login', user => {
      _user = user;
      notify();
      identity.close();
    });
    identity.on('logout', () => {
      _user = null;
      notify();
    });
    identity.init();

    // Add escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.netlifyIdentity) {
        window.netlifyIdentity.close();
      }
    });

    // Add click outside to close modal
    document.addEventListener('click', (e) => {
      const modal = document.querySelector('.netlify-identity-modal');
      if (modal && !modal.contains(e.target)) {
        // Check if click is outside modal content
        const modalContent = modal.querySelector('[role="dialog"], .netlify-identity-modal-content');
        if (modalContent && !modalContent.contains(e.target)) {
          if (window.netlifyIdentity) {
            window.netlifyIdentity.close();
          }
        }
      }
    });

    return identity;
  },

  // Get current user (null if not logged in)
  getUser() {
    return _user;
  },

  // Subscribe to auth changes
  onChange(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(f => f !== fn); };
  },

  // Open login dialog
  login() {
    if (window.netlifyIdentity) window.netlifyIdentity.open('login');
  },

  // Open signup dialog
  signup() {
    if (window.netlifyIdentity) window.netlifyIdentity.open('signup');
  },

  // Logout
  logout() {
    if (window.netlifyIdentity) window.netlifyIdentity.logout();
  },

  // Get JWT token (for API calls)
  async getToken() {
    if (!_user) return null;
    try {
      const token = await _user.jwt();
      return token;
    } catch {
      return null;
    }
  },

  // User display info
  getUserInfo() {
    if (!_user) return null;
    const meta = _user.user_metadata || {};
    return {
      id: _user.id,
      email: _user.email,
      name: meta.full_name || meta.name || _user.email.split('@')[0],
      avatar: meta.avatar_url || null,
      provider: _user.app_metadata?.provider || 'email',
    };
  },

  // Render the auth button into a container
  renderButton(container) {
    if (typeof container === 'string') container = document.getElementById(container);
    if (!container) return;

    let isModalOpen = false;

    function updateButtonState() {
      const info = VibeclawAuth.getUserInfo();
      if (info) {
        // Logged in state
        const avatarHtml = info.avatar
          ? `<img src="${info.avatar}" alt="" style="width:20px;height:20px;border-radius:50%;object-fit:cover;">`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/></svg>`;

        container.innerHTML = `
          <div class="auth-user" style="display:flex;align-items:center;gap:8px;cursor:pointer;" title="Signed in as ${info.email}">
            <span class="auth-avatar" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:rgba(255,92,92,0.06);border:1px solid rgba(255,92,92,0.15);overflow:hidden;">${avatarHtml}</span>
            <span class="auth-name" style="font-family:var(--mono,'Fragment Mono',monospace);font-size:0.7rem;color:var(--text-bright,#e0e0e0);">${esc(info.name)}</span>
            <button class="auth-logout-btn" style="background:none;border:1px solid var(--border,#2a2a2a);border-radius:4px;padding:2px 8px;font-family:var(--mono,'Fragment Mono',monospace);font-size:0.6rem;color:var(--text-dim,#666);cursor:pointer;">Sign out</button>
          </div>`;
        container.querySelector('.auth-logout-btn').addEventListener('click', e => {
          e.stopPropagation();
          VibeclawAuth.logout();
        });
      } else if (isModalOpen) {
        // Modal is open - show close button
        container.innerHTML = `
          <button class="auth-close-btn" style="background:none;border:1px solid var(--accent,#ff5c5c);border-radius:6px;padding:3px 8px;font-family:var(--mono,'Fragment Mono',monospace);font-size:0.62rem;color:var(--accent,#ff5c5c);cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.15s;white-space:nowrap;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:10px;height:10px;flex-shrink:0;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span class="auth-text">Close</span>
          </button>`;
        const closeBtn = container.querySelector('.auth-close-btn');
        closeBtn.addEventListener('click', () => {
          if (window.netlifyIdentity) {
            window.netlifyIdentity.close();
          }
        });
        closeBtn.addEventListener('mouseenter', () => {
          closeBtn.style.background = 'rgba(255, 92, 92, 0.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
          closeBtn.style.background = 'none';
        });
      } else {
        // Modal is closed - show sign in button
        container.innerHTML = `
          <button class="auth-login-btn" style="background:none;border:1px solid var(--border,#2a2a2a);border-radius:6px;padding:3px 8px;font-family:var(--mono,'Fragment Mono',monospace);font-size:0.62rem;color:var(--text-dim,#999);cursor:pointer;display:flex;align-items:center;gap:4px;transition:all 0.15s;white-space:nowrap;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:10px;height:10px;flex-shrink:0;"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/></svg>
            <span class="auth-text">Sign in</span>
          </button>`;
        const loginBtn = container.querySelector('.auth-login-btn');
        loginBtn.addEventListener('click', () => {
          if (window.netlifyIdentity) {
            window.netlifyIdentity.open('login');
            isModalOpen = true;
            updateButtonState();
          }
        });
        loginBtn.addEventListener('mouseenter', () => {
          loginBtn.style.borderColor = 'var(--accent,#ff5c5c)';
          loginBtn.style.color = 'var(--accent,#ff5c5c)';
        });
        loginBtn.addEventListener('mouseleave', () => {
          loginBtn.style.borderColor = 'var(--border,#2a2a2a)';
          loginBtn.style.color = 'var(--text-dim,#999)';
        });
      }
    }

    function update(user) {
      updateButtonState();
    }

    // Listen for modal open/close events from Netlify Identity
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('open', () => {
        isModalOpen = true;
        updateButtonState();
      });
      window.netlifyIdentity.on('close', () => {
        isModalOpen = false;
        updateButtonState();
      });
    }

    VibeclawAuth.onChange(update);
    update(_user);
  },
};

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ── API Client (authenticated) ──
const VibeclawAPI = {
  async _fetch(path, opts = {}) {
    const token = await VibeclawAuth.getToken();
    if (!token) throw new Error('Not authenticated');
    const resp = await fetch('/api/' + path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        ...(opts.headers || {}),
      },
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `API error ${resp.status}`);
    }
    return resp.json();
  },

  // User profile
  getProfile() { return this._fetch('profile'); },

  // Servers (forge configs)
  getServers() { return this._fetch('servers').then(r => r.servers); },

  saveServer(data) {
    return this._fetch('servers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteServer(id) {
    return this._fetch('servers/' + id, { method: 'DELETE' });
  },
};

// Export for module use or attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VibeclawAuth, VibeclawAPI };
} else {
  window.VibeclawAuth = VibeclawAuth;
  window.VibeclawAPI = VibeclawAPI;
}
