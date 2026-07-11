import { Monitor, Package, Download } from 'lucide-react';

const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

export default function DesktopAppBanner() {
  return (
    <section style={{ ...S.section, paddingBottom: 60 }}>
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Monitor size={22} color="#7c6af7" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={14} color="#7c6af7" />
            Desktop App — native installer for Linux, Windows & macOS
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 6 }}>
            No Docker or Node.js required. One-click install with bundled backend and auto-updating releases.
            Works offline for schema analysis with your own AI provider.
          </p>
        </div>
        <a href="https://github.com/debudebuye/fixmydb/releases"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8,
            background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.25)',
            color: '#7c6af7', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
          <Download size={14} />
          Download
        </a>
      </div>
    </section>
  );
}
