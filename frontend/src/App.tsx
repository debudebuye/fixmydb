import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/components/Layout';
import ErrorBoundary from './shared/components/ErrorBoundary';
import HomePage from './features/home/HomePage';
import AnalyzePage from './features/analyze/AnalyzePage';
import SecurityPage from './features/security/SecurityPage';
import SettingsPage from './features/settings/SettingsPage';
import { ThemeProvider } from './shared/theme';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div style={{ background: 'var(--surface-0)', minHeight: '100vh' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
