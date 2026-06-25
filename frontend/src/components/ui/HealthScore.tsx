interface Props { score: number; }

function cfg(score: number) {
  if (score >= 85) return { label: 'Excellent', color: '#10b981', track: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.2)' };
  if (score >= 70) return { label: 'Good',      color: '#7c6af7', track: 'rgba(124,106,247,0.15)', glow: 'rgba(124,106,247,0.2)' };
  if (score >= 50) return { label: 'Needs Work', color: '#f59e0b', track: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.2)' };
  return                  { label: 'Critical',  color: '#f43f5e', track: 'rgba(244,63,94,0.15)', glow: 'rgba(244,63,94,0.2)' };
}

export default function HealthScore({ score }: Props) {
  const { label, color, track, glow } = cfg(score);
  const r = 42, circ = 2 * Math.PI * r;
  const offset = ((100 - score) / 100) * circ;

  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: `0 0 24px ${glow}`,
    }}>
      <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 12 }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.05em' }}>{score}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Health Score</span>
    </div>
  );
}
