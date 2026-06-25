import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type { NormalizationAnalysis } from '../../types/schema';

const NF = [
  { key: '1NF', desc: 'Atomic values, no repeating groups' },
  { key: '2NF', desc: 'Full dependency on entire primary key' },
  { key: '3NF', desc: 'No transitive non-key dependencies' },
];

export default function NormalizationTab({ normalization }: { normalization: NormalizationAnalysis }) {
  const { violations, suggestions, normalizationScore } = normalization;
  const byForm = Object.fromEntries(NF.map(f => [f.key, violations.filter(v => v.normalForm === f.key)]));

  const scoreColor = normalizationScore >= 80 ? '#10b981' : normalizationScore >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Score */}
      <div style={{
        background: '#16161f', border: '1px solid #1e1e2a', borderRadius: 10,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor, letterSpacing: '-0.05em' }}>{normalizationScore}</div>
          <div style={{ fontSize: 10, color: '#3d3d55', marginTop: 2 }}>/ 100</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: '#1a1a24', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${normalizationScore}%`, height: '100%', background: scoreColor, borderRadius: 99, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            {violations.length === 0
              ? '✓ No normalization violations detected'
              : `${violations.length} violation${violations.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* NF status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {NF.map(({ key, desc }) => {
          const vv = byForm[key] || [];
          const ok = vv.length === 0;
          return (
            <div key={key} style={{
              background: '#16161f',
              border: `1px solid ${ok ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {ok
                    ? <ShieldCheck size={13} color="#10b981" />
                    : <ShieldAlert size={13} color="#f43f5e" />
                  }
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{key}</span>
                </div>
                <span className={ok ? 'badge badge-green' : 'badge badge-red'}>
                  {ok ? 'PASS' : `${vv.length}`}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#3d3d55', lineHeight: 1.5 }}>{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Violation details */}
      {violations.length > 0 && (
        <div style={{ background: '#16161f', border: '1px solid #1e1e2a', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #1a1a24' }}>
            Violation Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {violations.map((v, i) => (
              <div key={i} style={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-red">{v.normalForm}</span>
                  <code style={{ fontSize: 11, color: '#7c6af7', fontFamily: 'monospace' }}>{v.table}</code>
                  {v.column && <code style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>.{v.column}</code>}
                </div>
                <p style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>{v.violation}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{v.explanation}</p>
                <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#10b981', padding: '8px 10px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 6 }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>Fix:</span>
                  <span style={{ color: '#64748b' }}>{v.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ background: '#16161f', border: '1px solid #1e1e2a', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #1a1a24' }}>
            Additional Suggestions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-blue">{s.normalForm}</span>
                  <code style={{ fontSize: 11, color: '#7c6af7', fontFamily: 'monospace' }}>{s.table}</code>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>{s.message}</p>
                <p style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>→ {s.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {violations.length === 0 && suggestions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#3d3d55' }}>
          <ShieldCheck size={32} color="#10b981" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
          <p style={{ fontSize: 14, color: '#10b981' }}>No normalization violations</p>
        </div>
      )}
    </div>
  );
}
