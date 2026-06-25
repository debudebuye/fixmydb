import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Upload, Play, RotateCcw, ChevronDown, Loader2 } from 'lucide-react';
import type { ExampleSchema } from '../../types/schema';

interface Props {
  value: string; onChange: (v: string) => void;
  onAnalyze: () => void; onUpload: (f: File) => void;
  isLoading: boolean; examples: ExampleSchema[];
  dialect: string; onDialectChange: (d: string) => void;
}

const PLACEHOLDER = `-- Paste your SQL schema here
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  name  VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER,
  total   DECIMAL(10,2),
  status  VARCHAR(50)
);`;

export default function SQLEditor({ value, onChange, onAnalyze, onUpload, isLoading, examples, dialect, onDialectChange }: Props) {
  const [showExamples, setShowExamples] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0]; if (f) onUpload(f);
  };

  return (
    <div style={{
      background: '#111118', border: `1px solid ${dragging ? '#7c6af7' : '#1e1e2a'}`,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      transition: 'border-color 0.15s',
    }}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
    >
      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
        padding: '10px 14px', borderBottom: '1px solid #1e1e2a',
        background: '#0d0d14',
      }}>
        {/* Dialect */}
        <div style={{
          display: 'flex', borderRadius: 7, overflow: 'hidden',
          border: '1px solid #1e1e2a', background: '#111118',
        }}>
          {['postgresql', 'mysql'].map(d => (
            <button key={d} onClick={() => onDialectChange(d)}
              style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: dialect === d ? '#7c6af7' : 'transparent',
                color: dialect === d ? '#fff' : '#4a5568',
              }}>
              {d === 'postgresql' ? 'PostgreSQL' : 'MySQL'}
            </button>
          ))}
        </div>

        {/* Upload */}
        <button onClick={() => fileRef.current?.click()} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid #1e1e2a',
          borderRadius: 6, color: '#4a5568', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#2d2d3a'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4a5568'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e1e2a'; }}
        >
          <Upload size={12} /> Upload .sql
        </button>
        <input ref={fileRef} type="file" accept=".sql,.txt,.json" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) { onUpload(f); e.target.value = ''; } }} />

        {/* Examples dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowExamples(s => !s)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', fontSize: 12, fontWeight: 500,
            background: 'transparent', border: '1px solid #1e1e2a',
            borderRadius: 6, color: '#4a5568', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4a5568'; }}
          >
            Examples <ChevronDown size={11} style={{ transform: showExamples ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {showExamples && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              width: 260, background: '#111118', border: '1px solid #1e1e2a',
              borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 20, overflow: 'hidden',
            }}>
              {examples.map(ex => (
                <button key={ex.id} onClick={() => { onChange(ex.sql); setShowExamples(false); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: 'transparent', border: 'none', borderBottom: '1px solid #1a1a24',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#16161f'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: '#4a5568' }}>{ex.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear */}
        <button onClick={() => onChange('')} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid #1e1e2a',
          borderRadius: 6, color: '#4a5568', cursor: 'pointer',
        }}>
          <RotateCcw size={11} /> Clear
        </button>

        <div style={{ flex: 1 }} />

        {/* Analyze button */}
        <button onClick={onAnalyze} disabled={!value.trim() || isLoading} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', fontSize: 13, fontWeight: 600,
          background: isLoading ? '#2d2d3a' : 'linear-gradient(135deg, #7c6af7, #6356d4)',
          color: isLoading ? '#4a5568' : '#fff',
          border: '1px solid rgba(124,106,247,0.3)',
          borderRadius: 7, cursor: !value.trim() || isLoading ? 'not-allowed' : 'pointer',
          opacity: !value.trim() ? 0.4 : 1,
          boxShadow: isLoading ? 'none' : '0 0 16px rgba(124,106,247,0.25)',
          transition: 'all 0.2s',
        }}>
          {isLoading
            ? <><Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> Analyzing…</>
            : <><Play size={12} /> Analyze Schema</>
          }
        </button>
      </div>

      {/* ── Editor ── */}
      <Editor
        height="400px"
        language="sql"
        value={value || PLACEHOLDER}
        onChange={v => onChange(v || '')}
        theme="vs-dark"
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          overviewRulerLanes: 0,
          lineDecorationsWidth: 4,
        }}
      />

      {/* ── Footer hint ── */}
      <div style={{
        padding: '6px 14px', fontSize: 11, color: '#2d2d3a',
        borderTop: '1px solid #1a1a24', background: '#0d0d14',
        fontFamily: 'monospace',
      }}>
        drag & drop .sql file to load · ctrl+enter to analyze
      </div>
    </div>
  );
}
