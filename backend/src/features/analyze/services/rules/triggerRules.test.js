const { run } = require('./triggerRules');
const { makeTable, makeColumn } = require('./test-utils');

describe('triggerRules', () => {
  it('recommends auto-update trigger for updated_at', () => {
    const t = makeTable('users', [makeColumn('updated_at')]);
    const result = run(t);
    const rec = result.recommendations.find(r => r.type === 'auto_update');
    expect(rec).toBeDefined();
    expect(rec.table).toBe('users');
  });

  it('returns empty for table without updated_at', () => {
    const t = makeTable('users', [makeColumn('created_at')]);
    const result = run(t);
    expect(result.recommendations).toBeUndefined();
  });
});
