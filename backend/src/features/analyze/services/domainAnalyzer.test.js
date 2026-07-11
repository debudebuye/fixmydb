const { analyzeDomain } = require('./domainAnalyzer');

describe('analyzeDomain', () => {
  it('detects financial domain from table names', () => {
    const schema = {
      tables: [
        { name: 'wallets', columns: [{ name: 'balance', type: 'DECIMAL' }], foreignKeys: [] },
        { name: 'transactions', columns: [{ name: 'amount', type: 'DECIMAL' }], foreignKeys: [] },
      ],
    };

    const result = analyzeDomain(schema);
    expect(result.detectedDomain.type).toBe('financial');
    expect(result.detectedDomain.confidence).toBeGreaterThan(0);
  });

  it('detects ecommerce domain', () => {
    const schema = {
      tables: [
        { name: 'products', columns: [{ name: 'price', type: 'DECIMAL' }], foreignKeys: [] },
        { name: 'orders', columns: [{ name: 'total', type: 'DECIMAL' }], foreignKeys: [] },
        { name: 'customers', columns: [{ name: 'email', type: 'VARCHAR' }], foreignKeys: [] },
      ],
    };

    const result = analyzeDomain(schema);
    expect(result.detectedDomain.type).toBe('ecommerce');
  });

  it('returns generic domain when no signals match', () => {
    const schema = {
      tables: [
        { name: 'notes', columns: [{ name: 'title', type: 'VARCHAR' }], foreignKeys: [] },
        { name: 'tags', columns: [{ name: 'name', type: 'VARCHAR' }], foreignKeys: [] },
      ],
    };

    const result = analyzeDomain(schema);
    expect(result.detectedDomain.type).toBe('generic');
  });

  it('applies financial rules for wallet tables', () => {
    const schema = {
      tables: [
        {
          name: 'wallets',
          columns: [
            { name: 'id', type: 'SERIAL' },
            { name: 'balance', type: 'DECIMAL' },
          ],
          foreignKeys: [],
        },
      ],
    };

    const result = analyzeDomain(schema);
    const rules = result.domainRules.flat();
    const balanceRule = rules.find(r => r.rule === 'mutable_balance_model');
    expect(balanceRule).toBeDefined();
    expect(balanceRule.fact).toBe(true); // no version column
  });

  it('returns trust score in confidence analysis', () => {
    const schema = {
      tables: [
        { name: 'wallets', columns: [{ name: 'balance', type: 'DECIMAL' }], foreignKeys: [] },
      ],
    };

    const result = analyzeDomain(schema);
    expect(result.confidenceAnalysis.summary).toBeDefined();
    expect(result.confidenceAnalysis.summary.trustScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceAnalysis.summary.unknownCount).toBeGreaterThan(0);
  });
});
