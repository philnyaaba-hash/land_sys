'use client';

import { useState } from 'react';
import { canViewPanel, OFFICE_PANELS } from '../../lib/office-panels';
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
import { Icon } from './ui';

const PANELS = {
  overview: OverviewPanel,
  visitors: VisitorPanel,
  verify: VerifyPanel,
  staff: StaffPanel,
  attendance: AttendancePanel,
  organization: OrganizationPanel,
  reports: ReportsPanel,
  finance: FinancePanel,
  survey: SurveyPanel,
  roles: RolesPanel,
  audit: AuditPanel,
  settings: SettingsPanel
};

export default function OfficePanelView({ initialUser, panel }) {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const def = OFFICE_PANELS[panel] || OFFICE_PANELS.overview;
  const PanelComponent = PANELS[panel] || PANELS.overview;
  const allowed = canViewPanel(initialUser, panel);

  function navigate(key) {
    if (PANELS[key]) window.location.assign('/office/embed?panel=' + key);
  }

  async function signOut() {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      /* Reloading the panel will show the office sign-in if the session is gone. */
    }
    window.location.reload();
  }

  return (
    <main className="office-embed">
      <div className="office-main">
        <div className="office-embed-session">
          <span>Office access · <strong>{initialUser.name}</strong></span>
          <button type="button" onClick={signOut}>Sign out of office</button>
        </div>
        {error ? <div className="office-alert error" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss" onClick={() => setError('')}><Icon name="close" size={13} /></button></div> : null}
        {notice ? <div className="office-alert success" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss" onClick={() => setNotice('')}><Icon name="close" size={13} /></button></div> : null}
        {allowed ? (
          <PanelComponent user={initialUser} notify={setNotice} fail={setError} navigate={navigate} />
        ) : (
          <section className="office-embed-denied">
            <h1>Restricted</h1>
            <p>Your office role cannot open {def.label.toLowerCase()}. Ask an administrator if you need access.</p>
            <button className="office-button secondary" type="button" onClick={signOut}>Switch office account</button>
          </section>
        )}
      </div>
    </main>
  );
}
