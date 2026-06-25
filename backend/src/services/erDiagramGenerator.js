/**
 * Generate ER Diagram data for React Flow
 */

function generateERDiagram(schema) {
  const { tables, relationships } = schema;
  const nodes = [];
  const edges = [];

  // Generate nodes for each table
  tables.forEach((table, index) => {
    const x = (index % 4) * 350;
    const y = Math.floor(index / 4) * 250;

    nodes.push({
      id: table.name,
      type: 'tableNode',
      position: { x, y },
      data: {
        label: table.name,
        columns: table.columns.map(col => ({
          name: col.name,
          type: col.type,
          isPrimary: col.isPrimary,
          isUnique: col.isUnique,
          nullable: col.nullable,
          references: col.references,
        })),
        primaryKeys: table.primaryKeys,
        foreignKeys: table.foreignKeys,
      },
    });
  });

  // Generate edges for relationships
  relationships.forEach((rel, index) => {
    edges.push({
      id: `edge-${index}`,
      source: rel.from,
      target: rel.to,
      type: 'smoothstep',
      animated: false,
      label: `${rel.fromColumn} → ${rel.toColumn}`,
      markerEnd: { type: 'arrowclosed' },
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });
  });

  return { nodes, edges };
}

module.exports = { generateERDiagram };
