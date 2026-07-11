const { calculateHealthScore } = require('./healthScore');

function table(name, fkCount = 0, idxCount = 0) {
  return {
    name,
    columns: [{ name: 'id', type: 'SERIAL' }],
    foreignKeys: Array.from({ length: fkCount }, (_, i) => ({ column: `fk_${i}` })),
    indexes: Array.from({ length: idxCount }, (_, i) => ({ columns: [`col_${i}`] })),
  };
}

describe('calculateHealthScore', () => {
  it('returns 100 for perfect schema', () => {
    const score = calculateHealthScore([table('users')], [], [], 'system');
    expect(score).toBe(100);
  });

  it('deducts for high-severity issues', () => {
    const issues = [{ severity: 'high', type: 'missing_primary_key' }];
    const score = calculateHealthScore([table('users')], issues, [], 'system');
    expect(score).toBeLessThan(90);
    expect(score).toBe(88);
  });

  it('deducts more in strict mode', () => {
    const issues = [{ severity: 'high', type: 'missing_primary_key' }];
    const normal = calculateHealthScore([table('users')], issues, [], 'system');
    const strict = calculateHealthScore([table('users')], issues, [], 'strict');
    expect(strict).toBeLessThan(normal);
  });

  it('deducts for medium-severity issues', () => {
    const issues = [{ severity: 'medium', type: 'nullable_required_column' }];
    const score = calculateHealthScore([table('users')], issues, [], 'system');
    expect(score).toBe(95);
  });

  it('reduces score for high-risk tables', () => {
    const highRiskTable = {
      name: 'wallets',
      columns: [{ name: 'balance', type: 'DECIMAL' }, { name: 'amount', type: 'DECIMAL' }],
      foreignKeys: [],
      indexes: [],
    };
    const score = calculateHealthScore([highRiskTable], [], [], 'system');
    expect(score).toBeLessThan(100);
    expect(score).toBe(96);
  });

  it('awards bonus points for foreign keys and indexes', () => {
    const score = calculateHealthScore([table('orders', 3, 4)], [], [], 'system');
    expect(score).toBe(100);
  });

  it('penalizes by issue type when no severity', () => {
    const issues = [{ type: 'domain_constraint' }];
    const score = calculateHealthScore([table('users')], issues, [], 'system');
    expect(score).toBe(98);
  });

  it('clamps score to 0-100 range', () => {
    const manyIssues = Array.from({ length: 20 }, () => ({ severity: 'high', type: 'missing_primary_key' }));
    const score = calculateHealthScore([table('users')], manyIssues, [], 'system');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
