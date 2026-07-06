import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, GitFork, Moon, Sun, Zap, Shield, Sparkles, WifiOff, Heart, Copy, Check, Menu, X, Download } from 'lucide-react';
import { useTheme } from '../theme';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [offline, setOffline] = useState(!navigator.onLine);
  const [copied, setCopied] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(import.meta.env.VITE_BINANCE_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <div style={{ background: 'var(--surface-0)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-to-content">Skip to content</a>

      {offline && (
        <div role="alert" style={{
          padding: '8px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600,
          background: 'rgba(245,158,11,0.12)', borderBottom: '1px solid rgba(245,158,11,0.25)',
          color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <WifiOff size={14} /> You are offline — analysis requires an internet connection
        </div>
      )}
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

          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { to: '/', label: 'Home' },
              { to: '/analyze', label: 'Analyze' },
              { to: '/settings', label: 'AI Setup', icon: Sparkles },
              { to: '/security', label: 'Security', icon: Shield },
            ].map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: active ? 'var(--surface-3)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                  border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {Icon && <Icon size={13} />}
                  {label}
                </Link>
              );
            })}
            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 8px' }} />
            <a href="https://github.com/debudebuye/fixmydb/releases"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                color: '#7c6af7', textDecoration: 'none',
                border: '1px solid rgba(124,106,247,0.3)', background: 'rgba(124,106,247,0.08)',
                transition: 'all 0.15s',
              }}>
              <Download size={13} />
              Download
            </a>
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

          {/* Hamburger */}
          <button className="hamburger-btn"
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation menu"
            style={{
              width: 31, height: 31, borderRadius: 7,
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)', background: 'var(--surface-1)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`mobile-overlay${mobileMenu ? ' open' : ''}`}
        onClick={() => setMobileMenu(false)}
        role="presentation"
      />

      {/* Mobile nav drawer */}
      <aside className={`mobile-nav${mobileMenu ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="mobile-nav-header">
          <Link to="/" onClick={() => setMobileMenu(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, #7c6af7, #5e4ed4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Database size={12} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              FixMyDB
            </span>
          </Link>
          <button onClick={() => setMobileMenu(false)}
            aria-label="Close navigation menu"
            style={{
              width: 28, height: 28, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              cursor: 'pointer',
            }}>
            <X size={14} />
          </button>
        </div>

        {[
          { to: '/', label: 'Home' },
          { to: '/analyze', label: 'Analyze', icon: Zap },
          { to: '/settings', label: 'AI Setup', icon: Sparkles },
          { to: '/security', label: 'Security', icon: Shield },
        ].map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`mobile-nav-link${active ? ' active' : ''}`}
              onClick={() => setMobileMenu(false)}
            >
              {Icon && <Icon size={15} />}
              {label}
            </Link>
          );
        })}

        <div className="mobile-nav-divider" />

        <button onClick={() => { toggleTheme(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 7,
            fontSize: 14, fontWeight: 500,
            color: 'var(--text-muted)', cursor: 'pointer',
            background: 'transparent', border: 'none', width: '100%', textAlign: 'left',
            transition: 'all 0.15s',
          }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <a href="https://github.com/debudebuye/fixmydb/releases"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 7, fontSize: 14, fontWeight: 500,
            color: '#7c6af7', textDecoration: 'none',
            background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.15)',
            transition: 'all 0.15s',
          }}>
          <Download size={15} />
          Download Desktop App
        </a>

        <a href="https://github.com/debudebuye/fixmydb"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 7, fontSize: 14, fontWeight: 500,
            color: 'var(--text-muted)', textDecoration: 'none',
            transition: 'all 0.15s',
          }}>
          <GitFork size={15} />
          GitHub
        </a>

        <div className="mobile-nav-footer">
          <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center' }}>
            FixMyDB · v1 · MIT
          </p>
        </div>
      </aside>

      <main id="main-content" style={{ flex: 1 }}>{children}</main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
          <Zap size={12} color="#7c6af7" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            FixMyDB · Open Source · MIT License · 2026
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-soft)' }}>Like ESLint — but for database architecture.</p>
        <div style={{ marginTop: 10 }}>
          <a href="https://github.com/debudebuye/fixmydb/releases"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: '#7c6af7', fontWeight: 500, textDecoration: 'none',
              padding: '4px 10px', borderRadius: 5,
              background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.15)',
            }}>
            <Download size={11} />
            Download Desktop App
          </a>
        </div>
        {import.meta.env.VITE_BINANCE_ID && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Heart size={12} color="#f43f5e" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Support FixMyDB</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              If this tool helped you, consider buying me a coffee. Every bit keeps the project alive and improving.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>Binance Pay ID:</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '0.02em', userSelect: 'all' }}>
                {import.meta.env.VITE_BINANCE_ID}
              </span>
              <button onClick={copyId} title="Copy ID"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', fontSize: 11, fontWeight: 500,
                  background: copied ? 'rgba(34,197,94,0.12)' : 'var(--surface-1)',
                  border: '1px solid var(--border)', borderRadius: 5,
                  color: copied ? '#22c55e' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
