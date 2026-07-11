import { Link, useLocation } from 'react-router-dom';
import { Database, GitFork, Moon, Sun, Sparkles, Shield, Download } from 'lucide-react';
import { useTheme } from '../theme';

interface NavBarProps {
  onMenuOpen: () => void;
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/settings', label: 'AI Setup', icon: Sparkles },
  { to: '/security', label: 'Security', icon: Shield },
];

export default function NavBar({ onMenuOpen }: NavBarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
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

        <button className="hamburger-btn"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          style={{
            width: 31, height: 31, borderRadius: 7,
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)', background: 'var(--surface-1)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
