import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Info, KeyRound, ExternalLink } from 'lucide-react';
import { getAIConfig, clearAIConfig } from '../../shared/services/apiConfig';

const S = { section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties };

export default function BringYourOwnAi() {
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [, forceUpdate] = useState(0);
  const aiConfig = getAIConfig();
  const handleRemoveKey = () => { clearAIConfig(); forceUpdate(v => v + 1); };

  return (
    <section style={{ ...S.section, paddingBottom: 60 }}>
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color="#7c6af7" />
            Integrate your own AI <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional — for better results only)</span>
            <span
              onClick={() => setShowAiInfo(!showAiInfo)}
              style={{
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                color: 'var(--text-muted)', position: 'relative',
              }}
              title="How your API key is used"
            >
              <Info size={13} />
            </span>
          </div>
          {showAiInfo && (
            <div style={{
              marginTop: 10, padding: '12px 14px', borderRadius: 8,
              background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.15)',
              fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>How it works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>1. Your key is stored in <strong>sessionStorage</strong> — cleared when you close the tab</span>
                <span>2. When you analyze a schema, the key is sent to our server for that <strong>single request</strong></span>
                <span>3. The server uses it to call your <strong>chosen AI provider</strong> and returns the enhanced analysis</span>
                <span>4. Your key is <strong>never saved, logged, or stored</strong> on the server — discarded after the request</span>
              </div>
              <Link to="/security" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: '#7c6af7', fontWeight: 600, textDecoration: 'none' }}>
                Full data flow diagram →
              </Link>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: showAiInfo ? 10 : 0 }}>
            Bring your own AI provider (OpenAI, Groq, OpenRouter) for enhanced analysis. Your key stays in this browser tab — never stored on the server. <Link to="/settings" style={{ color: '#7c6af7', fontWeight: 600, textDecoration: 'none' }}>Configure now →</Link>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {aiConfig ? (
            <>
              <KeyRound size={14} color="#10b981" />
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>{aiConfig.label} active</span>
              <button onClick={handleRemoveKey}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                  color: '#fb7185', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Remove key
              </button>
            </>
          ) : (
            <Link to="/settings" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.25)',
              color: '#7c6af7', fontSize: 12, fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              <ExternalLink size={13} />
              Configure AI
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
