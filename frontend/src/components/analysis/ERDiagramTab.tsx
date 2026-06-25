import { useCallback } from 'react';
import {
  ReactFlow, Controls, Background, MiniMap,
  BackgroundVariant, useNodesState, useEdgesState,
  type Node, type Edge, Position, Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ERNode, EREdge } from '../../types/schema';

function TableNode({ data }: { data: ERNode['data'] }) {
  return (
    <div style={{
      background: '#111118', border: '1px solid #252533',
      borderRadius: 8, overflow: 'hidden', minWidth: 180,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        background: '#16161f', borderBottom: '1px solid #252533',
        padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#7c6af7' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>{data.label}</span>
      </div>
      {data.columns.map((col, i) => (
        <div key={i} style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', fontSize: 11, fontFamily: 'monospace',
          borderBottom: '1px solid #1a1a24',
          background: col.isPrimary ? 'rgba(253,230,138,0.03)' : 'transparent',
        }}>
          <Handle type="target" position={Position.Left} id={`${col.name}-t`}
            style={{ background: '#252533', width: 6, height: 6, border: '1px solid #3d3d55' }} />
          <span style={{ width: 12, textAlign: 'center', fontSize: 10 }}>
            {col.isPrimary ? '🔑' : col.references ? '🔗' : ''}
          </span>
          <span style={{ flex: 1, color: col.isPrimary ? '#fde68a' : '#94a3b8' }}>{col.name}</span>
          <span style={{ color: '#3d3d55', fontSize: 10 }}>{col.type.split('(')[0]}</span>
          <Handle type="source" position={Position.Right} id={`${col.name}-s`}
            style={{ background: '#252533', width: 6, height: 6, border: '1px solid #3d3d55' }} />
        </div>
      ))}
    </div>
  );
}

const nodeTypes = { tableNode: TableNode };

export default function ERDiagramTab({ nodes, edges }: { nodes: ERNode[]; edges: EREdge[] }) {
  const [fn, , onNC] = useNodesState(nodes as unknown as Node[]);
  const [fe, , onEC] = useEdgesState(edges as unknown as Edge[]);
  const onInit = useCallback(() => {}, []);

  if (!nodes.length) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#3d3d55', fontSize: 13 }}>
      No tables to display
    </div>
  );

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #1e1e2a', height: 540 }}>
      <ReactFlow
        nodes={fn} edges={fe}
        onNodesChange={onNC} onEdgesChange={onEC}
        onInit={onInit} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ style: { stroke: '#252533', strokeWidth: 1.5 }, animated: false }}
        style={{ background: '#0a0a0f' }}
      >
        <Controls style={{ background: '#111118', border: '1px solid #1e1e2a', borderRadius: 8 }} />
        <MiniMap nodeColor="#16161f" maskColor="rgba(10,10,15,0.8)"
          style={{ background: '#111118', border: '1px solid #1e1e2a', borderRadius: 8 }} />
        <Background color="#1e1e2a" gap={20} variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
