'use client';

import { useEffect, useMemo, useState } from 'react';
import AttendancePanel from './attendance-panel';
import AuditPanel from './audit-panel';
import FinancePanel from './finance-panel';
import OrganizationPanel from './organization-panel';
import OverviewPanel from './overview-panel';
import ReportsPanel from './reports-panel';
import RolesPanel from './roles-panel';
import SettingsPanel from './settings-panel';
import StaffPanel from './staff-panel';
import SurveyPanel from './survey-panel';
import VerifyPanel from './verify-panel';
import VisitorPanel from './visitor-panel';
import { api, Avatar, Icon } from './ui';

const GROUPS = [
  {
    label: 'Workspace',
    items: [{ key: 'overview', label: 'Overview', icon: 'grid' }]
  },
  {
    label: 'Front desk',
    items: [
      { key: 'visitors', label: 'Visitor operations', icon: 'badge', permissions: ['visitors.view'] },
      { key: 'verify', label: 'Scan & verify', icon: 'scan', permissions: ['visitors.view', 'visitors.checkin', 'visitors.card.print'] }
    ]
  },
  {
    label: 'People',
    items: [
      { key: 'staff', label: 'Staff directory', icon: 'users', permissions: ['staff.view'] },
      { key: 'attendance', label: 'Attendance', icon: 'clock' }
    ]
  },
  {
    label: 'Organization',
    items: [
      { key: 'roles', label: 'Roles & security', icon: 'shield', permissions: ['roles.manage'] },
      { key: 'organization', label: 'Departments & rooms', icon: 'building', permissions: ['organization.view', 'departments.manage', 'rooms.manage'] }
    ]
  },
  {
    label: 'Operations',
    items: [
      { key: 'reports', label: 'Reports', icon: 'report', permissions: ['reports.view'] },
      { key: 'finance', label: 'Finance', icon: 'money', permissions: ['finance.view'] },
      { key: 'survey', label: 'Land & surveying', icon: 'map', permissions: ['field.view'] }
    ]
  },
  {
    label: 'System',
    items: [
      { key: 'audit', label: 'Audit history', icon: 'audit', permissions: ['audit.view'] },
      { key: 'settings', label: 'Settings', icon: 'settings', permissions: ['settings.manage', 'cards.configure', 'notifications.manage'] }
    ]
  }
];

const PANEL_TITLES = {
  overview: 'Overview',
  visitors: 'Visitor operations',
  verify: 'Access verification',
  staff: 'Staff directory',
  attendance: 'Attendance',
  roles: 'Roles & security',
  organization: 'Departments & rooms',
  reports: 'Reports',
  finance: 'Finance',
  survey: 'Land & surveying',
  audit: 'Audit history',
  settings: 'Settings'
};

export default function OfficeDashboard({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const groups = useMemo(() => GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permissions || item.permissions.some((permission) => user.permissions.includes(permission)))
  })).filter((group) => group.items.length), [user.permissions]);

  const allowed = useMemo(() => new Set(groups.flatMap((group) => group.items.map((item) => item.key))), [groups]);

  useEffect(() => {
    if (!allowed.has(tab)) setTab('overview');
  }, [allowed, tab]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function logout() {
    setBusy(true);
    try {
      await api('/api/auth/session', { method: 'DELETE' });
      window.location.assign('/office/login');
    } catch (reason) {
      setError(reason.message || 'Could not sign out.');
      setBusy(false);
    }
  }

  function navigate(key) {
    setTab(key);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="office-shell">
      <header className="office-topbar">
        <a className="office-wordmark" href="/office">
          <span className="office-wordmark-icon">A</span>
          <span>Asante Land Company<small>Secure office portal</small></span>
        </a>
        <div className="office-topbar-tools">
          <button className="office-nav-toggle" type="button" onClick={() => setNavOpen((value) => !value)} aria-expanded={navOpen} aria-label="Toggle navigation">
            <Icon name={navOpen ? 'close' : 'menu'} size={18} />
          </button>
          <div className="office-account">
            <Avatar src={user.photoUrl} name={user.name} size={34} />
            <span><strong>{user.name}</strong><small>{user.roles.map((role) => role.name).join(' · ') || 'Office staff'}</small></span>
            <button type="button" onClick={logout} disabled={busy}><Icon name="logout" size={14} /> Sign out</button>
          </div>
        </div>
      </header>

      <div className="office-layout">
        <aside className={'office-sidebar' + (navOpen ? ' open' : '')}>
          {groups.map((group) => (
            <div className="office-nav-group" key={group.label}>
              <span className="office-sidebar-label">{group.label}</span>
              {group.items.map((item) => (
                <button key={item.key} className={tab === item.key ? 'active' : ''} type="button" onClick={() => navigate(item.key)}>
                  <Icon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
          <div className="office-sidebar-foot">
            <span>Signed in as</span>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </aside>

        <section className="office-main">
          <div className="office-breadcrumb"><span>Office</span><Icon name="arrow" size={12} /><strong>{PANEL_TITLES[tab] || 'Overview'}</strong></div>
          {error ? <div className="office-alert error" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss" onClick={() => setError('')}><Icon name="close" size={13} /></button></div> : null}
          {notice ? <div className="office-alert success" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss" onClick={() => setNotice('')}><Icon name="close" size={13} /></button></div> : null}

          {tab === 'overview' ? <OverviewPanel user={user} navigate={navigate} /> : null}
          {tab === 'visitors' ? <VisitorPanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'verify' ? <VerifyPanel notify={setNotice} fail={setError} /> : null}
          {tab === 'staff' ? <StaffPanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'attendance' ? <AttendancePanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'roles' ? <RolesPanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'organization' ? <OrganizationPanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'reports' ? <ReportsPanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'finance' ? <FinancePanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'survey' ? <SurveyPanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'audit' ? <AuditPanel user={user} notify={setNotice} fail={setError} /> : null}
          {tab === 'settings' ? <SettingsPanel user={user} notify={setNotice} fail={setError} /> : null}
        </section>
      </div>
    </main>
  );
}
