import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Download } from 'lucide-react';

export default function SQLOutputTab({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => { navigator.clipboard.writeText(sql); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([sql], { type: 'text/plain' })),
      download: 'fixmydb-schema.sql',
    });
    a.click(); URL.revokeObjectURL(a.href);
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
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Editor height="520px" language="sql" value={sql} theme="vs-dark"
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
