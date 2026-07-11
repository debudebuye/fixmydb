import AnimatedCounter from '../../shared/components/AnimatedCounter';

const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

const ISSUES = [
  { level: 'ERROR', color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', msg: 'orders.user_id — missing FOREIGN KEY constraint → users(id)' },
  { level: 'WARN', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', msg: 'users.email — no index found, impacts authentication queries' },
  { level: 'WARN', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', msg: 'orders — customer_name, customer_email violate 3NF' },
  { level: 'INFO', color: '#a78bfa', bg: 'rgba(124,106,247,0.06)', border: 'rgba(124,106,247,0.15)', msg: 'products.sku — consider adding UNIQUE constraint' },
];

export default function TerminalDemo() {
  return (
    <section style={{ ...S.section, paddingTop: 0, paddingBottom: 80 }}>
      <div style={{
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,106,247,0.08)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          background: 'var(--surface-1-alt)', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'monospace' }}>
            fixmydb — analysis output
          </span>
        </div>

        <div style={{ padding: '20px 24px', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
          <div style={{ color: 'var(--text-secondary)' }}>$ fixmydb analyze schema.sql</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>→ Parsing SQL schema...</div>
          <div style={{ color: 'var(--text-muted)' }}>→ Running analysis engine...</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>→ Generating recommendations...</div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', gap: 32, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>SCHEMA SCORE</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}><AnimatedCounter value={78} duration={1500} /> <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/100</span></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>TABLES</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}><AnimatedCounter value={5} duration={1500} /></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>ISSUES</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f43f5e' }}><AnimatedCounter value={4} duration={1500} /></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>RECOMMENDATIONS</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}><AnimatedCounter value={6} duration={1500} /></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ISSUES.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 12px', borderRadius: 6,
                  background: item.bg, border: `1px solid ${item.border}`,
                  fontFamily: 'monospace', fontSize: 12,
                }}>
                  <span style={{ color: item.color, fontWeight: 700, minWidth: 40, paddingTop: 1 }}>{item.level}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
