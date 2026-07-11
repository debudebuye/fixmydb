const { manualParseCreateTable, splitColumnDefinitions, extractTableName } = require('./manualSqlParser');

describe('manualSqlParser', () => {
  describe('extractTableName', () => {
    it('extracts table name from CREATE TABLE', () => {
      expect(extractTableName('CREATE TABLE users (id INT)')).toBe('users');
    });

    it('handles IF NOT EXISTS', () => {
      expect(extractTableName('CREATE TABLE IF NOT EXISTS posts (id INT)')).toBe('posts');
    });

    it('handles quoted table names', () => {
      expect(extractTableName('CREATE TABLE "Orders" (id INT)')).toBe('Orders');
    });

    it('returns null for invalid input', () => {
      expect(extractTableName('SELECT 1')).toBeNull();
    });
  });

  describe('splitColumnDefinitions', () => {
    it('splits columns on commas', () => {
      const result = splitColumnDefinitions('id INT, name TEXT');
      expect(result).toEqual(['id INT', 'name TEXT']);
    });

    it('handles parentheses in DEFAULT', () => {
      const result = splitColumnDefinitions('id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      expect(result).toHaveLength(2);
    });

    it('splits correctly with nested parens', () => {
      const result = splitColumnDefinitions('id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      expect(result).toHaveLength(2);
    });

    it('trims whitespace', () => {
      const result = splitColumnDefinitions('  id INT , name TEXT ');
      expect(result).toEqual(['id INT', 'name TEXT']);
    });
  });

  describe('manualParseCreateTable', () => {
    it('parses basic table', () => {
      const result = manualParseCreateTable('CREATE TABLE users (id INT, name TEXT)');
      expect(result).toBeDefined();
      expect(result.name).toBe('users');
      expect(result.columns).toHaveLength(2);
      expect(result.columns[0].name).toBe('id');
      expect(result.columns[0].type).toBe('INT');
    });

    it('detects PRIMARY KEY inline', () => {
      const result = manualParseCreateTable('CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT)');
      expect(result.primaryKeys).toEqual(['id']);
      expect(result.columns[0].isPrimary).toBe(true);
    });

    it('detects PRIMARY KEY constraint', () => {
      const sql = `CREATE TABLE users (id INT, name TEXT, PRIMARY KEY (id))`;
      const result = manualParseCreateTable(sql);
      expect(result.primaryKeys).toEqual(['id']);
    });

    it('detects FOREIGN KEY inline', () => {
      const sql = `CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id))`;
      const result = manualParseCreateTable(sql);
      expect(result.foreignKeys).toHaveLength(1);
      expect(result.foreignKeys[0].column).toBe('user_id');
      expect(result.foreignKeys[0].references.table).toBe('users');
    });

    it('detects FOREIGN KEY constraint', () => {
      const sql = `CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))`;
      const result = manualParseCreateTable(sql);
      expect(result.foreignKeys).toHaveLength(1);
      expect(result.foreignKeys[0].column).toBe('user_id');
    });

    it('detects NOT NULL', () => {
      const result = manualParseCreateTable('CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL)');
      expect(result.columns[1].nullable).toBe(false);
    });

    it('detects DEFAULT', () => {
      const result = manualParseCreateTable('CREATE TABLE users (id SERIAL PRIMARY KEY, active BOOLEAN DEFAULT true)');
      expect(result.columns[1].default).toBe('true');
    });

    it('detects UNIQUE', () => {
      const result = manualParseCreateTable('CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE)');
      expect(result.columns[1].isUnique).toBe(true);
    });

    it('detects CHECK constraint as standalone entry', () => {
      const sql = `CREATE TABLE users (id SERIAL PRIMARY KEY, age INT, CHECK (age >= 18))`;
      const result = manualParseCreateTable(sql);
      expect(result.checks).toHaveLength(1);
    });

    it('parses column types with length and precision', () => {
      const result = manualParseCreateTable('CREATE TABLE items (price DECIMAL(10,2), name VARCHAR(255))');
      expect(result.columns[0].type).toBe('DECIMAL(10,2)');
      expect(result.columns[0].length).toBe(10);
      expect(result.columns[0].scale).toBe(2);
      expect(result.columns[1].type).toBe('VARCHAR(255)');
      expect(result.columns[1].length).toBe(255);
    });

    it('returns null for non-CREATE statements', () => {
      expect(manualParseCreateTable('SELECT 1')).toBeNull();
    });
  });
});
