import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Zap, Sparkles, Shield, Sun, Moon, Download, GitFork, X } from 'lucide-react';
import { useTheme } from '../theme';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze', icon: Zap },
  { to: '/settings', label: 'AI Setup', icon: Sparkles },
  { to: '/security', label: 'Security', icon: Shield },
];

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div className={`mobile-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
        role="presentation"
      />
      <aside className={`mobile-nav${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="mobile-nav-header">
          <Link to="/" onClick={onClose}
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
          <button onClick={onClose}
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

        {DRAWER_LINKS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`mobile-nav-link${active ? ' active' : ''}`}
              onClick={onClose}
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
    </>
  );
}
