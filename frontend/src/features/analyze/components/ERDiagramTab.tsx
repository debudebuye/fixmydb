import { useCallback, useRef } from 'react';
import {
  ReactFlow, Controls, Background, MiniMap,
  BackgroundVariant, useNodesState, useEdgesState,
  type Node, type Edge, Position, Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import type { ERNode, EREdge } from '../../../shared/types/schema';

function TableNode({ data }: { data: ERNode['data'] }) {
  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--border-strong)',
      borderRadius: 8, overflow: 'hidden', minWidth: 180,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        background: 'var(--surface-2)', borderBottom: '1px solid var(--border-strong)',
        padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#7c6af7' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{data.label}</span>
      </div>
      {data.columns.map((col, i) => (
        <div key={i} style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', fontSize: 11, fontFamily: 'monospace',
          borderBottom: '1px solid var(--border-subtle)',
          background: col.isPrimary ? 'rgba(253,230,138,0.03)' : 'transparent',
        }}>
          <Handle type="target" position={Position.Left} id={`${col.name}-t`}
            style={{ background: '#3d3d55', width: 6, height: 6, border: '1px solid #52526a' }} />
          <span style={{ width: 12, textAlign: 'center', fontSize: 10 }}>
            {col.isPrimary ? '🔑' : col.references ? '🔗' : ''}
          </span>
          <span style={{ flex: 1, color: col.isPrimary ? '#fde68a' : 'var(--text-secondary)' }}>{col.name}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{col.type.split('(')[0]}</span>
          <Handle type="source" position={Position.Right} id={`${col.name}-s`}
            style={{ background: '#3d3d55', width: 6, height: 6, border: '1px solid #52526a' }} />
        </div>
      ))}
    </div>
  );
}

const nodeTypes = { tableNode: TableNode };

export default function ERDiagramTab({ nodes, edges }: { nodes: ERNode[]; edges: EREdge[] }) {
  const [fn, , onNC] = useNodesState(nodes as unknown as Node[]);
  const [fe, , onEC] = useEdgesState(edges as unknown as Edge[]);
  const containerRef = useRef<HTMLDivElement>(null);

  const download = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: '#0d0d14',
        pixelRatio: 2,
      });
      const a = Object.assign(document.createElement('a'), {
        href: dataUrl,
        download: 'fixmydb-er-diagram.png',
      });
      a.click();
    } catch {
      // download failed silently
    }
  }, []);

  if (!nodes.length) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: 13 }}>
      No tables to display
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Visual representation of your database schema.</p>
        <button onClick={download} className="btn-primary" style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px',
        }}>
          <Download size={12} /> Download PNG
        </button>
      </div>
      <div ref={containerRef} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', height: 540 }}>
        <ReactFlow
          nodes={fn} edges={fe}
          onNodesChange={onNC} onEdgesChange={onEC}
          nodeTypes={nodeTypes}
          fitView fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ style: { stroke: 'var(--border-strong)', strokeWidth: 1.5 }, animated: false }}
          style={{ background: 'var(--surface-0)' }}
        >
          <Controls style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }} />
          <MiniMap nodeColor="var(--surface-2)" maskColor="rgba(10,10,15,0.8)"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8 }} />
          <Background color="var(--border)" gap={20} variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>
    </div>
  );
}
