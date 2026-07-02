import { AlertCircle, CheckCircle2, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import HealthScore from '../../../shared/components/HealthScore';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import IssueBadge from '../../../shared/components/IssueBadge';
import type { AnalysisResult } from '../../../shared/types/schema';

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) => (
  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.04em', marginBottom: 4 }}>
      {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
    </div>
    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{sub}</div>
  </div>
);

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
      {icon}
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
    </div>
    {children}
  </div>
);

export default function OverviewTab({ result }: { result: AnalysisResult }) {
  const { healthScore, summary, issues, recommendations, meta } = result;
  const high = issues.filter(i => i.severity === 'high').length;
  const med  = issues.filter(i => i.severity === 'medium').length;
  const low  = issues.filter(i => i.severity === 'low').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'start' }}>
        <HealthScore score={healthScore} />
        <Row>
          <StatCard label="Tables" value={meta.tablesFound} sub={`${meta.relationshipsFound} relationships`} color="#7c6af7" />
          <StatCard label="Issues" value={issues.length} sub={`${high} high · ${med} med · ${low} low`} color={issues.length > 0 ? '#f43f5e' : '#10b981'} />
          <StatCard label="Optimizations" value={recommendations.length} sub="available" color="#10b981" />
          <StatCard label="Norm. Score" value={`${summary.normalizationScore}`} sub="out of 100" color="#f59e0b" />
        </Row>
      </div>

      {/* Summary */}
      <Section title={meta.aiEnhanced ? 'AI-Enhanced Analysis' : 'Analysis Summary'}
        icon={meta.aiEnhanced ? <Sparkles size={14} color="#7c6af7" /> : <TrendingUp size={14} color="#7c6af7" />}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{summary.overview}</p>
        {summary.scalabilityNotes && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Scalability note: </span>
            {summary.scalabilityNotes}
          </p>
        )}
      </Section>

      {/* Issues */}
      {issues.length === 0 ? (
        <Section title="Issues (0)" icon={<CheckCircle2 size={14} color="#10b981" />}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No issues found — your schema looks clean.</span>
          </div>
        </Section>
      ) : (
        <Section title={`Issues (${issues.length})`} icon={<AlertCircle size={14} color="#f43f5e" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {issues.map((issue, i) => {
              const colors: Record<string, { bg: string; border: string }> = {
                high:   { bg: 'rgba(244,63,94,0.06)',  border: 'rgba(244,63,94,0.18)'  },
                medium: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)' },
                low:    { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.18)' },
              };
              const c = colors[issue.severity] || colors.low;
              return (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 7,
                  background: c.bg, border: `1px solid ${c.border}`,
                }}>
                  <IssueBadge severity={issue.severity} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: issue.recommendation ? 4 : 0 }}>{issue.message}</div>
                    {issue.recommendation && (
                      <code style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace', display: 'block', lineHeight: 1.5 }}>
                        {issue.recommendation}
                      </code>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Architecture recommendations */}
      {summary.architectureNotes.length > 0 && (
        <Section title="Architecture Recommendations" icon={<Lightbulb size={14} color="#f59e0b" />}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
            {summary.architectureNotes.map((note, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ color: '#7c6af7', fontWeight: 700, marginTop: 1 }}>→</span>
                {note}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
