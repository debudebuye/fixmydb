const { run } = require('./columnConstraints');
const { makeTable, makeColumn } = require('./test-utils');

describe('columnConstraints', () => {
  it('flags nullable user_id as required', () => {
    const t = makeTable('orders', [makeColumn('id', 'SERIAL', { isPrimary: true }), makeColumn('user_id', 'INTEGER', { nullable: true })]);
    const result = run(t, {});
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('nullable_required_column');
  });

  it('skips NOT NULL user_id', () => {
    const t = makeTable('orders', [makeColumn('id', 'SERIAL', { isPrimary: true }), makeColumn('user_id', 'INTEGER', { nullable: false })]);
    const result = run(t, {});
    expect(result.issues.find(i => i.type === 'nullable_required_column')).toBeUndefined();
  });

  it('suggests domain constraint for status column', () => {
    const t = makeTable('users', [makeColumn('status', 'VARCHAR')]);
    const result = run(t, {});
    const domain = result.recommendations.find(r => r.type === 'domain_constraint');
    expect(domain).toBeDefined();
    expect(domain.column).toBe('status');
  });

  it('suggests numeric type for amount column', () => {
    const t = makeTable('orders', [makeColumn('amount', 'VARCHAR')]);
    const result = run(t, {});
    const typeRec = result.recommendations.find(r => r.type === 'type_safety');
    expect(typeRec).toBeDefined();
    expect(typeRec.column).toBe('amount');
  });

  it('suggests timestamp type for created_at column', () => {
    const t = makeTable('orders', [makeColumn('created_at', 'VARCHAR')]);
    const result = run(t, {});
    const tsRec = result.recommendations.find(r => r.type === 'timestamp_safety');
    expect(tsRec).toBeDefined();
  });
});
