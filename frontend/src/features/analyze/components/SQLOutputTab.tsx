import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../shared/theme';
import { trackDownloadEvent } from '../../../shared/services/api';
import { getDeviceId } from '../../../shared/services/device';

export default function SQLOutputTab({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  const { theme } = useTheme();
  const copy = () => { navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([sql], { type: 'text/plain' })),
      download: 'fixmydb-schema.sql',
    });
    a.click(); URL.revokeObjectURL(a.href);
    trackDownloadEvent(getDeviceId(), 'sql');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Optimized schema with all recommended fixes applied.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copy} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', fontSize: 12, fontWeight: 500,
            background: copied ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
            color: copied ? '#34d399' : 'var(--text-muted)', borderRadius: 7, cursor: 'pointer',
          }}>
            {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={download} className="btn-primary" style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px',
          }}>
            <Download size={12} /> Download
          </button>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px', borderRadius: 8,
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
      }}>
        <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          <strong style={{ color: '#f59e0b' }}>Review before applying.</strong> This is an early-stage optimization engine (v1). The suggested SQL may not account for your full application context, existing data, or migration constraints. Please review each change carefully and test in a staging environment before applying to production.
        </div>
      </div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Editor height="520px" language="sql" value={sql} theme={theme === 'light' ? 'vs' : 'vs-dark'}
          options={{
            readOnly: true, fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true, minimap: { enabled: false },
            lineNumbers: 'on', scrollBeyondLastLine: false,
            automaticLayout: true, wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
}
