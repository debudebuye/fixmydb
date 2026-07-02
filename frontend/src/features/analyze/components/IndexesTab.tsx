import { useState } from 'react';
import { Zap, Copy, Check } from 'lucide-react';
import type { Recommendation } from '../../../shared/types/schema';

export default function IndexesTab({ recommendations }: { recommendations: Recommendation[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  const copy = (sql: string, i: number) => {
    navigator.clipboard.writeText(sql);
    setCopied(i); setTimeout(() => setCopied(null), 2000);
  };
  const copyAll = () => {
    navigator.clipboard.writeText(recommendations.map(r => r.sql).join('\n'));
    setCopied(-1); setTimeout(() => setCopied(null), 2000);
  };

  if (!recommendations.length) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
      <Zap size={28} color="#f59e0b" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
      <p style={{ fontSize: 14, color: '#f59e0b' }}>No index recommendations</p>
      <p style={{ fontSize: 12, marginTop: 4 }}>Your schema has good index coverage</p>
    </div>
  );

  const indexRecs  = recommendations.filter(r => r.type === 'missing_index');
  const uniqueRecs = recommendations.filter(r => r.type === 'missing_unique');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {indexRecs.length  > 0 && <span className="badge badge-yellow">{indexRecs.length} index{indexRecs.length !== 1 ? 'es' : ''}</span>}
          {uniqueRecs.length > 0 && <span className="badge badge-purple">{uniqueRecs.length} unique constraint{uniqueRecs.length !== 1 ? 's' : ''}</span>}
        </div>
        <button onClick={copyAll} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', fontSize: 12, fontWeight: 500,
          background: copied === -1 ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
          border: `1px solid ${copied === -1 ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
          color: copied === -1 ? '#34d399' : 'var(--text-muted)',
          borderRadius: 7, cursor: 'pointer',
        }}>
          {copied === -1 ? <Check size={12} /> : <Copy size={12} />}
          Copy All
        </button>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recommendations.map((rec, i) => (
          <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 9, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <span className={rec.type === 'missing_index' ? 'badge badge-yellow' : 'badge badge-purple'}>
                    {rec.type === 'missing_index' ? 'INDEX' : 'UNIQUE'}
                  </span>
                  <code style={{ fontSize: 11, color: '#7c6af7', fontFamily: 'monospace' }}>{rec.table}</code>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                  <code style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{rec.column}</code>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{rec.message}</p>
                {/* SQL code block */}
                <div style={{ background: 'var(--surface-1-alt)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>
                  <code style={{ color: '#34d399' }}>{rec.sql}</code>
                </div>
                {rec.benefit && (
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                    <span style={{ color: '#f59e0b' }}>benefit: </span>{rec.benefit}
                  </p>
                )}
              </div>
              <button onClick={() => copy(rec.sql, i)} style={{
                width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: copied === i ? 'rgba(16,185,129,0.1)' : 'var(--surface-1)',
                border: `1px solid ${copied === i ? 'rgba(16,185,129,0.25)' : 'var(--border-subtle)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {copied === i ? <Check size={12} color="#34d399" /> : <Copy size={12} color="var(--text-muted)" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
