const { run } = require('./namingRules');
const { makeTable, makeColumn } = require('./test-utils');

describe('namingRules', () => {
  it('flags mixed case column name', () => {
    const t = makeTable('users', [makeColumn('createdAt'), makeColumn('id')]);
    const result = run(t);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('naming_convention');
    expect(result.issues[0].message).toContain('createdAt');
  });

  it('does not flag snake_case columns', () => {
    const t = makeTable('users', [makeColumn('created_at'), makeColumn('user_id')]);
    const result = run(t);
    expect(result.issues).toHaveLength(0);
  });

  it('handles empty columns', () => {
    const t = makeTable('empty', []);
    const result = run(t);
    expect(result.issues).toHaveLength(0);
  });
});
