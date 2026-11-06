'use client';

import { useState } from 'react';
import Icon from './icons';

const TYPES = [
  { value: 'BUYING', label: 'Buying land' },
  { value: 'SELLING', label: 'Selling land' },
  { value: 'VIEWING', label: 'Booking a site visit' },
  { value: 'GENERAL', label: 'General enquiry' }
];

export default function InquiryForm({ listingSlug = '', defaultType = 'BUYING', heading = 'Send a message', intro = '' }) {
  const [type, setType] = useState(defaultType);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    setErrors({});
    try {
      const response = await fetch('/api/land/inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, type, listingSlug })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(result.fields || {});
        setError(result.error || 'Your message could not be sent.');
        setStatus('error');
        return;
      }
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '', website: '' });
    } catch {
      setError('We could not reach the office. Check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="ls-form-success" role="status">
        <span className="ls-form-success-icon"><Icon name="check" size={20} /></span>
        <h3>Message received</h3>
        <p>A land officer will reply to your email within one business day. If your message is about a specific plot, include the reference in any follow-up.</p>
        <button type="button" className="ls-button ls-button-secondary" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="ls-form" onSubmit={submit} noValidate>
      <div className="ls-form-head">
        <h3>{heading}</h3>
        {intro ? <p>{intro}</p> : null}
      </div>

      {error ? <div className="ls-form-alert" role="alert">{error}</div> : null}

      <div className="ls-form-grid">
        <div className="ls-field">
          <label htmlFor="inquiry-name">Full name</label>
          <input
            id="inquiry-name"
            name="name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            required
          />
          {errors.name ? <span className="ls-field-error">{errors.name}</span> : null}
        </div>
        <div className="ls-field">
          <label htmlFor="inquiry-email">Email</label>
          <input
            id="inquiry-email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            required
          />
          {errors.email ? <span className="ls-field-error">{errors.email}</span> : null}
        </div>
        <div className="ls-field">
          <label htmlFor="inquiry-phone">Phone <span>optional</span></label>
          <input
            id="inquiry-phone"
            name="phone"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone ? <span className="ls-field-error">{errors.phone}</span> : null}
        </div>
        <div className="ls-field">
          <label htmlFor="inquiry-type">This is about</label>
          <select id="inquiry-type" name="type" value={type} onChange={(event) => setType(event.target.value)}>
            {TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </div>

      <div className="ls-field">
        <label htmlFor="inquiry-message">Message</label>
        <textarea
          id="inquiry-message"
          name="message"
          rows={5}
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          placeholder="Tell us the area you are considering, your budget, and any questions about the title."
          aria-invalid={Boolean(errors.message)}
          required
        />
        {errors.message ? <span className="ls-field-error">{errors.message}</span> : null}
      </div>

      <div className="ls-honeypot" aria-hidden="true">
        <label htmlFor="inquiry-website">Website</label>
        <input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} />
      </div>

      <div className="ls-form-actions">
        <button type="submit" className="ls-button ls-button-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
          {status === 'sending' ? null : <Icon name="arrowRight" size={15} />}
        </button>
        <p className="ls-form-fineprint">We use your details only to answer this enquiry. No marketing lists.</p>
      </div>
    </form>
  );
}
