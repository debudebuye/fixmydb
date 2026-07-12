import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

window.addEventListener('unhandledrejection', (e) => {
  if (import.meta.env.DEV) {
    console.warn('[dev] Unhandled promise rejection:', e.reason);
  }
  e.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
