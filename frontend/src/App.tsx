import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/components/Layout';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { ThemeProvider } from './shared/theme';
import './index.css';

const HomePage = lazy(() => import('./features/home/HomePage'));
const AnalyzePage = lazy(() => import('./features/analyze/AnalyzePage'));
const SecurityPage = lazy(() => import('./features/security/SecurityPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading...</div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-faint)' }}>404</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Page not found</div>
      <a href="/" style={{ fontSize: 13, color: '#7c6af7', fontWeight: 600, textDecoration: 'none' }}>
        Go home
      </a>
    </div>
  );
}

function PageBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div style={{ background: 'var(--surface-0)', minHeight: '100vh' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<PageBoundary><HomePage /></PageBoundary>} />
                <Route path="/analyze" element={<PageBoundary><AnalyzePage /></PageBoundary>} />
                <Route path="/security" element={<PageBoundary><SecurityPage /></PageBoundary>} />
                <Route path="/settings" element={<PageBoundary><SettingsPage /></PageBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
