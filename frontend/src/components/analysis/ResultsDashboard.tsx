import { useState } from 'react';
import { LayoutDashboard, ShieldCheck, Zap, GitBranch, Network, Code2 } from 'lucide-react';
import type { AnalysisResult } from '../../types/schema';
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

  const badge = (id: TabId) => {
    if (id === 'normalization') return result.normalization.violations.length || null;
    if (id === 'indexes')       return result.recommendations.length || null;
    if (id === 'relationships') return result.issues.filter(i => i.type === 'missing_foreign_key').length || null;
    return null;
  };

  return (
    <div style={{ background: '#111118', border: '1px solid #1e1e2a', borderRadius: 10, overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', overflowX: 'auto',
        borderBottom: '1px solid #1e1e2a',
        background: '#0d0d14',
      }}>
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id;
          const b  = badge(id);
          return (
            <button key={id} onClick={() => setActive(id)}
              className={on ? 'tab-active-line' : ''}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '11px 16px', fontSize: 12, fontWeight: on ? 600 : 500,
                color: on ? '#e2e8f0' : '#4a5568',
                background: 'transparent', border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'color 0.15s',
                borderBottom: on ? '2px solid #7c6af7' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.color = '#4a5568'; }}
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
        {active === 'overview'      && <OverviewTab result={result} />}
        {active === 'normalization' && <NormalizationTab normalization={result.normalization} />}
        {active === 'indexes'       && <IndexesTab recommendations={result.recommendations} />}
        {active === 'relationships' && <RelationshipsTab relationships={result.relationships} issues={result.issues} tables={result.tables} />}
        {active === 'er-diagram'    && <ERDiagramTab nodes={result.erDiagram.nodes} edges={result.erDiagram.edges} />}
        {active === 'sql-output'    && <SQLOutputTab sql={result.optimizedSQL} />}
      </div>
    </div>
  );
}
