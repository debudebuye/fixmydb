import { Link, useLocation } from 'react-router-dom';
import { Database, GitFork, Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from '../../theme';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ background: 'var(--surface-0)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border)',
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
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
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
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: active ? 'var(--surface-3)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                  border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
                }}>
                  {label}
                </Link>
              );
            })}
            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 8px' }} />
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              style={{
                width: 31, height: 31, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)', background: 'var(--surface-1)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="https://github.com/debudebuye/fixmydb"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                color: 'var(--text-muted)', textDecoration: 'none',
                border: '1px solid var(--border)', background: 'var(--surface-1)',
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
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
          <Zap size={12} color="#7c6af7" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            FixMyDB · Open Source · MIT License · 2026
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-soft)' }}>Like ESLint — but for database architecture.</p>
      </footer>
    </div>
  );
}
