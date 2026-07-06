const { analyzeSchema } = require('./schemaAnalyzer');

function makeTable(name, columns, fks = [], pks = [], indexes = [], checks = [], constraints = []) {
  return {
    name,
    columns,
    foreignKeys: fks,
    primaryKeys: pks,
    indexes,
    checks,
    constraints,
  };
}

function makeColumn(name, type = 'INTEGER', opts = {}) {
  return {
    name,
    type,
    nullable: opts.nullable !== undefined ? opts.nullable : true,
    default: opts.default || null,
    isPrimary: opts.isPrimary || false,
    isUnique: opts.isUnique || false,
    references: opts.references || null,
    check: opts.check || null,
    enumValues: opts.enumValues || null,
    length: opts.length || undefined,
    scale: opts.scale || undefined,
  };
}

describe('analyzeSchema', () => {
  it('returns health score and issues for a schema without primary keys', () => {
    const schema = {
      tables: [makeTable('users', [makeColumn('id', 'INTEGER')], [], [])],
      relationships: [],
    };

    const result = analyzeSchema(schema);
    expect(result.healthScore).toBeLessThan(100);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('missing_primary_key');
  });

  it('detects nullable required columns', () => {
    const schema = {
      tables: [makeTable('orders', [
        makeColumn('id', 'SERIAL', { isPrimary: true }),
        makeColumn('user_id', 'INTEGER', { nullable: true }),
      ], [], ['id'])],
      relationships: [],
    };

    const result = analyzeSchema(schema);
    const nullableIssue = result.issues.find(i => i.type === 'nullable_required_column');
    expect(nullableIssue).toBeDefined();
    expect(nullableIssue.table).toBe('orders');
  });

  it('does not flag NOT NULL required columns', () => {
    const schema = {
      tables: [makeTable('orders', [
        makeColumn('id', 'SERIAL', { isPrimary: true }),
        makeColumn('user_id', 'INTEGER', { nullable: false }),
      ], [], ['id'])],
      relationships: [],
    };

    const result = analyzeSchema(schema);
    const nullableIssue = result.issues.find(i => i.type === 'nullable_required_column');
    expect(nullableIssue).toBeUndefined();
  });

  it('detects circular dependencies', () => {
    const schema = {
      tables: [
        makeTable('a', [makeColumn('id', 'SERIAL', { isPrimary: true })], [{ column: 'b_id', references: { table: 'b', column: 'id' } }], ['id']),
        makeTable('b', [makeColumn('id', 'SERIAL', { isPrimary: true })], [{ column: 'a_id', references: { table: 'a', column: 'id' } }], ['id']),
      ],
      relationships: [
        { from: 'a', fromColumn: 'b_id', to: 'b', toColumn: 'id' },
        { from: 'b', fromColumn: 'a_id', to: 'a', toColumn: 'id' },
      ],
    };

    const result = analyzeSchema(schema);
    const circularIssue = result.issues.find(i => i.type === 'circular_dependency');
    expect(circularIssue).toBeDefined();
  });

  it('recommends indexes on FK columns', () => {
    const schema = {
      tables: [makeTable('posts', [
        makeColumn('id', 'SERIAL', { isPrimary: true }),
        makeColumn('user_id', 'INTEGER', { nullable: false, references: { table: 'users', column: 'id' } }),
      ], [{ column: 'user_id', references: { table: 'users', column: 'id' } }], ['id'])],
      relationships: [{ from: 'posts', fromColumn: 'user_id', to: 'users', toColumn: 'id' }],
    };

    const result = analyzeSchema(schema);
    const indexRec = result.recommendations.find(r => r.type === 'missing_index');
    expect(indexRec).toBeDefined();
    expect(indexRec.column).toBe('user_id');
  });

  it('detects schema patterns like event_outbox', () => {
    const schema = {
      tables: [makeTable('event_outbox', [
        makeColumn('id', 'SERIAL', { isPrimary: true }),
        makeColumn('payload', 'JSONB'),
        makeColumn('created_at', 'TIMESTAMP'),
      ], [], ['id'])],
      relationships: [],
    };

    const result = analyzeSchema(schema);
    expect(result.patterns).toContain('event_outbox');
  });

  it('returns healthy schema for well-designed schema', () => {
    const schema = {
      tables: [makeTable('users', [
        makeColumn('id', 'SERIAL', { isPrimary: true }),
        makeColumn('email', 'VARCHAR(255)', { nullable: false, isUnique: true }),
        makeColumn('created_at', 'TIMESTAMP', { default: 'CURRENT_TIMESTAMP' }),
      ], [], ['id'], [], [], [{ type: 'unique', columns: ['email'], sql: 'UNIQUE (email)' }])],
      relationships: [],
    };

    const result = analyzeSchema(schema);
    expect(result.healthScore).toBeGreaterThanOrEqual(90);
  });
});
