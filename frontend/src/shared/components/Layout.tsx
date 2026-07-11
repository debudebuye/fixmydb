import { useState } from 'react';
import OfflineBanner from './OfflineBanner';
import NavBar from './NavBar';
import MobileDrawer from './MobileDrawer';
import Footer from './Footer';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div style={{ background: 'var(--surface-0)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <OfflineBanner />
      <NavBar onMenuOpen={() => setMobileMenu(true)} />
      <MobileDrawer isOpen={mobileMenu} onClose={() => setMobileMenu(false)} />
      <main id="main-content" style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
