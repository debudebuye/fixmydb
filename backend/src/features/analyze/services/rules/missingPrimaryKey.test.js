const { run } = require('./missingPrimaryKey');
const { makeTable, makeColumn } = require('./test-utils');

describe('missingPrimaryKey', () => {
  it('flags table without primary key', () => {
    const t = makeTable('users', [makeColumn('id', 'INTEGER')], [], []);
    const result = run(t);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('missing_primary_key');
    expect(result.issues[0].table).toBe('users');
  });

  it('does not flag table with primary key', () => {
    const t = makeTable('users', [makeColumn('id', 'INTEGER')], [], ['id']);
    const result = run(t);
    expect(result.issues).toBeUndefined();
  });
});
