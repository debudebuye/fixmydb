import { Link } from 'react-router-dom';
import { Terminal, ChevronRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section style={{ background: 'var(--surface-1-alt)', padding: '64px 24px' }}>
      <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>
          Get started
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', marginBottom: 12 }}>
          Run your first analysis
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.7 }}>
          Paste a CREATE TABLE statement and get a full schema review in under 5 seconds. No sign-up, no limits.
        </p>
        <Link to="/analyze" className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
          <Terminal size={14} />
          Open Analyzer
          <ChevronRight size={14} />
        </Link>
      </div>
    </section>
  );
}
