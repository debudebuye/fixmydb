import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!offline) return null;

  return (
    <div role="alert" style={{
      padding: '8px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600,
      background: 'rgba(245,158,11,0.12)', borderBottom: '1px solid rgba(245,158,11,0.25)',
      color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <WifiOff size={14} /> You are offline — analysis requires an internet connection
    </div>
  );
}
