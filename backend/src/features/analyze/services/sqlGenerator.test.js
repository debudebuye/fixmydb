const { generateOptimizedSQL } = require('./sqlGenerator');

describe('generateOptimizedSQL', () => {
  it('generates CREATE TABLE statements for each table', () => {
    const schema = {
      tables: [{
        name: 'users',
        columns: [
          { name: 'id', type: 'SERIAL', nullable: false, isPrimary: true, isUnique: false, default: null, check: null, enumValues: null, length: undefined, scale: undefined },
          { name: 'email', type: 'VARCHAR(255)', nullable: false, isPrimary: false, isUnique: true, default: null, check: null, enumValues: null, length: undefined, scale: undefined },
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
        indexes: [],
        checks: [],
        constraints: [],
      }],
      relationships: [],
    };
    const analysis = { issues: [], recommendations: [] };

    const result = generateOptimizedSQL(schema, analysis);
    expect(result).toContain('CREATE TABLE IF NOT EXISTS users');
    expect(result).toContain('id');
    expect(result).toContain('email');
  });

  it('generates FOREIGN KEY constraints', () => {
    const schema = {
      tables: [{
        name: 'posts',
        columns: [
          { name: 'id', type: 'SERIAL', nullable: false, isPrimary: true, isUnique: false, default: null, check: null, enumValues: null, length: undefined, scale: undefined },
          { name: 'user_id', type: 'INTEGER', nullable: true, isPrimary: false, isUnique: false, default: null, check: null, enumValues: null, length: undefined, scale: undefined },
        ],
        primaryKeys: ['id'],
        foreignKeys: [{ column: 'user_id', references: { table: 'users', column: 'id' } }],
        indexes: [],
        checks: [],
        constraints: [],
      }],
      relationships: [],
    };
    const analysis = { issues: [], recommendations: [] };

    const result = generateOptimizedSQL(schema, analysis);
    expect(result).toContain('CONSTRAINT fk_posts_user_id');
    expect(result).toContain('REFERENCES users(id)');
  });

  it('includes recommended indexes from analysis', () => {
    const schema = {
      tables: [{
        name: 'posts',
        columns: [
          { name: 'id', type: 'SERIAL', nullable: false, isPrimary: true, isUnique: false, default: null, check: null, enumValues: null, length: undefined, scale: undefined },
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
        indexes: [],
        checks: [],
        constraints: [],
      }],
      relationships: [],
    };
    const analysis = {
      issues: [],
      recommendations: [
        { type: 'missing_index', column: 'user_id', sql: 'CREATE INDEX idx_posts_user_id ON posts(user_id);' },
      ],
    };

    const result = generateOptimizedSQL(schema, analysis);
    expect(result).toContain('idx_posts_user_id');
  });

  it('includes suggested missing foreign keys from issues', () => {
    const schema = {
      tables: [{
        name: 'posts',
        columns: [
          { name: 'id', type: 'SERIAL', nullable: false, isPrimary: true, isUnique: false, default: null, check: null, enumValues: null, length: undefined, scale: undefined },
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
        indexes: [],
        checks: [],
        constraints: [],
      }],
      relationships: [],
    };
    const analysis = {
      issues: [
        { type: 'missing_foreign_key', recommendation: 'ALTER TABLE posts ADD CONSTRAINT fk_posts_user_id FOREIGN KEY (user_id) REFERENCES users(id);' },
      ],
      recommendations: [],
    };

    const result = generateOptimizedSQL(schema, analysis);
    expect(result).toContain('ALTER TABLE');
  });
});
