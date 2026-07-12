import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Terminal } from 'lucide-react';
import SQLEditor from './components/SQLEditor';
import ResultsDashboard from './components/ResultsDashboard';
import ProcessFlow from '../../shared/components/ProcessFlow';
import { analyzeSchema, uploadSchemaFile, getExampleSchemas } from '../../shared/services/api';
import { addToHistory } from '../../shared/services/history';
import { getDeviceId } from '../../shared/services/device';
import { getAIConfig } from '../../shared/services/apiConfig';
import type { AnalysisResult, ExampleSchema } from '../../shared/types/schema';
import type { ProcessStep } from '../../shared/components/ProcessFlow';

export default function AnalyzePage() {
  const [sql, setSql] = useState('');
  const [dialect, setDialect] = useState('postgresql');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [examples, setExamples] = useState<ExampleSchema[]>([]);
  const [processStep, setProcessStep] = useState<ProcessStep>('input');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
  getExampleSchemas()
    .then(setExamples)
    .catch((err) => { if (import.meta.env.DEV) console.error('Failed to load example schemas:', err); });
}, []);

  // Simulate process steps during loading
  useEffect(() => {
    if (!isLoading) return;
    const t1 = setTimeout(() => setProcessStep('parsing'), 0);
    const t2 = setTimeout(() => setProcessStep('analyzing'), 400);
    const t3 = setTimeout(() => setProcessStep('scoring'), 900);
    const t4 = setTimeout(() => setProcessStep('generating'), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [isLoading]);

  // Reset step when loading finishes
  useEffect(() => {
    if (isLoading) return;
    const id = setTimeout(() => setProcessStep(result ? 'done' : 'input'), 0);
    return () => clearTimeout(id);
  }, [isLoading, result]);

  const handleAnalyze = async () => {
    if (!sql.trim()) { setValidationError('Please enter SQL before analyzing'); return; }
    setValidationError(null);
    setIsLoading(true); setError(null); setResult(null);
    setProcessStep('parsing');
    try {
      const aiConfig = getAIConfig();
      const data = await analyzeSchema(sql, dialect, getDeviceId(), aiConfig ?? undefined);
      setProcessStep('done');
      setResult(data);
      setIsLoading(false);
      addToHistory({
        healthScore: data.healthScore,
        tablesFound: data.meta.tablesFound,
        issuesCount: data.issues.length,
        recommendationsCount: data.recommendations.length,
        sqlPreview: sql.slice(0, 200),
        dialect,
      });
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      const message = raw.includes('ECONNREFUSED') || raw.includes('Network Error')
        ? 'Cannot reach the server. Please check your connection and try again.'
        : raw.includes('timeout')
          ? 'Request timed out. The server may be busy — please try again.'
          : 'Something went wrong. Please try again.';
      setError(message);
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsLoading(true); setError(null);
    try { const d = await uploadSchemaFile(files); setSql(d.sql); setIsLoading(false); }
    catch {
      setError('Failed to upload file. Please check the file and try again.');
      setIsLoading(false);
    }
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
          value={sql} onChange={v => { setSql(v); if (validationError) setValidationError(null); }}
          onAnalyze={handleAnalyze} onUpload={handleUpload}
          isLoading={isLoading} examples={examples}
          dialect={dialect} onDialectChange={setDialect}
        />

        {/* Validation error */}
        {validationError && (
          <div role="alert" style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <AlertCircle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Input required</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{validationError}</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" style={{
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
          <div aria-live="polite" style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 500, margin: '0 auto' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Analyzing schema…</div>
              <ProcessFlow currentStep={processStep} />
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div id="results" style={{ marginTop: 32, scrollMarginTop: 80 }}>
            {result.meta.aiError && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>AI enhancement failed</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {result.meta.aiError.startsWith('429') ? (
                      <>Free model provider is currently unavailable (overloaded or out of capacity). This is not a rate limit on your account — the provider's free tier is busy. <Link to="/settings" style={{ color: '#f59e0b', fontWeight: 600 }}>Try a different model or switch to Groq →</Link></>
                    ) : result.meta.aiError.startsWith('401') ? (
                      <>Your API key was rejected. <Link to="/settings" style={{ color: '#f59e0b', fontWeight: 600 }}>Check your AI provider configuration</Link> and ensure the key is valid and has access to the selected model.</>
                    ) : result.meta.aiError.startsWith('404') ? (
                      <>Model not found on this provider. <Link to="/settings" style={{ color: '#f59e0b', fontWeight: 600 }}>Check your AI provider configuration</Link> and select a valid model.</>
                    ) : (
                      <>AI enhancement failed. <Link to="/settings" style={{ color: '#f59e0b', fontWeight: 600 }}>Check your AI provider configuration</Link>. Analysis results are still available without AI insights.</>
                    )}
                  </div>
                </div>
              </div>
            )}
            <ResultsDashboard result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
