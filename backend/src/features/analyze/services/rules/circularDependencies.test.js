const { run } = require('./circularDependencies');
const { makeTable, makeColumn } = require('./test-utils');

describe('circularDependencies', () => {
  it('detects circular dependency between two tables', () => {
    const context = {
      tables: [
        makeTable('a', [makeColumn('id', 'SERIAL', { isPrimary: true })], [{ column: 'b_id', references: { table: 'b', column: 'id' } }], ['id']),
        makeTable('b', [makeColumn('id', 'SERIAL', { isPrimary: true })], [{ column: 'a_id', references: { table: 'a', column: 'id' } }], ['id']),
      ],
      relationships: [
        { from: 'a', fromColumn: 'b_id', to: 'b', toColumn: 'id' },
        { from: 'b', fromColumn: 'a_id', to: 'a', toColumn: 'id' },
      ],
    };

    const result = run(context);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('circular_dependency');
  });

  it('returns empty for schema without circular dependencies', () => {
    const context = {
      tables: [
        makeTable('a', [makeColumn('id', 'SERIAL', { isPrimary: true })], [{ column: 'b_id', references: { table: 'b', column: 'id' } }], ['id']),
        makeTable('b', [makeColumn('id', 'SERIAL', { isPrimary: true })]),
      ],
      relationships: [
        { from: 'a', fromColumn: 'b_id', to: 'b', toColumn: 'id' },
      ],
    };

    const result = run(context);
    expect(result.issues).toBeUndefined();
  });

  it('handles empty tables', () => {
    const result = run({ tables: [], relationships: [] });
    expect(result.issues).toBeUndefined();
  });
});
