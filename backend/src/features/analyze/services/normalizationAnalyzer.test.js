const { analyzeNormalization } = require('./normalizationAnalyzer');

describe('analyzeNormalization', () => {
  it('returns score of 100 for a schema with no violations', () => {
    const schema = {
      tables: [{
        name: 'users',
        columns: [
          { name: 'id', type: 'SERIAL' },
          { name: 'email', type: 'VARCHAR(255)' },
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
      }],
    };

    const result = analyzeNormalization(schema);
    expect(result.normalizationScore).toBe(100);
    expect(result.violations).toHaveLength(0);
  });

  it('detects non-atomic columns', () => {
    const schema = {
      tables: [{
        name: 'products',
        columns: [
          { name: 'id', type: 'SERIAL' },
          { name: 'tags_delimited', type: 'JSON' },
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
      }],
    };

    const result = analyzeNormalization(schema);
    const violation = result.violations.find(v => v.column === 'tags_delimited');
    expect(violation).toBeDefined();
    expect(violation.normalForm).toBe('1NF');
  });

  it('does not flag allowed domain-safe columns', () => {
    const schema = {
      tables: [{
        name: 'users',
        columns: [
          { name: 'id', type: 'SERIAL' },
          { name: 'password_hash', type: 'VARCHAR(255)' },
          { name: 'metadata', type: 'JSONB' },
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
      }],
    };

    const result = analyzeNormalization(schema);
    expect(result.violations).toHaveLength(0);
  });

  it('suggests 2NF review for composite primary keys', () => {
    const schema = {
      tables: [{
        name: 'order_items',
        columns: [
          { name: 'order_id', type: 'INTEGER' },
          { name: 'product_id', type: 'INTEGER' },
          { name: 'quantity', type: 'INTEGER' },
        ],
        primaryKeys: ['order_id', 'product_id'],
        foreignKeys: [],
      }],
    };

    const result = analyzeNormalization(schema);
    const suggestion = result.suggestions.find(s => s.normalForm === '2NF');
    expect(suggestion).toBeDefined();
    expect(suggestion.table).toBe('order_items');
  });

  it('skips 2NF warnings for event_outbox pattern', () => {
    const schema = {
      tables: [{
        name: 'event_outbox',
        columns: [
          { name: 'aggregate_id', type: 'UUID' },
          { name: 'aggregate_type', type: 'VARCHAR(50)' },
          { name: 'payload', type: 'JSONB' },
        ],
        primaryKeys: ['aggregate_id', 'aggregate_type'],
        foreignKeys: [],
      }],
    };

    const result = analyzeNormalization(schema, { event_outbox: ['event_outbox'] });
    const suggestion = result.suggestions.find(s => s.normalForm === '2NF');
    expect(suggestion).toBeUndefined();
  });
});
