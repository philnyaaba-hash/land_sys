'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './workspace-assistant.module.css';

const HISTORY_KEY = 'll.assistant.v1';
const MAX_MESSAGES = 30;

const TOPIC_LABELS = {
  visitors: 'Visitor operations',
  attendance: 'Attendance',
  finance: 'Finance desk',
  survey: 'Surveying',
  staff: 'Staff directory',
  audit: 'Audit history',
  clients: 'Client desk',
  pipeline: 'Land storefront',
  land: 'Land records',
  service: 'Service requests',
  overview: 'Workspace overview',
  help: 'Help'
};

const ROUTE_TOPICS = [
  [/^#\/(office-visitors|office-reports)/, 'visitors'],
  [/^#\/office-attendance/, 'attendance'],
  [/^#\/(office-finance|finance)/, 'finance'],
  [/^#\/office-survey/, 'survey'],
  [/^#\/(office-clients|client-portfolio|buyers)/, 'clients'],
  [/^#\/(office-land|map|plots)/, 'land'],
  [/^#\/(office-staff|staff)/, 'staff'],
  [/^#\/office-audit/, 'audit'],
  [/^#\/office-service/, 'service']
];

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 8.9 8.9 0 0 1-3.9-.9L3 21l1.2-4.9a8.1 8.1 0 0 1-.7-3.3A8.4 8.4 0 0 1 12 3.2a8.4 8.4 0 0 1 9 8.3Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ThumbIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l5-2V3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2z" />
    </svg>
  );
}

export default function WorkspaceAssistant() {
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [routeTopic, setRouteTopic] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({});
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const loadingRef = useRef(false);

  const reset = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setInput('');
    setPending(false);
    setRawData(null);
    try { sessionStorage.removeItem(HISTORY_KEY); } catch { /* private mode */ }
  }, []);

  const loadStatus = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch('/api/assistant', { headers: { accept: 'application/json' } });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.authenticated) return;
      setStatus(data);
      setSuggestions((current) => (current.length ? current : (data.suggestions || []).slice(0, 3)));
    } catch {
      /* offline or signed out; the auth observer will retry */
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains('auth-locked')) {
        setStatus(null);
        setOpen(false);
        reset();
      } else {
        loadStatus();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [loadStatus, reset]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (!raw) {
        // Demo conversation for first-time users
        const demoConversation = [
          {
            role: 'assistant',
            text: 'Visitor operations\nAttendance\nStaff directory\nClient desk\nLand storefront\nWorkspace overview\n\nWhich visits are awaiting approval?\n1 visitor on site right now:\n• Phil nyaaba, in since 15:30\n1 visit is past the expected check-out time.\n1 visit recorded today.\nBreakdown: expected 1.',
            topic: 'visitors',
            generatedBy: 'local',
            time: new Date().toLocaleTimeString(),
            id: 'demo-1'
          },
          {
            role: 'assistant',
            text: 'Who is on site right now?\nHow many visitors today?\nWhich visits are awaiting approval?\nAsk about visitors, finance, attendance…',
            topic: 'overview',
            generatedBy: 'local',
            time: new Date().toLocaleTimeString(),
            id: 'demo-2'
          }
        ];
        setMessages(demoConversation);
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify({ messages: demoConversation.slice(-MAX_MESSAGES) }));
      } else {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.messages)) setMessages(saved.messages.slice(-MAX_MESSAGES));
      }
    } catch { /* corrupted entry: ignore */ }
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify({ messages: messages.slice(-MAX_MESSAGES) }));
    } catch { /* private mode */ }
  }, [messages]);

  useEffect(() => {
    const applyRoute = () => {
      const hash = window.location.hash || '';
      const match = ROUTE_TOPICS.find(([pattern]) => pattern.test(hash));
      setRouteTopic(match ? match[1] : null);
    };
    applyRoute();
    window.addEventListener('hashchange', applyRoute);
    return () => window.removeEventListener('hashchange', applyRoute);
  }, []);

  useEffect(() => {
    if (!open || messages.length || !status) return;
    const topicPrompts = routeTopic && status.prompts ? status.prompts[routeTopic] : null;
    if (topicPrompts && topicPrompts.length) setSuggestions(topicPrompts.slice(0, 3));
  }, [open, messages.length, routeTopic, status]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current && inputRef.current.focus();
    } else {
      launcherRef.current && launcherRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending, open]);

  const ask = useCallback(async (question) => {
    const text = String(question || '').trim();
    if (!text || pending) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', text }]);
    setPending(true);
    setRawData(null);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const text = data && data.error ? data.error : 'The assistant is temporarily unavailable. Try again shortly.';
        setMessages((current) => [...current, { role: 'assistant', text, error: true }]);
        return;
      }
      setMessages((current) => [...current, {
        role: 'assistant',
        text: data.answer || 'I could not find that in the live office data.',
        topic: data.topic
      }]);
      setSuggestions((data.suggestions || []).slice(0, 3));
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'Network problem — the answer could not be retrieved.', error: true }]);
    } finally {
      setPending(false);
    }
  }, [pending]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }, []);

  const submitFeedback = useCallback(async (messageId, rating) => {
    setFeedbackMap((prev) => ({ ...prev, [messageId]: rating }));
    try {
      await fetch('/api/assistant', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messageId, rating })
      });
    } catch {
      setFeedbackMap((prev) => ({ ...prev, [messageId]: undefined }));
    }
  }, []);

  const toggleRawData = useCallback((message) => {
    setRawData(rawData && rawData.id === message.id ? null : message);
  }, [rawData]);

  if (!status) return null;

  return (
    <div data-ll-assistant="">
      <button
        ref={launcherRef}
        type="button"
        className={open ? styles.launcher + ' ' + styles.launcherHidden : styles.launcher}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Workspace assistant (Ctrl+J)"
      >
        <ChatIcon />
        <span className={styles.launcherLabel}>Ask</span>
      </button>

      {open && (
        <section className={styles.panel} role="dialog" aria-modal="true" aria-label="Workspace assistant">
          <header className={styles.head}>
            <div className={styles.headTitle}>
              <span className={styles.headIcon}><ChatIcon /></span>
              <div>
                <strong className={styles.headName}>Workspace Assistant</strong>
                <span className={styles.headSub}>Live office database • read-only</span>
              </div>
            </div>
            <div className={styles.headActions}>
              {messages.length > 0 && (
                <button type="button" className={styles.headBtn} onClick={reset} title="Clear conversation">
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
                  </svg>
                </button>
              )}
              <button type="button" className={styles.headBtn} onClick={() => setOpen(false)} title="Close (Esc)">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div ref={logRef} className={styles.log} role="log" aria-live="polite">
            <div className={styles.intro}>
              <p className={styles.greeting}>{status.greeting}</p>
              {status.capabilities && status.capabilities.length > 0 && (
                <ul className={styles.caps}>
                  {status.capabilities.map((capability) => (
                    <li key={capability.key}>{capability.label}</li>
                  ))}
                </ul>
              )}
            </div>

            {messages.map((message, index) => (
              <div key={index} className={message.role === 'user' ? styles.userRow : styles.botRow}>
                <div className={styles.msgHeader}>
                  {message.role === 'user' ? <span className={styles.msgRole}>You</span> : <span className={styles.msgRole}>Assistant</span>}
                  <span className={styles.msgTime}>{message.time}</span>
                </div>
                <div className={
                  message.role === 'user'
                    ? styles.userBubble
                    : (message.error ? styles.errBubble : styles.botBubble)
                }>
                  {message.text}
                  {message.topic && TOPIC_LABELS[message.topic]
                    && <span className={styles.tag}>{TOPIC_LABELS[message.topic]}</span>}
                  {message.generatedBy && message.generatedBy !== 'local'
                    && <span className={styles.tag tagAi}>{message.generatedBy}</span>}
                  {message.elapsedMs != null
                    && <span className={styles.tag tagMeta}>{message.elapsedMs}ms</span>}
                </div>

                {message.role === 'assistant' && !message.error && (
                  <div className={styles.msgActions}>
                    <button type="button" className={styles.actionBtn} title="Copy" onClick={() => copyToClipboard(message.text)}>
                      <CopyIcon />
                    </button>
                    {message.data && (
                      <button type="button" className={styles.actionBtn} title="Show raw data" onClick={() => toggleRawData(message)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none"
                          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                      </button>
                    )}
                    <button type="button" className={styles.actionBtn} title="Helpful" onClick={() => message.id && submitFeedback(message.id, 'helpful')}>
                      <ThumbIcon filled={feedbackMap[message.id] === 'helpful'} />
                    </button>
                    <button type="button" className={styles.actionBtn} title="Not helpful" onClick={() => message.id && submitFeedback(message.id, 'not_helpful')}>
                      <ThumbIcon filled={feedbackMap[message.id] === 'not_helpful'} />
                    </button>
                  </div>
                )}

                {rawData && rawData.id === message.id && (
                  <div className={styles.rawData}>
                    <h4>Raw data ({rawData.tables?.join(', ') || 'database'})</h4>
                    <pre>{JSON.stringify(rawData.data, null, 2)}</pre>
                    <button type="button" className={styles.actionBtn} onClick={() => setRawData(null)}>Close</button>
                  </div>
                )}
              </div>
            ))}

            {suggestions.length > 0 && !pending && (
              <div className={styles.chips}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className={styles.chip}
                    onClick={() => ask(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))
              </div>
            )}

            <form
              className={styles.composer}
              onSubmit={(event) => { event.preventDefault(); ask(input); }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                maxLength={400}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    ask(input);
                  }
                }}
                placeholder="Ask about visitors, finance, attendance…"
                aria-label="Ask the workspace assistant"
              />
              <button type="submit" className={styles.send} disabled={pending || !input.trim()} title="Send">
                <SendIcon />
              </button>
            </form>

            <footer className={styles.foot}>
              Read-only · your permissions apply · Ctrl+J to open · Esc to close
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
