'use client';

import { useState } from 'react';

export default function OfficeLogin() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
      });
      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }
      if (!response.ok) throw new Error(result.error || 'Sign in failed (' + response.status + ').');
      if (!result.ok) throw new Error('The server returned an unexpected response. Try again.');
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.assign(next && next.startsWith('/') && !next.startsWith('//') ? next : '/#/office-overview');
    } catch (reason) {
      const unreachable = /fetch|network/i.test(reason.message || '');
      setError(unreachable ? 'Cannot reach the server. Check that it is running, then try again.' : reason.message || 'Sign in failed.');
      setBusy(false);
    }
  }

  return (
    <main className="office-login-page">
      <section className="office-login-card">
        <div className="office-brand-mark" aria-hidden="true">A</div>
        <p className="office-eyebrow">ASANTE LAND COMPANY</p>
        <h1>Secure office portal</h1>
        <p className="office-login-copy">Sign in to manage front desk operations and visitor access.</p>
        <form onSubmit={submit} className="office-login-form">
          <label>Email address<input name="email" type="email" autoComplete="username" required maxLength={254} /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={200} /></label>
          {error ? <p className="office-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button>
        </form>
        <p className="office-login-foot">Access is managed by your organization. Contact an administrator if you need an account.</p>
      </section>
    </main>
  );
}
