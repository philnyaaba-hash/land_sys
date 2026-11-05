/* LandLedger — demo authentication and role-based access */
'use strict';

const AUTH_KEY = 'landledger.session.v1';
const LAST_ROLE_KEY = 'landledger.auth.lastRole.v1';

const ROLE_DEFS = [
  {
    id: 'admin',
    name: 'Ama Mensah',
    label: 'Administrator',
    initials: 'AM',
    summary: 'Full access to records, settings, data tools and workspace controls.',
    permissions: ['*']
  },
  {
    id: 'manager',
    name: 'Kofi Asante',
    label: 'Manager',
    initials: 'KA',
    summary: 'Run operations, manage staff, leads, tasks, plots, buyers, documents and maintenance, and export backups.',
    permissions: [
      'sales.create', 'sales.void', 'payments.record', 'buyers.manage', 'buyers.delete',
      'plots.manage', 'reminders.send', 'messages.send', 'documents.manage',
      'settings.view', 'settings.edit', 'data.export', 'accounting.view', 'expenses.manage',
      'finance.view', 'finance.manage',
      'staff.view', 'staff.manage',
      'leads.view', 'leads.manage', 'tasks.view', 'tasks.manage', 'reports.view',
      'estateDocs.view', 'estateDocs.manage', 'maintenance.view', 'maintenance.manage',
      'complaints.view', 'complaints.manage'
    ]
  },
  {
    id: 'sales',
    name: 'Efua Owusu',
    label: 'Sales agent',
    initials: 'EO',
    summary: 'Sell plots, manage buyer and lead records, schedule follow-ups and review reports.',
    permissions: [
      'sales.create', 'payments.record', 'buyers.manage', 'reminders.send',
      'messages.send', 'documents.manage', 'accounting.view', 'finance.view',
      'leads.view', 'leads.manage', 'tasks.view', 'tasks.manage', 'reports.view',
      'estateDocs.view', 'maintenance.view', 'complaints.view', 'complaints.manage'
    ]
  },
  {
    id: 'viewer',
    name: 'Nana Adjei',
    label: 'Viewer',
    initials: 'NA',
    summary: 'Read-only access to land, sales, leads, tasks, reports, documents and site issues.',
    permissions: ['accounting.view', 'finance.view', 'leads.view', 'tasks.view', 'reports.view', 'estateDocs.view', 'maintenance.view', 'complaints.view']
  }
];

const Auth = (function () {
  let session = readSession();
  let callbacks = {};
  let signingIn = false;
  let signTimer = null;

  function roleById(id) {
    return ROLE_DEFS.find((role) => role.id === id) || null;
  }

  function readLastRoleId() {
    try {
      const id = localStorage.getItem(LAST_ROLE_KEY) || '';
      return roleById(id) ? id : '';
    } catch (err) {
      return '';
    }
  }

  function rememberRole(id) {
    try {
      localStorage.setItem(LAST_ROLE_KEY, id);
    } catch (err) {
      /* Remembering the last role is a convenience, never a blocker. */
    }
  }

  function readSession() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !roleById(parsed.roleId)) return null;
      return { roleId: parsed.roleId, signedInAt: parsed.signedInAt || '' };
    } catch (err) {
      return null;
    }
  }

  function writeSession() {
    try {
      if (session) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      else localStorage.removeItem(AUTH_KEY);
    } catch (err) {
      /* A blocked storage write should not prevent demo sign-in. */
    }
  }

  function user() {
    return session ? roleById(session.roleId) : null;
  }

  function isAuthenticated() {
    return Boolean(user());
  }

  function can(permission) {
    const role = user();
    if (!role) return false;
    return role.permissions.includes('*') || role.permissions.includes(permission);
  }

  function canRoute(route) {
    if (!user()) return false;
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
    return true;
  }

  function init(opts) {
    callbacks = opts || {};
  }

  function cancelSignIn() {
    if (signTimer) {
      clearTimeout(signTimer);
      signTimer = null;
    }
    signingIn = false;
  }

  function login(roleId) {
    const role = roleById(roleId);
    if (!role || signingIn) return false;
    signingIn = true;

    const cards = Array.from(document.querySelectorAll('.role-card'));
    const chosen = cards.find((card) => card.dataset.role === role.id) || null;
    cards.forEach((card) => {
      if (card !== chosen) card.disabled = true;
    });
    if (chosen) {
      chosen.classList.add('is-signing-in');
      chosen.setAttribute('aria-busy', 'true');
    }
    const status = document.getElementById('loginStatus');
    if (status) status.textContent = 'Signing in as ' + role.name + ', ' + role.label + '.';

    const commit = () => {
      signTimer = null;
      signingIn = false;
      session = { roleId: role.id, signedInAt: new Date().toISOString() };
      writeSession();
      rememberRole(role.id);
      document.body.dataset.role = role.id;
      hideLogin();
      if (callbacks.onLogin) callbacks.onLogin(role);
    };

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) commit();
    else signTimer = setTimeout(commit, 420);
    return true;
  }

  function logout() {
    cancelSignIn();
    session = null;
    writeSession();
    document.body.removeAttribute('data-role');
    if (callbacks.onLogout) callbacks.onLogout();
    showLogin();
    return true;
  }

  function showLogin() {
    cancelSignIn();
    document.body.classList.add('auth-locked');
    document.body.removeAttribute('data-role');
    const root = document.getElementById('loginRoot');
    if (root) root.innerHTML = loginScreenHTML();
    document.title = 'Sign in — Land Management System';
    const target = root
      ? (root.querySelector('.role-card.is-recent') || root.querySelector('[data-action="demo-login"]'))
      : null;
    if (target) {
      setTimeout(() => {
        try { target.focus(); } catch (err) { /* ignore focus errors */ }
      }, 40);
    }
  }

  function hideLogin() {
    document.body.classList.remove('auth-locked');
    const root = document.getElementById('loginRoot');
    if (root) root.innerHTML = '';
  }

  function roleCardHTML(role, index) {
    const recent = readLastRoleId() === role.id;
    return '<button type="button" class="role-card' + (recent ? ' is-recent' : '') + '" data-action="demo-login" data-role="' + role.id + '" aria-keyshortcuts="' + (index + 1) + '">' +
      '<span class="role-avatar ' + role.id + '">' + esc(role.initials) + '</span>' +
      '<span class="role-copy">' +
        '<span class="role-name"><strong>' + esc(role.name) + '</strong><span class="role-badge ' + role.id + '">' + esc(role.label) + '</span>' +
          (recent ? '<span class="role-recent">' + icon('clock', 10) + 'Last used</span>' : '') +
        '</span>' +
        '<small>' + esc(role.summary) + '</small>' +
      '</span>' +
      '<span class="role-key" aria-hidden="true">' + (index + 1) + '</span>' +
      '<span class="role-spinner" aria-hidden="true"></span>' +
      '<span class="role-arrow" aria-hidden="true">' + icon('arrowRight', 16) + '</span>' +
    '</button>';
  }

  function loginScreenHTML() {
    return '<main class="login-screen" id="loginScreen">' +
      '<section class="login-brand" aria-labelledby="loginTitle">' +
        '<div class="login-brand-top">' +
          '<img class="login-logo" src="assets/brand-logo.jpg" alt="Land Pro Premium Properties logo">' +
        '</div>' +
        '<div class="login-hero">' +
          '<span class="login-eyebrow">Asante Ridge Estates · Ghana</span>' +
          '<h1 id="loginTitle">Land, managed with confidence.</h1>' +
          '<p>Every plot, buyer, payment and receipt in one calm workspace. Sign in with a demo role to explore the right level of access.</p>' +
        '</div>' +
        '<div class="login-points">' +
          '<div class="login-point"><span>' + icon('plots', 18) + '</span><div><strong>Live plot register</strong><small>Available, reserved and sold plots at a glance.</small></div></div>' +
          '<div class="login-point"><span>' + icon('receipts', 18) + '</span><div><strong>Receipts that write themselves</strong><small>Issue and share receipts on every sale.</small></div></div>' +
          '<div class="login-point"><span>' + icon('shield', 18) + '</span><div><strong>Role-based access</strong><small>Give every team member only what they need.</small></div></div>' +
        '</div>' +
        '<div class="login-brand-foot"><span class="dot-online"></span> Demo workspace · records stay on this device</div>' +
      '</section>' +
      '<section class="login-panel" aria-labelledby="loginCardTitle">' +
        '<div class="login-card">' +
          '<div class="login-card-head">' +
            '<span class="badge info">Quick demo login</span>' +
            '<h2 id="loginCardTitle">Choose your access level</h2>' +
            '<p>No password needed in this demo. Pick a role to enter the workspace instantly.</p>' +
          '</div>' +
          '<div class="role-list" role="group" aria-labelledby="loginCardTitle">' + ROLE_DEFS.map(roleCardHTML).join('') + '</div>' +
          '<p class="login-hint"><kbd>1</kbd><span>–</span><kbd>4</kbd><span>choose a role</span><span class="hint-dot">·</span><kbd>↑</kbd><kbd>↓</kbd><span>move</span><span class="hint-dot">·</span><kbd>Enter</kbd><span>sign in</span></p>' +
          '<p class="login-note">' + icon('info', 14) + ' Demo workspace — records stay on this device. Sign out from the account menu to switch roles.</p>' +
        '</div>' +
      '</section>' +
      '<p class="sr-only" id="loginStatus" role="status" aria-live="polite"></p>' +
    '</main>';
  }

  function handleLoginKeys(e) {
    if (!document.body.classList.contains('auth-locked')) return;
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target;
    if (target && target.closest && target.closest('input, textarea, select, [contenteditable="true"]')) return;

    const cards = Array.from(document.querySelectorAll('.role-card'));
    if (!cards.length) return;

    if (/^[1-9]$/.test(e.key)) {
      const card = cards[Number(e.key) - 1];
      if (card && !card.disabled) {
        e.preventDefault();
        login(card.dataset.role || '');
      }
      return;
    }

    const navKeys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
    if (navKeys.indexOf(e.key) === -1) return;
    e.preventDefault();
    const current = cards.indexOf(document.activeElement);
    let next;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = cards.length - 1;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = current < 0 ? 0 : (current + 1) % cards.length;
    else next = current <= 0 ? cards.length - 1 : current - 1;
    cards[next].focus();
  }

  document.addEventListener('keydown', handleLoginKeys);

  return {
    init,
    login,
    logout,
    showLogin,
    hideLogin,
    user,
    isAuthenticated,
    can,
    canRoute,
    roles: () => ROLE_DEFS.slice()
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
