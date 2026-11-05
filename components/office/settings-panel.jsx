'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  api, CATEGORY_LABELS, Field, formatDateTime, Icon, jsonBody, PageHeading,
  Panel, StatusBadge
} from './ui';

const GROUPS = [
  { key: 'organization', label: 'Organization', icon: 'building', permissions: ['settings.manage'] },
  { key: 'card', label: 'Visitor cards', icon: 'badge', permissions: ['settings.manage', 'cards.configure'] },
  { key: 'print', label: 'Printing', icon: 'print', permissions: ['settings.manage', 'cards.configure'] },
  { key: 'notifications', label: 'Email notifications', icon: 'bell', permissions: ['settings.manage', 'notifications.manage'] },
  { key: 'security', label: 'Visitor security', icon: 'shield', permissions: ['settings.manage'] }
];

export default function SettingsPanel({ user, notify, fail }) {
  const [settings, setSettings] = useState(null);
  const [meta, setMeta] = useState({});
  const [group, setGroup] = useState('organization');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const groups = GROUPS.filter((item) => item.permissions.some((permission) => user.permissions.includes(permission)));

  const load = useCallback(async () => {
    try {
      const data = await api('/api/office/settings');
      setSettings(data.settings);
      setMeta(data);
    } catch (reason) {
      fail(reason.message);
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (groups.length && !groups.some((item) => item.key === group)) setGroup(groups[0].key);
  }, [groups, group]);

  async function save(payload) {
    setBusy(true);
    try {
      await api('/api/office/settings', { method: 'PATCH', ...jsonBody({ group, value: payload }) });
      notify(settingsLabel(group) + ' settings saved.');
      await load();
    } catch (reason) {
      fail(reason.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="office-muted">Loading settings…</p>;
  if (!settings) return <p className="office-muted">Settings are unavailable for your account.</p>;

  return (
    <>
      <PageHeading eyebrow="SYSTEM CONFIGURATION" title="Settings" description="Organization identity, visitor card design, printing, email notifications, and visitor security policy." />

      <div className="office-settings-layout">
        <nav className="office-settings-nav">
          {groups.map((item) => (
            <button key={item.key} type="button" className={group === item.key ? 'active' : ''} onClick={() => setGroup(item.key)}>
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="office-settings-body">
          {group === 'organization' && settings.organization ? <OrganizationSettings value={settings.organization} busy={busy} onSave={save} /> : null}
          {group === 'card' && settings.card ? <CardSettings value={settings.card} busy={busy} onSave={save} /> : null}
          {group === 'print' && settings.print ? <PrintSettings value={settings.print} busy={busy} onSave={save} /> : null}
          {group === 'notifications' && settings.notifications ? <NotificationSettings value={settings.notifications} meta={meta} busy={busy} onSave={save} notify={notify} fail={fail} /> : null}
          {group === 'security' && settings.security ? <SecuritySettings value={settings.security} busy={busy} onSave={save} /> : null}
          {!settings[group] ? <Panel title="Restricted settings"><p className="office-muted">Your role cannot view this settings group.</p></Panel> : null}
        </div>
      </div>
    </>
  );
}

function settingsLabel(group) {
  return GROUPS.find((item) => item.key === group)?.label || 'Settings';
}

function FormActions({ busy, label }) {
  return <footer className="office-modal-actions"><button className="office-button primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save ' + label}</button></footer>;
}

function OrganizationSettings({ value, busy, onSave }) {
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      name: form.get('name'),
      legalName: form.get('legalName'),
      address: form.get('address'),
      phone: form.get('phone'),
      email: form.get('email'),
      website: form.get('website'),
      logoLetter: form.get('logoLetter'),
      brandColor: form.get('brandColor'),
      timezone: form.get('timezone')
    });
  }
  return (
    <form onSubmit={submit}>
      <Panel title="Organization identity" subtitle="Used on visitor cards, printed badges, and portal branding.">
        <div className="office-form-grid">
          <Field label="Display name"><input name="name" defaultValue={value.name} required maxLength={120} /></Field>
          <Field label="Legal name"><input name="legalName" defaultValue={value.legalName} maxLength={150} /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={value.email || ''} maxLength={254} /></Field>
          <Field label="Phone"><input name="phone" defaultValue={value.phone || ''} maxLength={40} /></Field>
          <Field label="Website"><input name="website" defaultValue={value.website || ''} maxLength={200} placeholder="https://" /></Field>
          <Field label="Timezone"><input name="timezone" defaultValue={value.timezone} maxLength={80} placeholder="Africa/Accra" /></Field>
          <Field label="Logo letter" hint="Shown in the brand mark on cards."><input name="logoLetter" defaultValue={value.logoLetter} maxLength={2} /></Field>
          <Field label="Brand color"><input name="brandColor" type="color" defaultValue={value.brandColor} /></Field>
          <Field label="Address" full><textarea name="address" defaultValue={value.address || ''} rows={2} maxLength={300} /></Field>
        </div>
      </Panel>
      <FormActions busy={busy} label="organization" />
    </form>
  );
}

function CardSettings({ value, busy, onSave }) {
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      templateName: form.get('templateName'),
      headerText: form.get('headerText'),
      footerText: form.get('footerText'),
      instructions: form.get('instructions'),
      accessZones: form.get('accessZones'),
      showPhoto: form.get('showPhoto') === 'on',
      showHost: form.get('showHost') === 'on',
      showQr: form.get('showQr') === 'on',
      accentColor: form.get('accentColor'),
      paperSize: form.get('paperSize'),
      autoPrint: form.get('autoPrint') === 'on'
    });
  }
  return (
    <form onSubmit={submit}>
      <Panel title="Visitor card template" subtitle="Controls the temporary visitor badge issued at check-in.">
        <div className="office-form-grid">
          <Field label="Template name"><input name="templateName" defaultValue={value.templateName} maxLength={120} /></Field>
          <Field label="Header text"><input name="headerText" defaultValue={value.headerText} maxLength={60} /></Field>
          <Field label="Accent color"><input name="accentColor" type="color" defaultValue={value.accentColor} /></Field>
          <Field label="Card size">
            <select name="paperSize" defaultValue={value.paperSize}>
              <option value="CR80">CR80 · standard ID card</option>
              <option value="A6">A6 · half A4</option>
              <option value="A4">A4 · full page</option>
            </select>
          </Field>
          <Field label="Access zones" full hint="Printed on the card under ACCESS."><input name="accessZones" defaultValue={value.accessZones} maxLength={300} /></Field>
          <Field label="Instructions" full><textarea name="instructions" defaultValue={value.instructions} rows={2} maxLength={300} /></Field>
          <Field label="Footer notice" full><textarea name="footerText" defaultValue={value.footerText} rows={2} maxLength={300} /></Field>
        </div>
        <div className="office-toggle-grid">
          <label className="office-check-option"><input name="showPhoto" type="checkbox" defaultChecked={value.showPhoto} /> Show visitor photo</label>
          <label className="office-check-option"><input name="showHost" type="checkbox" defaultChecked={value.showHost} /> Show host and department</label>
          <label className="office-check-option"><input name="showQr" type="checkbox" defaultChecked={value.showQr} /> Print access QR code</label>
          <label className="office-check-option"><input name="autoPrint" type="checkbox" defaultChecked={value.autoPrint} /> Open print dialog after issuing a card</label>
        </div>
      </Panel>
      <FormActions busy={busy} label="card template" />
    </form>
  );
}

function PrintSettings({ value, busy, onSave }) {
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      autoPrint: form.get('autoPrint') === 'on',
      cardWidthMm: form.get('cardWidthMm'),
      cardHeightMm: form.get('cardHeightMm'),
      printerName: form.get('printerName'),
      copies: form.get('copies')
    });
  }
  return (
    <form onSubmit={submit}>
      <Panel title="Printing" subtitle="Physical dimensions and default print behaviour for visitor cards.">
        <div className="office-form-grid">
          <Field label="Card width (mm)"><input name="cardWidthMm" type="number" min="40" max="210" defaultValue={value.cardWidthMm} /></Field>
          <Field label="Card height (mm)"><input name="cardHeightMm" type="number" min="30" max="297" defaultValue={value.cardHeightMm} /></Field>
          <Field label="Default printer" hint="Browsers may still ask you to confirm the printer."><input name="printerName" defaultValue={value.printerName || ''} maxLength={120} placeholder="Reception card printer" /></Field>
          <Field label="Copies"><input name="copies" type="number" min="1" max="10" defaultValue={value.copies} /></Field>
        </div>
        <label className="office-check-option"><input name="autoPrint" type="checkbox" defaultChecked={value.autoPrint} /> Automatically open the print dialog</label>
        <p className="office-hint-line">The printable card honours browser print settings. Choose CR80 card stock for standard ID badges.</p>
      </Panel>
      <FormActions busy={busy} label="print settings" />
    </form>
  );
}

function NotificationSettings({ value, meta, busy, onSave, notify, fail }) {
  const [testTo, setTestTo] = useState('');
  const [result, setResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [log, setLog] = useState([]);
  const [logStatus, setLogStatus] = useState('');

  const canLog = meta.canManageNotifications;

  const loadLog = useCallback(async () => {
    if (!canLog) return;
    try {
      const data = await api('/api/office/notifications' + (logStatus ? '?status=' + logStatus : ''));
      setLog(data.notifications);
    } catch (reason) {
      fail(reason.message);
    }
  }, [canLog, logStatus, fail]);

  useEffect(() => { loadLog(); }, [loadLog]);

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      emailEnabled: form.get('emailEnabled') === 'on',
      notifyHostOnRegister: form.get('notifyHostOnRegister') === 'on',
      notifyVisitorOnRegister: form.get('notifyVisitorOnRegister') === 'on',
      notifyOpsOnApprovalRequired: form.get('notifyOpsOnApprovalRequired') === 'on',
      notifyVisitorOnDecision: form.get('notifyVisitorOnDecision') === 'on',
      notifyHostOnCheckIn: form.get('notifyHostOnCheckIn') === 'on',
      notifyVisitorOnCheckOut: form.get('notifyVisitorOnCheckOut') === 'on',
      opsEmail: form.get('opsEmail'),
      replyTo: form.get('replyTo'),
      fallbackRecipient: form.get('fallbackRecipient')
    });
  }

  async function sendTest(event) {
    event.preventDefault();
    setTesting(true);
    setResult(null);
    try {
      const data = await api('/api/office/notifications', { method: 'POST', ...jsonBody({ to: testTo || undefined }) });
      setResult({ ok: true, message: 'Test email sent to ' + data.to + '.' });
      notify('Test email sent.');
      loadLog();
    } catch (reason) {
      const message = reason.status === 503
        ? 'Email is not configured on this deployment. Add RESEND_API_KEY and EMAIL_FROM to the environment, then retry.'
        : reason.message;
      setResult({ ok: false, message });
      fail(message);
      loadLog();
    } finally {
      setTesting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Panel title="Email notifications" subtitle="Resend-powered visitor and host notifications. Delivery is logged for every attempt.">
        <div className="office-email-status">
          <div>
            <span className="office-eyebrow">TRANSPORT</span>
            <strong>{meta.emailConfigured ? 'Resend API connected' : 'Resend API not configured'}</strong>
            <small>{meta.emailConfigured ? 'Emails will be delivered through Resend.' : 'Set RESEND_API_KEY and EMAIL_FROM to enable delivery. Notifications are logged as SKIPPED until then.'}</small>
          </div>
          <StatusBadge value={meta.emailConfigured ? 'ACTIVE' : 'PENDING'} label={meta.emailConfigured ? 'Ready' : 'Not configured'} />
        </div>

        <div className="office-toggle-grid two">
          <label className="office-check-option"><input name="emailEnabled" type="checkbox" defaultChecked={value.emailEnabled} /> Enable email notifications</label>
          <label className="office-check-option"><input name="notifyHostOnRegister" type="checkbox" defaultChecked={value.notifyHostOnRegister} /> Notify host when a visitor pre-registers</label>
          <label className="office-check-option"><input name="notifyVisitorOnRegister" type="checkbox" defaultChecked={value.notifyVisitorOnRegister} /> Confirm registration to the visitor</label>
          <label className="office-check-option"><input name="notifyOpsOnApprovalRequired" type="checkbox" defaultChecked={value.notifyOpsOnApprovalRequired} /> Alert operations when approval is required</label>
          <label className="office-check-option"><input name="notifyVisitorOnDecision" type="checkbox" defaultChecked={value.notifyVisitorOnDecision} /> Notify visitor of approval or denial</label>
          <label className="office-check-option"><input name="notifyHostOnCheckIn" type="checkbox" defaultChecked={value.notifyHostOnCheckIn} /> Notify host when the visitor checks in</label>
          <label className="office-check-option"><input name="notifyVisitorOnCheckOut" type="checkbox" defaultChecked={value.notifyVisitorOnCheckOut} /> Send check-out confirmation</label>
        </div>

        <div className="office-form-grid">
          <Field label="Operations inbox" hint="Receives approval alerts when no host or fallback is set."><input name="opsEmail" type="email" defaultValue={value.opsEmail || ''} maxLength={254} /></Field>
          <Field label="Reply-to address"><input name="replyTo" type="email" defaultValue={value.replyTo || ''} maxLength={254} /></Field>
          <Field label="Fallback recipient" hint="Used when a host has no email address." full><input name="fallbackRecipient" type="email" defaultValue={value.fallbackRecipient || ''} maxLength={254} /></Field>
        </div>
      </Panel>

      <FormActions busy={busy} label="notification settings" />

      {canLog ? (
        <>
          <Panel title="Send a test email" subtitle="Verify the Resend integration with a real message.">
            <div className="office-inline-form">
              <input type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="recipient@example.com (defaults to your inbox)" maxLength={254} aria-label="Test recipient" />
              <button className="office-button secondary" type="button" onClick={sendTest} disabled={testing}>{testing ? 'Sending…' : 'Send test email'}</button>
            </div>
            {result ? <div className={result.ok ? 'office-alert success' : 'office-alert error'} role="status">{result.message}</div> : null}
            <p className="office-hint-line">The API key is read from the server environment only. It is never stored in settings or sent to the browser.</p>
          </Panel>

          <Panel
            title="Delivery log"
            subtitle="Sent, failed, and skipped notification attempts."
            action={<select value={logStatus} onChange={(event) => setLogStatus(event.target.value)} aria-label="Filter delivery log"><option value="">All statuses</option><option value="SENT">Sent</option><option value="FAILED">Failed</option><option value="SKIPPED">Skipped</option></select>}
          >
            <div className="office-table-wrap">
              <table className="office-table">
                <thead><tr><th>Time</th><th>Recipient</th><th>Subject</th><th>Template</th><th>Status</th><th>Detail</th></tr></thead>
                <tbody>
                  {log.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>{item.recipient}</td>
                      <td><strong>{item.subject}</strong></td>
                      <td>{item.template}</td>
                      <td><StatusBadge value={item.status} /></td>
                      <td className="office-audit-meta">{item.error || '—'}</td>
                    </tr>
                  ))}
                  {!log.length ? <tr><td colSpan={6} className="office-empty">No notifications logged yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : null}
    </form>
  );
}

function SecuritySettings({ value, busy, onSave }) {
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      defaultVisitMinutes: form.get('defaultVisitMinutes'),
      qrFallbackHours: form.get('qrFallbackHours'),
      requireApprovalForCategories: form.getAll('requireApprovalForCategories'),
      photoRequired: form.get('photoRequired') === 'on',
      consentVersion: form.get('consentVersion'),
      allowWalkIns: form.get('allowWalkIns') === 'on'
    });
  }
  return (
    <form onSubmit={submit}>
      <Panel title="Visitor security policy" subtitle="Default timings, approval rules, and identity requirements.">
        <div className="office-form-grid">
          <Field label="Default visit duration (minutes)"><input name="defaultVisitMinutes" type="number" min="15" max="20160" defaultValue={value.defaultVisitMinutes} /></Field>
          <Field label="QR fallback validity (hours)" hint="Used when a visit has no expected check-out."><input name="qrFallbackHours" type="number" min="1" max="72" defaultValue={value.qrFallbackHours} /></Field>
          <Field label="Consent version"><input name="consentVersion" defaultValue={value.consentVersion} maxLength={40} /></Field>
        </div>
        <div className="office-toggle-grid">
          <label className="office-check-option"><input name="photoRequired" type="checkbox" defaultChecked={value.photoRequired} /> Require a visitor photo for registration</label>
          <label className="office-check-option"><input name="allowWalkIns" type="checkbox" defaultChecked={value.allowWalkIns} /> Allow walk-in registration</label>
        </div>
        <fieldset className="office-role-picker">
          <legend>Categories requiring approval <small>These visits cannot be checked in until an approver decides.</small></legend>
          <div className="office-role-picker-grid compact">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <label key={key} className={value.requireApprovalForCategories.includes(key) ? 'selected' : ''}>
                <input type="checkbox" name="requireApprovalForCategories" value={key} defaultChecked={value.requireApprovalForCategories.includes(key)} />
                <span><strong>{label}</strong></span>
              </label>
            ))}
          </div>
        </fieldset>
      </Panel>
      <FormActions busy={busy} label="security policy" />
    </form>
  );
}
