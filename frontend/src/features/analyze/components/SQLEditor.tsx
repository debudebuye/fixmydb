import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Upload, Play, RotateCcw, ChevronDown, Loader2, ClipboardPaste } from 'lucide-react';
import type { ExampleSchema } from '../../../shared/types/schema';
import { useTheme } from '../../../shared/theme';

interface Props {
  value: string; onChange: (v: string) => void;
  onAnalyze: () => void; onUpload: (f: File) => void;
  isLoading: boolean; examples: ExampleSchema[];
  dialect: string; onDialectChange: (d: string) => void;
}

export default function SQLEditor({ value, onChange, onAnalyze, onUpload, isLoading, examples, dialect, onDialectChange }: Props) {
  const [showExamples, setShowExamples] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0]; if (f) onUpload(f);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) onChange(text);
    } catch {
      // Clipboard access can be blocked by the browser unless triggered by user action.
    }
  };

  return (
    <div style={{
      background: 'var(--surface-1)', border: `1px solid ${dragging ? '#7c6af7' : 'var(--border)'}`,
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
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1-alt)',
      }}>
        {/* Dialect */}
        <div style={{
          display: 'flex', borderRadius: 7, overflow: 'hidden',
          border: '1px solid var(--border)', background: 'var(--surface-1)',
        }}>
          {['postgresql', 'mysql'].map(d => (
            <button key={d} onClick={() => onDialectChange(d)}
              style={{
                padding: '4px 12px', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: dialect === d ? '#7c6af7' : 'transparent',
                color: dialect === d ? '#fff' : 'var(--text-muted)',
              }}>
              {d === 'postgresql' ? 'PostgreSQL' : 'MySQL'}
            </button>
          ))}
        </div>

        {/* Upload */}
        <button onClick={() => fileRef.current?.click()} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          <Upload size={12} /> Upload .sql
        </button>
        <input ref={fileRef} type="file" accept=".sql,.txt,.json" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) { onUpload(f); e.target.value = ''; } }} />

        {/* Paste */}
        <button onClick={handlePaste} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
        >
          <ClipboardPaste size={12} /> Paste
        </button>

        {/* Examples dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowExamples(s => !s)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', fontSize: 12, fontWeight: 500,
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            Examples <ChevronDown size={11} style={{ transform: showExamples ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {showExamples && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              width: 260, background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 20, overflow: 'hidden',
            }}>
              {examples.map(ex => (
                <button key={ex.id} onClick={() => { onChange(ex.sql); setShowExamples(false); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ex.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear */}
        <button onClick={() => onChange('')} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          <RotateCcw size={11} /> Clear
        </button>

        <div style={{ flex: 1 }} />

        {/* Analyze button */}
        <button onClick={onAnalyze} disabled={!value.trim() || isLoading} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', fontSize: 13, fontWeight: 600,
          background: isLoading ? 'var(--border-bright)' : 'linear-gradient(135deg, #7c6af7, #6356d4)',
          color: isLoading ? 'var(--text-muted)' : '#fff',
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
      <div style={{ position: 'relative' }}>
        {!value && (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 76,
            right: 24,
            zIndex: 2,
            pointerEvents: 'none',
            color: 'var(--text-faint)',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 1.7,
          }}>
            Paste or upload your CREATE TABLE SQL schema here. Use Examples to load a sample schema.
          </div>
        )}
        <Editor
          height="400px"
          language="sql"
          value={value}
          onChange={v => onChange(v || '')}
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
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
      </div>

      {/* ── Footer hint ── */}
      <div style={{
        padding: '6px 14px', fontSize: 11, color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-1-alt)',
        fontFamily: 'monospace',
      }}>
        drag & drop .sql file to load · ctrl+enter to analyze
      </div>
    </div>
  );
}
