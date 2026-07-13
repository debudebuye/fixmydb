import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

function HeroSectionInner() {
  return (
    <section className="dot-grid" style={{ paddingTop: 80, paddingBottom: 60, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(124,106,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ ...S.section, textAlign: 'center', position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 99,
          background: 'rgba(124,106,247,0.08)',
          border: '1px solid rgba(124,106,247,0.2)',
          marginBottom: 28, fontSize: 12, fontWeight: 500, color: '#a78bfa',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Open source · Free · No account required
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20,
          color: 'var(--text-strong)',
        }}>
          The Database Schema<br />
          <span className="text-gradient">Reviewer for Developers</span>
        </h1>

        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Paste SQL, get an instant health score, normalization report, index recommendations, and ER diagram. No sign-up needed.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
            <Terminal size={14} />
            Analyze Schema
            <ArrowRight size={14} />
          </Link>
          <a href="https://github.com/debudebuye/fixmydb" target="_blank" rel="noopener noreferrer"
            className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSectionInner);
