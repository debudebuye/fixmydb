import { Link, useLocation } from 'react-router-dom';
import { Database, GitFork, Zap } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.85)',
        borderBottom: '1px solid #1e1e2a',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #7c6af7, #5e4ed4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(124,106,247,0.35)',
            }}>
              <Database size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
              FixMyDB
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#7c6af7',
              background: 'rgba(124,106,247,0.12)',
              border: '1px solid rgba(124,106,247,0.25)',
              borderRadius: 4, padding: '1px 6px', marginLeft: 2,
            }}>v1</span>
          </Link>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { to: '/', label: 'Home' },
              { to: '/analyze', label: 'Analyze' },
            ].map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                  color: active ? '#e2e8f0' : '#64748b',
                  background: active ? '#1d1d28' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                  border: active ? '1px solid #252533' : '1px solid transparent',
                }}>
                  {label}
                </Link>
              );
            })}
            <div style={{ width: 1, height: 18, background: '#1e1e2a', margin: '0 8px' }} />
            <a href="https://github.com/debudebuye/fixmydb"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                color: '#64748b', textDecoration: 'none',
                border: '1px solid #1e1e2a', background: '#111118',
                transition: 'all 0.15s',
              }}>
              <GitFork size={13} />
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>{children}</main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1e1e2a', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
          <Zap size={12} color="#7c6af7" />
          <span style={{ fontSize: 12, color: '#4a5568' }}>
            FixMyDB · Open Source · MIT License · 2026
          </span>
        </div>
        <p style={{ fontSize: 11, color: '#2d2d3a' }}>Like ESLint — but for database architecture.</p>
      </footer>
    </div>
  );
}
