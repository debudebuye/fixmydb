import { useState, useCallback, useRef } from 'react';
import { LayoutDashboard, ShieldCheck, Zap, GitBranch, Network, Code2 } from 'lucide-react';
import type { AnalysisResult } from '../../../shared/types/schema';
import OverviewTab from './OverviewTab';
import NormalizationTab from './NormalizationTab';
import IndexesTab from './IndexesTab';
import RelationshipsTab from './RelationshipsTab';
import ERDiagramTab from './ERDiagramTab';
import SQLOutputTab from './SQLOutputTab';

interface Props { result: AnalysisResult; }

const TABS = [
  { id: 'overview',       label: 'Overview',       Icon: LayoutDashboard },
  { id: 'normalization',  label: 'Normalization',   Icon: ShieldCheck     },
  { id: 'indexes',        label: 'Indexes',         Icon: Zap             },
  { id: 'relationships',  label: 'Relationships',   Icon: GitBranch       },
  { id: 'er-diagram',     label: 'ER Diagram',      Icon: Network         },
  { id: 'sql-output',     label: 'SQL Output',      Icon: Code2           },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ResultsDashboard({ result }: Props) {
  const [active, setActive] = useState<TabId>('overview');
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = TABS.findIndex(t => t.id === active);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else {
      return;
    }

    e.preventDefault();
    setActive(TABS[nextIndex].id);
    const buttons = tabListRef.current?.querySelectorAll('[role="tab"]');
    (buttons?.[nextIndex] as HTMLElement)?.focus();
  }, [active]);

  const badge = (id: TabId) => {
    if (id === 'normalization') return result.normalization.violations.length || null;
    if (id === 'indexes')       return result.recommendations.length || null;
    if (id === 'relationships') return result.issues.filter(i => i.type === 'missing_foreign_key').length || null;
    return null;
  };

  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Tab bar */}
      <div ref={tabListRef} role="tablist" aria-label="Analysis results"
        onKeyDown={handleTabKeyDown}
        style={{
        display: 'flex', overflowX: 'auto',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1-alt)',
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id;
          const b  = badge(id);
          return (
            <button key={id} id={`tab-${id}`} role="tab" aria-selected={on} aria-controls={`tabpanel-${id}`}
              onClick={() => setActive(id)}
              className={on ? 'tab-active-line' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '11px 16px', fontSize: 12, fontWeight: on ? 600 : 500,
                color: on ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'color 0.15s',
                borderBottom: on ? '2px solid #7c6af7' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            >
              <Icon size={13} />
              {label}
              {b !== null && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: '#f43f5e', color: '#fff',
                  borderRadius: 99, padding: '0 5px', minWidth: 16, textAlign: 'center',
                }}>
                  {b > 9 ? '9+' : b}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <div role="tabpanel" id="tabpanel-overview"      aria-labelledby="tab-overview">{active === 'overview'      && <OverviewTab result={result} />}</div>
        <div role="tabpanel" id="tabpanel-normalization"  aria-labelledby="tab-normalization">{active === 'normalization' && <NormalizationTab normalization={result.normalization} />}</div>
        <div role="tabpanel" id="tabpanel-indexes"        aria-labelledby="tab-indexes">{active === 'indexes'       && <IndexesTab recommendations={result.recommendations} />}</div>
        <div role="tabpanel" id="tabpanel-relationships"  aria-labelledby="tab-relationships">{active === 'relationships' && <RelationshipsTab relationships={result.relationships} issues={result.issues} tables={result.tables} />}</div>
        <div role="tabpanel" id="tabpanel-er-diagram"     aria-labelledby="tab-er-diagram">{active === 'er-diagram'    && <ERDiagramTab nodes={result.erDiagram.nodes} edges={result.erDiagram.edges} />}</div>
        <div role="tabpanel" id="tabpanel-sql-output"     aria-labelledby="tab-sql-output">{active === 'sql-output'    && <SQLOutputTab sql={result.optimizedSQL} />}</div>
      </div>
    </div>
  );
}
