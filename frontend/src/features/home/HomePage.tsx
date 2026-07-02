import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Zap, GitBranch, Shield, BarChart3, Code2, Network, CheckCircle2, ChevronRight, Users, Database, Activity, Sparkles, KeyRound, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedCounter from '../../shared/components/AnimatedCounter';
import { fetchStats } from '../../shared/services/api';
import { getAIConfig, clearAIConfig } from '../../shared/services/apiConfig';
import type { LiveStats } from '../../shared/services/api';

const S = {
  section: { maxWidth: 1100, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
};

const FEATURES = [
  { icon: <BarChart3 size={16} color="#7c6af7" />, title: 'Health Score', desc: 'Instant 0–100 schema quality score with per-issue breakdown.', tag: 'Analysis' },
  { icon: <Shield size={16} color="#10b981" />, title: 'Normalization', desc: 'Detect 1NF, 2NF, 3NF violations with fix recommendations.', tag: '1NF/2NF/3NF' },
  { icon: <Zap size={16} color="#f59e0b" />, title: 'Index Advisor', desc: 'Smart index suggestions based on column usage patterns.', tag: 'Performance' },
  { icon: <GitBranch size={16} color="#06b6d4" />, title: 'Relationships', desc: 'Detect missing FKs, circular deps, and weak references.', tag: 'Integrity' },
  { icon: <Network size={16} color="#a78bfa" />, title: 'ER Diagram', desc: 'Interactive ER diagram with zoom, pan, and auto-layout.', tag: 'Visual' },
  { icon: <Code2 size={16} color="#fb7185" />, title: 'SQL Generator', desc: 'Export optimized DDL for PostgreSQL or MySQL.', tag: 'Output' },
];

const STEPS = [
  { n: '1', label: 'Paste SQL or upload a .sql file' },
  { n: '2', label: 'Click Analyze Schema' },
  { n: '3', label: 'Review health score & issues' },
  { n: '4', label: 'Download optimized SQL' },
];

const USERS_LIST = ['Backend Engineers', 'DB Architects', 'Full-Stack Devs', 'Freelancers', 'Startups', 'Students', 'Senior Engineers', 'Tech Leads'];

export default function HomePage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [, forceUpdate] = useState(0);

  const aiConfig = getAIConfig();
  const handleRemoveKey = () => { clearAIConfig(); forceUpdate(v => v + 1); }; 

  useEffect(() => {
    const loadStats = async () => {
      try { setStats(await fetchStats()); } catch { /* backend may not be running */ }
    };
    loadStats();
    let interval: ReturnType<typeof setInterval>;
    const start = () => { interval = setInterval(loadStats, 10000); };
    const stop = () => { clearInterval(interval); };
    start();
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    return () => { stop(); document.removeEventListener('visibilitychange', stop); };
  }, []);

  return (
    <div style={{ background: 'var(--surface-0)', color: 'var(--text-primary)' }}>

      {/* ══════════════════════════════════ HERO ══════════════════════════════════ */}
      <section className="dot-grid" style={{ paddingTop: 80, paddingBottom: 60, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,106,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ ...S.section, textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 99,
            background: 'rgba(124,106,247,0.08)',
            border: '1px solid rgba(124,106,247,0.2)',
            marginBottom: 28, fontSize: 12, fontWeight: 500, color: '#a78bfa',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Open source · Free · No account required
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 20,
            color: 'var(--text-strong)',
          }}>
            The Database Schema<br />
            <span className="text-gradient">Reviewer for Developers</span>
          </h1>

          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Paste SQL, get an instant health score, normalization report, index recommendations, and ER diagram. No sign-up needed.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
              <Terminal size={14} />
              Analyze Schema
              <ArrowRight size={14} />
            </Link>
            <a href="https://github.com/debudebuye/fixmydb" target="_blank" rel="noopener noreferrer"
              className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ BRING YOUR OWN AI ════════════════════════════ */}
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

      {/* ══════════════════════════════ TERMINAL DEMO ════════════════════════════ */}
      <section style={{ ...S.section, paddingTop: 0, paddingBottom: 80 }}>
        <div style={{
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,106,247,0.08)',
        }}>
          {/* Window bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px',
            background: 'var(--surface-1-alt)', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'monospace' }}>
              fixmydb — analysis output
            </span>
          </div>

          {/* Fake terminal output */}
          <div style={{ padding: '20px 24px', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
            <div style={{ color: 'var(--text-secondary)' }}>$ fixmydb analyze schema.sql</div>
            <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>→ Parsing SQL schema...</div>
            <div style={{ color: 'var(--text-muted)' }}>→ Running analysis engine...</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>→ Generating recommendations...</div>

            {/* Result block */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', gap: 32, marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>SCHEMA SCORE</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}><AnimatedCounter value={78} duration={1500} /> <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/100</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>TABLES</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}><AnimatedCounter value={5} duration={1500} /></div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>ISSUES</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f43f5e' }}><AnimatedCounter value={4} duration={1500} /></div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>RECOMMENDATIONS</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}><AnimatedCounter value={6} duration={1500} /></div>
                </div>
              </div>

              {/* Issues list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { level: 'ERROR', color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', msg: 'orders.user_id — missing FOREIGN KEY constraint → users(id)' },
                  { level: 'WARN', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', msg: 'users.email — no index found, impacts authentication queries' },
                  { level: 'WARN', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', msg: 'orders — customer_name, customer_email violate 3NF' },
                  { level: 'INFO', color: '#a78bfa', bg: 'rgba(124,106,247,0.06)', border: 'rgba(124,106,247,0.15)', msg: 'products.sku — consider adding UNIQUE constraint' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '8px 12px', borderRadius: 6,
                    background: item.bg, border: `1px solid ${item.border}`,
                    fontFamily: 'monospace', fontSize: 12,
                  }}>
                    <span style={{ color: item.color, fontWeight: 700, minWidth: 40, paddingTop: 1 }}>{item.level}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ FEATURES ════════════════════════════════ */}
      <section style={{ ...S.section, paddingBottom: 80 }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
            Features
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', marginBottom: 8 }}>
            Six analysis modules, zero config
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 480 }}>
            Drop in your schema and every module runs automatically. No setup, no plugins, no config files.
            Unlike other tools, FixMyDB delivers a full, cross-module schema review in one pass, with no manual tuning or hidden dependencies.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: 'var(--surface-1)',
              padding: '20px 22px',
              transition: 'background 0.15s',
              cursor: 'default',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-1)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--surface-3)', border: '1px solid var(--border-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.icon}
                </div>
                <span className="badge badge-gray">{f.tag}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════ HOW IT WORKS ══════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 0', background: 'var(--surface-1-alt)' }}>
        <div style={S.section}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
            Workflow
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', marginBottom: 40 }}>
            From schema to insights in 4 steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '18px 20px',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#7c6af7',
                }}>
                  {step.n}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 4 }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ TARGET USERS ═════════════════════════════ */}
      <section style={{ ...S.section, padding: '64px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
          Who uses FixMyDB
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {USERS_LIST.map((u, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 7,
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              fontSize: 12, color: 'var(--text-secondary)',
            }}>
              <CheckCircle2 size={12} color="#10b981" />
              {u}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ LIVE STATS ════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface-1-alt)', padding: '48px 0' }}>
        <div style={S.section}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <Activity size={15} color="#7c6af7" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Live — updated in real-time
            </span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24,
          }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                <Users size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -1 }} />
                Total Users
              </div>
              <div style={{
                fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stats ? <AnimatedCounter value={stats.totalUsers} /> : '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>
                <Database size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -1 }} />
                Schemas Analyzed
              </div>
              <div style={{
                fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stats ? <AnimatedCounter value={stats.totalSchemasProcessed} /> : '—'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════ CTA ═══════════════════════════════════ */}
      <section style={{ background: 'var(--surface-1-alt)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7c6af7', letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>
            Get started
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', marginBottom: 12 }}>
            Run your first analysis
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.7 }}>
            Paste a CREATE TABLE statement and get a full schema review in under 5 seconds. No sign-up, no limits.
          </p>
          <Link to="/analyze" className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
            <Terminal size={14} />
            Open Analyzer
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
