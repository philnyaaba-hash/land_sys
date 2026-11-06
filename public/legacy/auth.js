/* LandLedger — workspace authentication and role-based access */
'use strict';

const Auth = (function () {
  let user = null;
  let callbacks = {};
  let signingIn = false;

  function initials(name) {
    const parts = String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]).join('').toUpperCase() || '?';
  }

  function applySession(payload) {
    if (!payload || !payload.user) return null;
    const access = payload.access || {};
    user = {
      id: access.visual || 'viewer',
      roleKey: access.key || '',
      name: payload.user.name || payload.user.email,
      email: payload.user.email,
      label: access.label || 'Member',
      summary: access.summary || '',
      initials: initials(payload.user.name),
      permissions: access.permissions || [],
      officePanels: access.officePanels || []
    };
    document.body.dataset.role = user.id;
    return user;
  }

  async function fetchSession() {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { accept: 'application/json' }
      });
      if (!response.ok) return null;
      return applySession(await response.json());
    } catch (err) {
      return null;
    }
  }

  async function restore() {
    return fetchSession();
  }

  async function signIn(email, password) {
    if (signingIn) return { error: 'A sign-in is already in progress.' };
    signingIn = true;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return { error: result.error || 'Sign in failed (' + response.status + ').' };
      const restored = await fetchSession();
      if (!restored) return { error: 'Signed in, but your session could not be loaded. Refresh the page.' };
      hideLogin();
      if (callbacks.onLogin) callbacks.onLogin(user);
      return { ok: true };
    } catch (err) {
      return { error: 'Cannot reach the server. Check your connection and try again.' };
    } finally {
      signingIn = false;
    }
  }

  function logout() {
    user = null;
    document.body.removeAttribute('data-role');
    fetch('/api/auth/session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    if (callbacks.onLogout) callbacks.onLogout();
    showLogin();
    return true;
  }

  function user_() {
    return user;
  }

  function isAuthenticated() {
    return Boolean(user);
  }

  function can(permission) {
    if (!user) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  }

  function canRoute(route) {
    if (!user) return false;
    if (route.indexOf('office-') === 0) {
      const panel = typeof OFFICE_ROUTES !== 'undefined' ? OFFICE_ROUTES[route] : '';
      return Boolean(panel) && user.officePanels.includes(panel);
    }
    if (route === 'settings') return can('settings.view');
    if (route === 'accounting') return can('accounting.view');
    if (route === 'finance' || route.indexOf('finance-') === 0) return can('finance.view');
    if (route === 'staff') return can('staff.view');
    if (route === 'leads') return can('leads.view');
    if (route === 'tasks') return can('tasks.view');
    if (route === 'reports') return can('reports.view');
    if (route === 'documents') return can('estateDocs.view');
    if (route === 'maintenance') return can('maintenance.view');
    if (route === 'complaints') return can('complaints.view');
    if (route === 'sales' || route === 'receipts' || route === 'buyers') {
      return can('sales.create') || can('payments.record') || can('buyers.manage') || can('accounting.view');
    }
    if (route === 'map' || route === 'plots') {
      return can('plots.manage') || can('accounting.view') || can('reports.view');
    }
    return true;
  }

  function init(opts) {
    callbacks = opts || {};
  }

  function loginScreenHTML() {
    return '<main class="login-screen" id="loginScreen">' +
      '<section class="login-brand" aria-labelledby="loginTitle">' +
        '<div class="login-brand-top">' +
          '<img class="login-logo" src="assets/brand-logo.jpg" alt="Land Pro Premium Properties logo">' +
        '</div>' +
        '<div class="login-hero">' +
          '<span class="login-eyebrow">LandLedger · Ghana</span>' +
          '<h1 id="loginTitle">Land, managed with confidence.</h1>' +
          '<p>Every plot, buyer, payment and receipt in one calm workspace. Sign in to open the tools your role allows.</p>' +
        '</div>' +
        '<div class="login-points">' +
          '<div class="login-point"><span>' + icon('plots', 18) + '</span><div><strong>Live plot register</strong><small>Available, reserved and sold plots at a glance.</small></div></div>' +
          '<div class="login-point"><span>' + icon('receipts', 18) + '</span><div><strong>Receipts that write themselves</strong><small>Issue and share receipts on every sale.</small></div></div>' +
          '<div class="login-point"><span>' + icon('shield', 18) + '</span><div><strong>Role-based access</strong><small>Every person sees only the records and office tools they need.</small></div></div>' +
        '</div>' +
        '<div class="login-brand-foot"><span class="dot-online"></span> Secure workspace · Access follows your role</div>' +
      '</section>' +
      '<section class="login-panel" aria-labelledby="loginCardTitle">' +
        '<div class="login-card">' +
          '<div class="login-card-head">' +
            '<span class="badge info">Secure sign in</span>' +
            '<h2 id="loginCardTitle">Sign in to LandLedger</h2>' +
            '<p>Use the account your administrator created. Your role decides which pages and office tools you can open.</p>' +
          '</div>' +
          '<form class="login-form" id="loginForm">' +
            '<label>Email address<input name="email" type="email" autocomplete="username" inputmode="email" required maxlength="254"></label>' +
            '<label>Password<input name="password" type="password" autocomplete="current-password" required maxlength="200"></label>' +
            '<p class="login-error" id="loginError" role="alert" hidden></p>' +
            '<button type="submit" class="login-submit">Sign in</button>' +
          '</form>' +
          '<p class="login-note">' + icon('shield', 14) + ' Forgot your password? Ask an organization administrator to reset it.</p>' +
        '</div>' +
      '</section>' +
    '</main>';
  }

  async function submitLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(form.elements.email.value || '').trim();
    const password = String(form.elements.password.value || '');
    const error = document.getElementById('loginError');
    const button = form.querySelector('button[type="submit"]');

    function showError(message) {
      if (!error) return;
      error.textContent = message;
      error.hidden = false;
    }

    if (!email || !password) {
      showError('Enter your email address and password.');
      return;
    }
    if (error) error.hidden = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Signing in…';
    }
    const result = await signIn(email, password);
    if (!result.ok) {
      if (button) {
        button.disabled = false;
        button.textContent = 'Sign in';
      }
      showError(result.error);
    }
  }

  function showLogin() {
    document.body.classList.add('auth-locked');
    document.body.removeAttribute('data-role');
    const root = document.getElementById('loginRoot');
    if (!root) return;
    root.innerHTML = loginScreenHTML();
    document.title = 'Sign in — LandLedger';
    const form = root.querySelector('#loginForm');
    if (form) form.addEventListener('submit', submitLogin);
    const email = root.querySelector('input[name="email"]');
    if (email) {
      setTimeout(() => {
        try { email.focus(); } catch (err) { /* Focus is a convenience. */ }
      }, 40);
    }
  }

  function showChecking() {
    document.body.classList.add('auth-locked');
    document.body.removeAttribute('data-role');
    const root = document.getElementById('loginRoot');
    if (!root) return;
    root.innerHTML = '<main class="login-screen login-checking"><div class="login-checking-card" role="status"><span class="login-spinner"></span><p>Restoring your session…</p></div></main>';
    document.title = 'Signing in — LandLedger';
  }

  function hideLogin() {
    document.body.classList.remove('auth-locked');
    const root = document.getElementById('loginRoot');
    if (root) root.innerHTML = '';
  }

  return {
    init,
    restore,
    signIn,
    logout,
    showLogin,
    showChecking,
    hideLogin,
    user: user_,
    isAuthenticated,
    can,
    canRoute
  };
})();

function can(permission) {
  return Auth.can(permission);
}

function canRoute(route) {
  return Auth.canRoute(route);
}

function requirePermission(permission) {
  if (can(permission)) return true;
  toast('Your role does not allow that action.', 'warn');
  return false;
}
