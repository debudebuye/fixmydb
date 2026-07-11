const { detectSchemaPatterns } = require('./schemaPatterns');

function table(name, columns) {
  return { name, columns: columns.map(c => ({ name: c })), foreignKeys: [] };
}

describe('detectSchemaPatterns', () => {
  it('detects event_outbox pattern', () => {
    const tables = [table('event_outbox', ['id', 'payload', 'created_at'])];
    const result = detectSchemaPatterns(tables);
    expect(result.patterns).toContain('event_outbox');
    expect(result.tablePatterns.event_outbox).toContain('event_outbox');
  });

  it('detects financial_ledger pattern', () => {
    const tables = [table('wallet_transactions', ['id', 'amount', 'currency'])];
    const result = detectSchemaPatterns(tables);
    expect(result.patterns).toContain('financial_ledger');
  });

  it('detects betting_domain pattern', () => {
    const tables = [table('bets', ['id', 'odds', 'stake'])];
    const result = detectSchemaPatterns(tables);
    expect(result.patterns).toContain('betting_domain');
  });

  it('detects polymorphic_reference pattern', () => {
    const tables = [table('comments', ['id', 'reference_type', 'reference_id'])];
    const result = detectSchemaPatterns(tables);
    expect(result.patterns).toContain('polymorphic_reference');
  });

  it('detects audit_log pattern', () => {
    const tables = [table('audit_log', ['id', 'action', 'payload', 'created_at'])];
    const result = detectSchemaPatterns(tables);
    expect(result.patterns).toContain('audit_log');
  });

  it('returns empty patterns for generic tables', () => {
    const tables = [table('notes', ['id', 'title', 'body'])];
    const result = detectSchemaPatterns(tables);
    expect(result.patterns).toHaveLength(0);
    expect(result.tablePatterns.notes).toEqual([]);
  });

  it('assigns multiple patterns to one table', () => {
    const tables = [table('event_store', ['id', 'aggregate_id', 'aggregate_type', 'payload'])];
    const result = detectSchemaPatterns(tables);
    expect(result.patterns).toContain('event_outbox');
    expect(result.patterns).toContain('polymorphic_reference');
  });
});
