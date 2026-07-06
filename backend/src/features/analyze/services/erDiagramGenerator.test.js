const { generateERDiagram } = require('./erDiagramGenerator');

describe('generateERDiagram', () => {
  it('generates nodes for each table', () => {
    const schema = {
      tables: [
        { name: 'users', columns: [{ name: 'id', type: 'SERIAL', isPrimary: true, isUnique: false, nullable: false, references: null }], primaryKeys: ['id'], foreignKeys: [] },
        { name: 'posts', columns: [{ name: 'id', type: 'SERIAL', isPrimary: true, isUnique: false, nullable: false, references: null }], primaryKeys: ['id'], foreignKeys: [] },
      ],
      relationships: [],
    };

    const result = generateERDiagram(schema);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].id).toBe('users');
    expect(result.nodes[1].id).toBe('posts');
  });

  it('generates edges for each relationship', () => {
    const schema = {
      tables: [
        { name: 'users', columns: [], primaryKeys: ['id'], foreignKeys: [] },
        { name: 'posts', columns: [], primaryKeys: ['id'], foreignKeys: [] },
      ],
      relationships: [
        { from: 'posts', fromColumn: 'user_id', to: 'users', toColumn: 'id' },
      ],
    };

    const result = generateERDiagram(schema);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].source).toBe('posts');
    expect(result.edges[0].target).toBe('users');
  });

  it('positions nodes in a grid layout', () => {
    const schema = {
      tables: [
        { name: 'a', columns: [], primaryKeys: [], foreignKeys: [] },
        { name: 'b', columns: [], primaryKeys: [], foreignKeys: [] },
        { name: 'c', columns: [], primaryKeys: [], foreignKeys: [] },
        { name: 'd', columns: [], primaryKeys: [], foreignKeys: [] },
        { name: 'e', columns: [], primaryKeys: [], foreignKeys: [] },
      ],
      relationships: [],
    };

    const result = generateERDiagram(schema);
    expect(result.nodes).toHaveLength(5);
    // First row: 4 nodes
    expect(result.nodes[0].position.y).toBe(0);
    expect(result.nodes[3].position.y).toBe(0);
    // Second row starts
    expect(result.nodes[4].position.y).toBe(250);
  });
});
