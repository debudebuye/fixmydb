import { useState } from 'react';
import { Zap, Heart, Copy, Check, Download } from 'lucide-react';

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(import.meta.env.VITE_BINANCE_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
        <Zap size={12} color="#7c6af7" />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          FixMyDB · Open Source · MIT License · 2026
        </span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-soft)' }}>Like ESLint — but for database architecture.</p>
      <div style={{ marginTop: 10 }}>
        <a href="https://github.com/debudebuye/fixmydb/releases"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, color: '#7c6af7', fontWeight: 500, textDecoration: 'none',
            padding: '4px 10px', borderRadius: 5,
            background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.15)',
          }}>
          <Download size={11} />
          Download Desktop App
        </a>
      </div>
      {import.meta.env.VITE_BINANCE_ID && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <Heart size={12} color="#f43f5e" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Support FixMyDB</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            If this tool helped you, consider buying me a coffee. Every bit keeps the project alive and improving.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>Binance Pay ID:</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '0.02em', userSelect: 'all' }}>
              {import.meta.env.VITE_BINANCE_ID}
            </span>
            <button onClick={copyId} title="Copy ID"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', fontSize: 11, fontWeight: 500,
                background: copied ? 'rgba(34,197,94,0.12)' : 'var(--surface-1)',
                border: '1px solid var(--border)', borderRadius: 5,
                color: copied ? '#22c55e' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
