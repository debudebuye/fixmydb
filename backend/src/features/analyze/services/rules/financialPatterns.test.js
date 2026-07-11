const { run } = require('./financialPatterns');
const { makeTable, makeColumn } = require('./test-utils');

describe('financialPatterns', () => {
  it('recommends idempotency key for financial table', () => {
    const t = makeTable('payments', [makeColumn('id', 'INTEGER', { isPrimary: true }), makeColumn('amount')]);
    const result = run(t, {});
    const idemp = result.recommendations.find(r => r.type === 'missing_idempotency');
    expect(idemp).toBeDefined();
    expect(idemp.table).toBe('payments');
  });

  it('skips idempotency key when column exists', () => {
    const t = makeTable('payments', [makeColumn('id', 'INTEGER', { isPrimary: true }), makeColumn('amount'), makeColumn('idempotency_key')]);
    const result = run(t, {});
    expect(result.recommendations.find(r => r.type === 'missing_idempotency')).toBeUndefined();
  });

  it('recommends concurrency control for balance table', () => {
    const t = makeTable('wallets', [makeColumn('id', 'INTEGER', { isPrimary: true }), makeColumn('balance')]);
    const result = run(t, {});
    const conc = result.recommendations.find(r => r.type === 'concurrency_control');
    expect(conc).toBeDefined();
  });

  it('recommends ledger model for mutable balance', () => {
    const t = makeTable('wallets', [makeColumn('id', 'INTEGER', { isPrimary: true }), makeColumn('balance')]);
    const result = run(t, {});
    expect(result.recommendations.find(r => r.type === 'ledger_model')).toBeDefined();
  });

  it('recommends transaction safety for financial table without lifecycle columns', () => {
    const t = makeTable('transactions', [makeColumn('id', 'INTEGER', { isPrimary: true }), makeColumn('amount')]);
    const result = run(t, {});
    expect(result.recommendations.find(r => r.type === 'transaction_safety')).toBeDefined();
  });

  it('recommends migration_readiness for betting table with status', () => {
    const t = makeTable('bets', [makeColumn('id', 'INTEGER', { isPrimary: true }), makeColumn('amount'), makeColumn('status')]);
    const result = run(t, {});
    expect(result.recommendations.find(r => r.type === 'migration_readiness')).toBeDefined();
  });

  it('returns empty for non-financial table', () => {
    const t = makeTable('notes', [makeColumn('id', 'INTEGER', { isPrimary: true }), makeColumn('title')]);
    const result = run(t, {});
    expect(result.recommendations).toHaveLength(0);
  });
});
