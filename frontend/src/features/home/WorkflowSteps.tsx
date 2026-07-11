const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

const STEPS = [
  { n: '1', label: 'Paste SQL or upload a .sql file' },
  { n: '2', label: 'Click Analyze Schema' },
  { n: '3', label: 'Review health score & issues' },
  { n: '4', label: 'Download optimized SQL' },
];

export default function WorkflowSteps() {
  return (
    <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 0', background: 'var(--surface-1-alt)' }}>
      <div style={S.section}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
          Workflow
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', marginBottom: 40 }}>
          From schema to insights in 4 steps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '18px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#7c6af7',
              }}>
                {step.n}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 4 }}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
