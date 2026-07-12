import { Activity, Users, Database, Download } from 'lucide-react';
import AnimatedCounter from '../../shared/components/AnimatedCounter';
import type { LiveStats } from '../../shared/services/api';

interface LiveStatsSectionProps {
  stats: LiveStats | null;
  unavailable?: boolean;
}

const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

export default function LiveStatsSection({ stats, unavailable }: LiveStatsSectionProps) {
  return (
    <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface-1-alt)', padding: '48px 0' }}>
      <div style={S.section}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Activity size={15} color="#7c6af7" />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Live — updated in real-time
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <StatCard icon={<Users size={13} />} label="Total Users"
            gradient="linear-gradient(135deg, #7c6af7, #a78bfa)"
            value={stats?.totalUsers ?? null}
          />
          <StatCard icon={<Database size={13} />} label="Schemas Analyzed"
            gradient="linear-gradient(135deg, #10b981, #34d399)"
            value={stats?.totalSchemasProcessed ?? null}
          />
          <StatCard icon={<Download size={13} />} label="Downloads"
            gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
            value={stats?.totalDownloads ?? null}
          />
        </div>
        {unavailable && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
            Live stats unavailable — backend may be offline
          </p>
        )}
      </div>
    </section>
  );
}

function StatCard({ icon, label, gradient, value }: { icon: React.ReactNode; label: string; gradient: string; value: number | null }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
        <span style={{ display: 'inline', marginRight: 6, verticalAlign: -1 }}>{icon}</span>
        {label}
      </div>
      <div style={{
        fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em',
        background: gradient,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {value !== null ? <AnimatedCounter value={value} /> : '—'}
      </div>
    </div>
  );
}
