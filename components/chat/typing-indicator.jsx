/* WhatsApp-style typing indicator */
import React from 'react';
import styles from './workspace-assistant.module.css';

function ChatIconSmall() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 8.9 8.9 0 0 1-3.9-.9L3 21l1.2-4.9a8.1 8.1 0 0 1-.7-3.3A8.4 8.4 0 0 1 12 3.2a8.4 8.4 0 0 1 9 8.3Z" />
    </svg>
  );
}

export default function TypingIndicator({ active, username }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (active) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <div className="typing-container">
      <div className="typing-avatar">
        <ChatIconSmall />
      </div>
      <div className="typing-bubble">
        <span className="typing-name">{username}</span>
        <div className="typing-dots">
          <span className="dot" /></span>
          <span className="dot" /></span>
          <span className="dot" /></span>
        </div>
      </div>
    </div>
  );
}
