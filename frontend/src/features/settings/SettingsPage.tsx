import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, KeyRound, CheckCircle2, XCircle, ExternalLink, Shield, Zap, Server, ArrowRight } from 'lucide-react';
import { PROVIDERS, getAIConfig, setAIConfig, clearAIConfig } from '../../shared/services/apiConfig';
import type { AIConfig } from '../../shared/services/apiConfig';

const S = { section: { maxWidth: 720, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

export default function SettingsPage() {
  const [config, setConfig] = useState<AIConfig | null>(() => getAIConfig());
  const [selectedProvider, setSelectedProvider] = useState<string>(() => getAIConfig()?.provider ?? 'openai');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(() => getAIConfig()?.model ?? '');
  const [saved, setSaved] = useState(false);

  const provider = PROVIDERS.find(p => p.id === selectedProvider)!;

  const handleProviderChange = (id: string) => {
    setSelectedProvider(id);
    const p = PROVIDERS.find(x => x.id === id)!;
    setSelectedModel(p.defaultModel);
    setApiKey('');
    setSaved(false);
  };

  const handleSave = () => {
    const p = PROVIDERS.find(x => x.id === selectedProvider)!;
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) return;
    const cfg: AIConfig = {
      provider: p.id,
      apiKey: trimmedKey,
      model: selectedModel || p.defaultModel,
      baseURL: p.baseURL,
      label: p.label,
    };
    setAIConfig(cfg);
    setConfig(cfg);
    setSaved(true);
    setApiKey('');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = () => {
    clearAIConfig();
    setConfig(null);
    setApiKey('');
    setSelectedProvider('openai');
    setSelectedModel('');
  };

  const canSave = apiKey.trim().length > 0;

  return (
    <div style={{ background: 'var(--surface-0)', color: 'var(--text-primary)', padding: '48px 0 80px' }}>
      <div style={S.section}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Sparkles size={22} color="#7c6af7" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            AI Provider Setup
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Connect your own AI provider for enhanced schema analysis. Your key stays in this browser tab — never stored on our server.
          </p>
        </div>

        {/* Active status */}
        {config && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 10, marginBottom: 24,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>AI configured</strong> — using{' '}
              <strong>{config.label}</strong> ({config.model}) for analysis.
            </div>
            <button onClick={handleRemove} style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              color: '#fb7185', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Remove config
            </button>
          </div>
        )}

        {/* Provider selection */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            Choose a provider
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {PROVIDERS.map(p => {
              const active = selectedProvider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 10,
                    background: active ? 'rgba(124,106,247,0.06)' : 'var(--surface-1)',
                    border: active ? '1px solid rgba(124,106,247,0.3)' : '1px solid var(--border)',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all 0.15s',
                    outline: 'none',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: active ? '5px solid #7c6af7' : '2px solid var(--border-strong)',
                    flexShrink: 0, transition: 'all 0.15s',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {p.desc} · {p.pricing}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: active ? '#7c6af7' : 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {active ? 'Selected' : 'Select'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model selection */}
        <div style={{
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: 'var(--surface-1-alt)', borderBottom: '1px solid var(--border)',
          }}>
            <Server size={14} color="#7c6af7" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Model — {provider.label}
            </span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {provider.models.map(m => (
                <label key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8,
                  background: selectedModel === m.id ? 'rgba(124,106,247,0.06)' : 'transparent',
                  cursor: 'pointer',
                }}>
                  <input
                    type="radio"
                    name="model"
                    value={m.id}
                    checked={selectedModel === m.id}
                    onChange={() => setSelectedModel(m.id)}
                    style={{ accentColor: '#7c6af7' }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* API Key input */}
        <div style={{
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: 'var(--surface-1-alt)', borderBottom: '1px solid var(--border)',
          }}>
            <KeyRound size={14} color="#7c6af7" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              API Key — {provider.label}
            </span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <label htmlFor="api-key-input" style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Enter your {provider.label} API key
            </label>
            <input
              id="api-key-input"
              type="password"
              placeholder={provider.keyPlaceholder}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text-primary)',
                fontSize: 13, fontFamily: 'monospace',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#7c6af7'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 8 }}>
              {provider.keyHint}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 1, padding: '11px 20px', borderRadius: 9,
              background: canSave ? 'linear-gradient(135deg, #7c6af7, #5e4ed4)' : 'var(--surface-3)',
              border: 'none', color: canSave ? '#fff' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, cursor: canSave ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {saved ? (
              <><CheckCircle2 size={15} /> Saved!</>
            ) : (
              <><KeyRound size={15} /> Save configuration</>
            )}
          </button>
          {config && (
            <button
              onClick={handleRemove}
              style={{
                padding: '11px 20px', borderRadius: 9,
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                color: '#fb7185', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <XCircle size={15} style={{ marginRight: 6 }} />
              Clear
            </button>
          )}
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 32 }}>
          {[
            { icon: <Shield size={15} color="#10b981" />, title: 'Session only', desc: 'Config stored in sessionStorage. Cleared when you close the tab.' },
            { icon: <Zap size={15} color="#10b981" />, title: 'Per-request', desc: 'Key sent to server only during analysis. Never persisted.' },
            { icon: <ExternalLink size={15} color="#10b981" />, title: 'Your provider', desc: `We call ${provider.label}'s API directly. No caching, no logging.` },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/analyze"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14, color: '#7c6af7', fontWeight: 600 }}>
            Go to Analyzer
            <ArrowRight size={14} />
          </Link>
          <span style={{ margin: '0 10px', color: 'var(--border-strong)' }}>·</span>
          <Link to="/security"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14, color: 'var(--text-muted)' }}>
            <Shield size={13} /> Data flow details
          </Link>
        </div>
      </div>
    </div>
  );
}
