import { Shield, KeyRound, Server, Globe, Lock, EyeOff, Database, CheckCircle2, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const S = {
  section: { maxWidth: 720, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
};

const steps = [
  {
    icon: <KeyRound size={18} color="#7c6af7" />,
    title: 'You enter your key',
    desc: 'Typed into the password field on the home page. Stored in sessionStorage — a browser tab-level storage that is automatically cleared when you close the tab.',
    detail: 'sessionStorage is not shared across tabs and never sent to servers automatically.',
  },
  {
    icon: <Send size={18} color="#f59e0b" />,
    title: 'Sent as a header',
    desc: 'When you click "Analyze Schema", your API key is sent via the X-AI-API-Key request header — not in the body. This keeps it out of proxy logs.',
    detail: 'The key is sent over HTTPS. No background requests, no polling, no telemetry.',
  },
  {
    icon: <Server size={18} color="#10b981" />,
    title: 'Server receives & forwards',
    desc: 'The FixMyDB server extracts the key from the X-AI-API-Key header. It creates a temporary OpenAI client instance in memory — the key is never written to disk, never logged, and never stored in any database.',
    detail: 'If no user key is provided, the server falls back to its own env key (if configured).',
  },
  {
    icon: <Globe size={18} color="#06b6d4" />,
    title: 'AI provider called once',
    desc: 'The server makes a single API call to your chosen AI provider (OpenAI, Groq, OpenRouter, or Google Gemini) using your key. Your SQL schema is sent for analysis. The response is returned to the server.',
    detail: 'Currently supported: OpenAI (gpt-4o-mini), Groq (Llama 3, Mixtral), OpenRouter (Llama 3, GPT-4o-mini), Google Gemini (Gemini 2.0 Flash).',
  },
  {
    icon: <Lock size={18} color="#7c6af7" />,
    title: 'Key discarded',
    desc: 'After the OpenAI response is received, the user-provided API key is immediately out of scope (JavaScript garbage collected). It is never persisted, logged, or retrievable after the request ends.',
    detail: 'No caching layer, no database write, no log file entry containing the key.',
  },
  {
    icon: <EyeOff size={18} color="#10b981" />,
    title: 'Result returned to you',
    desc: 'The enhanced analysis (AI summary, architecture notes, scalability advice) is sent back to your browser. Your key stays on your machine (sessionStorage) until you close the tab.',
    detail: 'You can click "Remove key" at any time to clear it from sessionStorage immediately.',
  },
];

export default function SecurityPage() {
  return (
    <div style={{ background: 'var(--surface-0)', color: 'var(--text-primary)', padding: '48px 0 80px' }}>
      <div style={S.section}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Shield size={22} color="#7c6af7" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            How your API key is handled
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Your privacy matters. Here is exactly what happens — and does not happen — when you bring your own AI provider API key (OpenAI, Groq, OpenRouter, or any OpenAI-compatible service).
          </p>
        </div>

        {/* Flow diagram */}
        <div style={{
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', marginBottom: 32,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: 'var(--surface-1-alt)', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6, fontFamily: 'monospace' }}>
              data flow — your API key
            </span>
          </div>

          <div style={{ padding: '24px 28px' }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16,
                paddingBottom: i < steps.length - 1 ? 24 : 0,
                position: 'relative',
              }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 20, top: 40, bottom: 0, width: 1,
                    background: 'var(--border)',
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1,
                }}>
                  {step.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
                    marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'rgba(124,106,247,0.12)', color: '#7c6af7',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>{i + 1}</span>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 4 }}>
                    {step.desc}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    {step.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { icon: <CheckCircle2 size={16} color="#10b981" />, title: 'Never stored', desc: 'Key is in-memory only during the request. No database writes.' },
            { icon: <CheckCircle2 size={16} color="#10b981" />, title: 'Never logged', desc: 'No console.log, no file logging, no error message contains the key.' },
            { icon: <CheckCircle2 size={16} color="#10b981" />, title: 'HTTPS only', desc: 'All communication between your browser and our server is encrypted.' },
            { icon: <CheckCircle2 size={16} color="#10b981" />, title: 'One API call', desc: 'Your key is used for exactly one OpenAI request, then discarded.' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 18px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Model info */}
        <div style={{
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden', marginBottom: 32,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: 'var(--surface-1-alt)', borderBottom: '1px solid var(--border)',
          }}>
            <Database size={14} color="#7c6af7" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Supported AI models
            </span>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              FixMyDB supports multiple AI providers. You configure which provider and model to use on the <Link to="/settings" style={{ color: '#7c6af7', fontWeight: 600, textDecoration: 'none' }}>AI Setup page</Link>.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Provider</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Default model</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Pricing</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>OpenAI</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>gpt-4o-mini</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: 12 }}>Paid (~$0.001/analysis). Must have access to GPT-4 class models.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>Groq</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>llama3-70b-8192</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: 12 }}>Free (rate-limited). Sign up at groq.com for a free API key.</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>OpenRouter</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>Llama 3.3 70B (:free)</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: 12 }}>Free & paid options. Append <code>:free</code> for free tier. Sign up at openrouter.ai.</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>Google Gemini</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>gemini-2.0-flash</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: 12 }}>Free tier via Google AI Studio. Get key at aistudio.google.com/apikey.</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 14, fontStyle: 'italic' }}>
              More providers and models will be supported in upcoming versions. Star us on GitHub to stay updated.
            </p>
          </div>
        </div>

        {/* What is NOT sent */}
        <div style={{
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 10, padding: '16px 20px', marginBottom: 32,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 8 }}>What is NOT sent to OpenAI</div>
          <ul style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 2, listStyle: 'none', padding: 0 }}>
            <li>— Your IP address is not forwarded to OpenAI (server proxies the request)</li>
            <li>— No cookies, session data, or browser fingerprints</li>
            <li>— No analytics, no tracking pixels, no telemetry</li>
            <li>— The server does not store or cache your SQL schema after analysis</li>
          </ul>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/analyze" className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
            Go to Analyzer
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}


