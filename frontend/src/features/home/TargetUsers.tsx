import { CheckCircle2 } from 'lucide-react';

const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

const USERS_LIST = ['Backend Engineers', 'DB Architects', 'Full-Stack Devs', 'Freelancers', 'Startups', 'Students', 'Senior Engineers', 'Tech Leads'];

export default function TargetUsers() {
  return (
    <section style={{ ...S.section, padding: '64px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
        Who uses FixMyDB
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {USERS_LIST.map((u, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 7,
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--text-secondary)',
          }}>
            <CheckCircle2 size={12} color="#10b981" />
            {u}
          </div>
        ))}
      </div>
    </section>
  );
}
