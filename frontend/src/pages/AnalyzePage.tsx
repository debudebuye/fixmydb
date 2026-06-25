import { useState, useEffect } from 'react';
import { AlertCircle, Terminal } from 'lucide-react';
import SQLEditor from '../components/input/SQLEditor';
import ResultsDashboard from '../components/analysis/ResultsDashboard';
import { analyzeSchema, uploadSchemaFile, getExampleSchemas } from '../services/api';
import type { AnalysisResult, ExampleSchema } from '../types/schema';

export default function AnalyzePage() {
  const [sql, setSql] = useState('');
  const [dialect, setDialect] = useState('postgresql');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [examples, setExamples] = useState<ExampleSchema[]>([]);

  useEffect(() => { getExampleSchemas().then(setExamples).catch(() => {}); }, []);

  const handleAnalyze = async () => {
    if (!sql.trim()) return;
    setIsLoading(true); setError(null); setResult(null);
    try {
      const data = await analyzeSchema(sql, dialect);
      setResult(data);
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally { setIsLoading(false); }
  };

  const handleUpload = async (file: File) => {
    setIsLoading(true); setError(null);
    try { const d = await uploadSchemaFile(file); setSql(d.sql); }
    catch (err: any) { setError(err.response?.data?.error || 'Upload failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={{ background: 'var(--surface-0)', minHeight: '100vh', padding: '32px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Terminal size={15} color="#7c6af7" />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>
              Schema Analyzer
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 42 }}>
            Paste SQL or upload a file · Get instant health score, normalization report, and index recommendations
          </p>
        </div>

        <SQLEditor
          value={sql} onChange={setSql}
          onAnalyze={handleAnalyze} onUpload={handleUpload}
          isLoading={isLoading} examples={examples}
          dialect={dialect} onDialectChange={setDialect}
        />

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <AlertCircle size={15} color="#f43f5e" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fb7185' }}>Analysis failed</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{error}</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              {/* Spinner */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTopColor: '#7c6af7',
                animation: 'spin 0.7s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Running analysis…</div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div id="results" style={{ marginTop: 32, scrollMarginTop: 80 }}>
            <ResultsDashboard result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
