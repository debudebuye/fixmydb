import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import './index.css';

function App() {
  return (
    <Router>
      <div style={{ background: '#060910', minHeight: '100vh' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
