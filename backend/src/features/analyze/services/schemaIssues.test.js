const {
  shouldSuggestForeignKey,
  shouldRequireNonNull,
  shouldSuggestDomainConstraint,
  shouldSuggestNumericType,
  shouldSuggestTimestampType,
  shouldRecommendCompositeIndex,
  getCompositeIndexColumns,
  detectCircularDependencies,
} = require('./schemaIssues');

function makeTable(name, columns, fks = [], pks = [], indexes = []) {
  return { name, columns, foreignKeys: fks, primaryKeys: pks, indexes, checks: [], constraints: [] };
}

function makeColumn(name, type = 'INTEGER', opts = {}) {
  return {
    name, type,
    nullable: opts.nullable !== undefined ? opts.nullable : true,
    default: opts.default || null,
    isPrimary: opts.isPrimary || false,
    isUnique: opts.isUnique || false,
    references: opts.references || null,
    check: opts.check || null,
  };
}

describe('shouldSuggestForeignKey', () => {
  it('suggests FK for _id columns', () => {
    expect(shouldSuggestForeignKey('user_id', [], 'system')).toBe(true);
  });

  it('skips known generic IDs', () => {
    expect(shouldSuggestForeignKey('reference_id', [], 'system')).toBe(false);
    expect(shouldSuggestForeignKey('aggregate_id', [], 'system')).toBe(false);
  });

  it('skips polymorphic tables', () => {
    expect(shouldSuggestForeignKey('target_id', ['polymorphic_reference'], 'system')).toBe(false);
  });

  it('skips password_hash', () => {
    expect(shouldSuggestForeignKey('password_hash', [], 'system')).toBe(false);
  });

  it('skips payload columns', () => {
    expect(shouldSuggestForeignKey('payload', [], 'system')).toBe(false);
    expect(shouldSuggestForeignKey('payload_json', [], 'system')).toBe(false);
  });
});

describe('shouldRequireNonNull', () => {
  it('flags nullable known IDs', () => {
    const col = makeColumn('user_id');
    expect(shouldRequireNonNull('user_id', 'orders', col)).toBe(true);
  });

  it('does not flag NOT NULL columns', () => {
    const col = makeColumn('user_id', 'INTEGER', { nullable: false });
    expect(shouldRequireNonNull('user_id', 'orders', col)).toBe(false);
  });

  it('does not flag non-critical columns', () => {
    const col = makeColumn('description');
    expect(shouldRequireNonNull('description', 'notes', col)).toBe(false);
  });
});

describe('shouldSuggestDomainConstraint', () => {
  it('suggests constraint on status with free-text type', () => {
    const table = makeTable('orders', [makeColumn('status', 'VARCHAR')]);
    expect(shouldSuggestDomainConstraint('status', 'VARCHAR', 'orders', table)).toBe(true);
  });

  it('skips if column already has a constraint', () => {
    const table = makeTable('orders', [makeColumn('status', 'VARCHAR', { isUnique: true })]);
    expect(shouldSuggestDomainConstraint('status', 'VARCHAR', 'orders', table)).toBe(false);
  });
});

describe('shouldSuggestNumericType', () => {
  it('suggests numeric type for amount with wrong type', () => {
    expect(shouldSuggestNumericType('amount', 'VARCHAR', '')).toBe(true);
  });

  it('skips if type is already numeric', () => {
    expect(shouldSuggestNumericType('amount', 'DECIMAL', '')).toBe(false);
    expect(shouldSuggestNumericType('amount', 'INTEGER', '')).toBe(false);
  });

  it('skips non-money columns', () => {
    expect(shouldSuggestNumericType('name', 'VARCHAR', '')).toBe(false);
  });
});

describe('shouldSuggestTimestampType', () => {
  it('suggests timestamp for created_at with wrong type', () => {
    expect(shouldSuggestTimestampType('created_at', 'VARCHAR', '')).toBe(true);
  });

  it('skips if type is already timestamp', () => {
    expect(shouldSuggestTimestampType('created_at', 'TIMESTAMP', '')).toBe(false);
    expect(shouldSuggestTimestampType('created_at', 'TIMESTAMPTZ', '')).toBe(false);
  });
});

describe('shouldRecommendCompositeIndex', () => {
  it('recommends index when user_id + created_at exist', () => {
    const table = makeTable('orders', [
      makeColumn('user_id'), makeColumn('created_at'), makeColumn('total'),
    ], [], [], []);
    expect(shouldRecommendCompositeIndex(table)).toBe(true);
  });

  it('does not recommend if composite index already exists', () => {
    const table = makeTable('orders', [
      makeColumn('user_id'), makeColumn('created_at'), makeColumn('total'),
    ], [], [], [{ columns: ['user_id', 'created_at'], type: 'INDEX' }]);
    expect(shouldRecommendCompositeIndex(table)).toBe(false);
  });
});

describe('getCompositeIndexColumns', () => {
  it('returns user_id + created_at when both exist', () => {
    const table = makeTable('orders', [makeColumn('user_id'), makeColumn('created_at')]);
    expect(getCompositeIndexColumns(table)).toEqual(['user_id', 'created_at']);
  });

  it('returns empty array when no candidates match', () => {
    const table = makeTable('orders', [makeColumn('name')]);
    expect(getCompositeIndexColumns(table)).toEqual([]);
  });
});

describe('detectCircularDependencies', () => {
  it('detects a simple circular dependency', () => {
    const tables = [{ name: 'a' }, { name: 'b' }];
    const rels = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'a' },
    ];
    const cycles = detectCircularDependencies(tables, rels);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toContain('a');
    expect(cycles[0]).toContain('b');
  });

  it('returns empty for acyclic graph', () => {
    const tables = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    const rels = [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
    ];
    expect(detectCircularDependencies(tables, rels)).toHaveLength(0);
  });

  it('ignores self-references', () => {
    const tables = [{ name: 'employees' }];
    const rels = [{ from: 'employees', to: 'employees' }];
    expect(detectCircularDependencies(tables, rels)).toHaveLength(0);
  });
});
