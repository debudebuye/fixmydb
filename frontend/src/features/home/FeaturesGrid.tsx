import { BarChart3, Shield, Zap, GitBranch, Network, Code2 } from 'lucide-react';

const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

const FEATURES = [
  { icon: <BarChart3 size={16} color="#7c6af7" />, title: 'Health Score', desc: 'Instant 0–100 schema quality score with per-issue breakdown.', tag: 'Analysis' },
  { icon: <Shield size={16} color="#10b981" />, title: 'Normalization', desc: 'Detect 1NF, 2NF, 3NF violations with fix recommendations.', tag: '1NF/2NF/3NF' },
  { icon: <Zap size={16} color="#f59e0b" />, title: 'Index Advisor', desc: 'Smart index suggestions based on column usage patterns.', tag: 'Performance' },
  { icon: <GitBranch size={16} color="#06b6d4" />, title: 'Relationships', desc: 'Detect missing FKs, circular deps, and weak references.', tag: 'Integrity' },
  { icon: <Network size={16} color="#a78bfa" />, title: 'ER Diagram', desc: 'Interactive ER diagram with zoom, pan, and auto-layout.', tag: 'Visual' },
  { icon: <Code2 size={16} color="#fb7185" />, title: 'SQL Generator', desc: 'Export optimized DDL for PostgreSQL or MySQL.', tag: 'Output' },
];

export default function FeaturesGrid() {
  return (
    <section style={{ ...S.section, paddingBottom: 80 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
          Features
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', marginBottom: 8 }}>
          Six analysis modules, zero config
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 480 }}>
          Drop in your schema and every module runs automatically. No setup, no plugins, no config files.
          Unlike other tools, FixMyDB delivers a full, cross-module schema review in one pass, with no manual tuning or hidden dependencies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{
            background: 'var(--surface-1)',
            padding: '20px 22px',
            transition: 'background 0.15s',
            cursor: 'default',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-1)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--surface-3)', border: '1px solid var(--border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </div>
              <span className="badge badge-gray">{f.tag}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
