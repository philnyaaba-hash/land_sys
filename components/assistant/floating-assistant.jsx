'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SIGN_IN_URL = '/office/login?next=/';
const INTRO = 'Ask about visitors, staff, attendance, finance, surveying or audit history.';

function SparkIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.2l1.5 4.4 4.4 1.5-4.4 1.5L12 15l-1.5-4.4L6.1 9.1l4.4-1.5L12 3.2Z" />
      <path d="M18.4 15.2l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1Z" />
    </svg>
  );
}

function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 3 10.5 13.5M21 3l-6.4 18-4.1-7.5L3 9.4 21 3Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5.3c0 4.2 2.8 7.6 7 9.7 4.2-2.1 7-5.5 7-9.7V6l-7-3Z" />
      <path d="M9.3 11.8 11.4 14l3.6-4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6.3 8.5A7 7 0 0 1 19 12M18 15.5A7 7 0 0 1 5 12" />
    </svg>
  );
}

let messageId = 0;
function nextMessageId() {
  messageId += 1;
  return 'assistant-message-' + messageId;
}

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const requestedRef = useRef(false);
  const seededRef = useRef(false);

  const loadStatus = useCallback(async () => {
    setPhase('loading');
    try {
      const response = await fetch('/api/assistant', { headers: { accept: 'application/json' } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error('The assistant could not connect.');
      setSession(data);
      setPhase('ready');
      if (data.authenticated && !seededRef.current) {
        seededRef.current = true;
        setMessages([{ id: nextMessageId(), role: 'assistant', text: data.greeting + ' ' + INTRO, suggestions: data.suggestions || [] }]);
      }
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    if (!open || requestedRef.current) return;
    requestedRef.current = true;
    loadStatus();
  }, [open, loadStatus]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        if (launcherRef.current) launcherRef.current.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || phase !== 'ready' || !session?.authenticated) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [open, phase, session]);

  useEffect(() => {
    if (!open || !logRef.current) return;
    logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [open, messages, busy]);

  async function ask(raw) {
    const question = String(raw ?? input).trim();
    if (!question || busy || phase !== 'ready' || !session?.authenticated) return;
    setInput('');
    setError('');
    setMessages((previous) => [...previous, { id: nextMessageId(), role: 'user', text: question }]);
    setBusy(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          setSession((previous) => ({ ...(previous || {}), authenticated: false, signInUrl: data.signInUrl || SIGN_IN_URL }));
        }
        throw new Error(data.error || 'The assistant could not answer that.');
      }
      setMessages((previous) => [...previous, {
        id: nextMessageId(),
        role: 'assistant',
        text: data.answer,
        suggestions: data.suggestions || []
      }]);
    } catch (requestError) {
      setError(requestError.message || 'The assistant could not answer that.');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function submit(event) {
    event.preventDefault();
    ask();
  }

  function onComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      ask();
    }
  }

  const authenticated = Boolean(session?.authenticated);
  const statusTone = phase === 'error' ? 'error' : phase !== 'ready' ? 'pending' : authenticated ? 'live' : 'locked';
  const statusLabel = phase === 'error'
    ? 'Live data offline'
    : phase !== 'ready'
      ? 'Connecting to live data…'
      : authenticated
        ? 'Live office database'
        : 'Office sign-in needed';

  return (
    <div className={'assistant-root' + (open ? ' is-open' : '')}>
      {open ? (
        <section className="assistant-panel" id="landledger-assistant" role="dialog" aria-label="LandLedger assistant">
          <header className="assistant-head">
            <span className="assistant-mark" aria-hidden="true"><SparkIcon size={18} /></span>
            <div className="assistant-heading">
              <strong>LandLedger Assistant</strong>
              <span className={'assistant-status ' + statusTone}><i aria-hidden="true" />{statusLabel}</span>
            </div>
            <button className="assistant-close" type="button" aria-label="Close assistant" onClick={() => setOpen(false)}>
              <CloseIcon />
            </button>
          </header>

          {phase === 'ready' && !authenticated ? (
            <div className="assistant-gate">
              <span className="assistant-gate-icon"><ShieldIcon /></span>
              <strong>Connect the live database</strong>
              <p>Sign in with your office account to query visitors, staff, attendance, finance and survey records. Your role decides what the assistant can read.</p>
              <a className="assistant-gate-btn" href={session?.signInUrl || SIGN_IN_URL}>Sign in to office</a>
            </div>
          ) : null}

          {phase === 'error' ? (
            <div className="assistant-gate">
              <span className="assistant-gate-icon error"><ShieldIcon /></span>
              <strong>Live data is unreachable</strong>
              <p>The office database did not respond. Check your connection and try again.</p>
              <button className="assistant-gate-btn" type="button" onClick={loadStatus}><RefreshIcon /> Retry</button>
            </div>
          ) : null}

          {phase === 'loading' ? (
            <div className="assistant-loading" role="status" aria-live="polite">
              <i /><i /><i />
              <span>Connecting to the office database…</span>
            </div>
          ) : null}

          {phase === 'ready' && authenticated ? (
            <>
              <div className="assistant-log" ref={logRef} aria-live="polite" aria-relevant="additions text">
                {messages.map((message, index) => (
                  <div key={message.id} className={'assistant-row ' + message.role}>
                    <div className={'assistant-bubble ' + message.role}>{message.text}</div>
                    {message.role === 'assistant' && message.suggestions?.length && index === messages.length - 1 && !busy ? (
                      <div className="assistant-suggestions">
                        {message.suggestions.slice(0, 3).map((suggestion) => (
                          <button key={suggestion} type="button" onClick={() => ask(suggestion)}>{suggestion}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                {busy ? (
                  <div className="assistant-row assistant">
                    <div className="assistant-bubble assistant typing" aria-label="Searching live records">
                      <i /><i /><i />
                    </div>
                  </div>
                ) : null}
              </div>

              {error ? <p className="assistant-error" role="alert">{error}</p> : null}

              <form className="assistant-compose" onSubmit={submit}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onComposerKeyDown}
                  rows={1}
                  maxLength={400}
                  placeholder="Ask about live office data…"
                  aria-label="Ask LandLedger about live office data"
                />
                <button type="submit" aria-label="Send question" disabled={busy || !input.trim()}>
                  <SendIcon />
                </button>
              </form>
              <p className="assistant-hint">Read-only queries. Answers follow your office role.</p>
            </>
          ) : null}
        </section>
      ) : null}

      <button
        ref={launcherRef}
        className="assistant-launcher"
        type="button"
        aria-expanded={open}
        aria-controls="landledger-assistant"
        aria-label={open ? 'Close LandLedger assistant' : 'Open LandLedger assistant'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="assistant-launcher-glow" aria-hidden="true" />
        {open ? <CloseIcon size={20} /> : <SparkIcon size={21} />}
        <span className="assistant-launcher-label">{open ? 'Close' : 'Ask LandLedger'}</span>
      </button>
    </div>
  );
}
