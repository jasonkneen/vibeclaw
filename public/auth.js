// ============================================
// VibeClaw Auth — Netlify Identity wrapper
// Shared across all pages
// ============================================

const AUTH_WIDGET_URL = 'https://identity.netlify.com/v1/netlify-identity-widget.js';

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

    function update(user) {
      const info = VibeclawAuth.getUserInfo();
      if (info) {
        const avatarHtml = info.avatar
          ? `<img src="${info.avatar}" alt="" style="width:20px;height:20px;border-radius:50%;object-fit:cover;">`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/></svg>`;

        container.innerHTML = `
          <div class="auth-user" style="display:flex;align-items:center;gap:8px;cursor:pointer;" title="Signed in as ${info.email}">
            <span class="auth-avatar" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:rgba(255,92,92,0.06);border:1px solid rgba(255,92,92,0.15);overflow:hidden;">${avatarHtml}</span>
            <span class="auth-name" style="font-family:var(--mono,'IBM Plex Mono',monospace);font-size:0.7rem;color:var(--text-bright,#e0e0e0);">${esc(info.name)}</span>
            <button class="auth-logout-btn" style="background:none;border:1px solid var(--border,#2a2a2a);border-radius:4px;padding:2px 8px;font-family:var(--mono,'IBM Plex Mono',monospace);font-size:0.6rem;color:var(--text-dim,#666);cursor:pointer;">Sign out</button>
          </div>`;
        container.querySelector('.auth-logout-btn').addEventListener('click', e => {
          e.stopPropagation();
          VibeclawAuth.logout();
        });
      } else {
        container.innerHTML = `
          <button class="auth-login-btn" style="background:none;border:1px solid var(--border,#2a2a2a);border-radius:6px;padding:4px 12px;font-family:var(--mono,'IBM Plex Mono',monospace);font-size:0.7rem;color:var(--text-dim,#999);cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.15s;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:12px;height:12px;"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/></svg>
            Sign in
          </button>`;
        const btn = container.querySelector('.auth-login-btn');
        btn.addEventListener('click', () => VibeclawAuth.login());
        btn.addEventListener('mouseenter', () => {
          btn.style.borderColor = 'var(--accent,#ff5c5c)';
          btn.style.color = 'var(--accent,#ff5c5c)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.borderColor = 'var(--border,#2a2a2a)';
          btn.style.color = 'var(--text-dim,#999)';
        });
      }
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

// Export for module use or attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VibeclawAuth;
} else {
  window.VibeclawAuth = VibeclawAuth;
}
