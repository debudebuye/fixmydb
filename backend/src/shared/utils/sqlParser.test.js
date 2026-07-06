const { parseSQLSchema, parseCreateTable } = require('./sqlParser');

describe('parseSQLSchema', () => {
  it('parses a basic CREATE TABLE statement', () => {
    const sql = `CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    const result = parseSQLSchema(sql);
    expect(result.tables).toHaveLength(1);
    expect(result.tables[0].name).toBe('users');
    expect(result.tables[0].columns).toHaveLength(3);
    expect(result.tables[0].primaryKeys).toEqual(['id']);
  });

  it('parses multiple CREATE TABLE statements', () => {
    const sql = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255));
      CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INTEGER, title VARCHAR(255));
    `;

    const result = parseSQLSchema(sql);
    expect(result.tables).toHaveLength(2);
    expect(result.tables[0].name).toBe('users');
    expect(result.tables[1].name).toBe('posts');
  });

  it('extracts foreign keys from REFERENCES inline', () => {
    const sql = `CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title VARCHAR(255)
    );`;

    const result = parseSQLSchema(sql);
    expect(result.relationships).toHaveLength(1);
    expect(result.relationships[0]).toMatchObject({
      from: 'posts',
      fromColumn: 'user_id',
      to: 'users',
      toColumn: 'id',
    });
  });

  it('returns empty tables array for non-CREATE TABLE SQL', () => {
    const sql = `SELECT * FROM users;`;
    const result = parseSQLSchema(sql);
    expect(result.tables).toHaveLength(0);
    expect(result.relationships).toHaveLength(0);
  });

  it('strips leading comments before statements', () => {
    const sql = `-- This is a comment
    CREATE TABLE users (id SERIAL PRIMARY KEY);`;

    const result = parseSQLSchema(sql);
    expect(result.tables).toHaveLength(1);
  });
});

describe('parseCreateTable', () => {
  it('returns null for invalid SQL', () => {
    const result = parseCreateTable('INVALID SQL');
    expect(result).toBeNull();
  });

  it('handles IF NOT EXISTS', () => {
    const result = parseCreateTable('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY);');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.name).toBe('users');
    }
  });
});
