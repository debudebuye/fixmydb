import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: 40, background: 'var(--surface-0)',
          color: 'var(--text-primary)', textAlign: 'center', gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={26} color="#f43f5e" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.6 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {this.state.error && (
            <pre style={{
              fontSize: 12, color: 'var(--text-secondary)', maxWidth: 500,
              padding: '12px 16px', borderRadius: 8,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              overflow: 'auto', textAlign: 'left', lineHeight: 1.5,
              fontFamily: 'monospace',
            }}>
              {this.state.error.message}
            </pre>
          )}
          <button onClick={() => window.location.reload()} className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '10px 20px', marginTop: 8 }}>
            <RefreshCw size={14} /> Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
