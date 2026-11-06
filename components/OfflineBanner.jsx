'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function OfflineBanner() {
  const pathname = usePathname();
  const onDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(console.error);
  }, []);

  useEffect(() => {
    const sync = () => setOffline(navigator.onLine === false);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (!offline || !onDashboard) return null;

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <strong>Offline</strong>
      <span>The dashboard shell is still available. Actions that need the server resume when the connection returns.</span>
    </div>
  );
}
