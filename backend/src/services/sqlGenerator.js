/**
 * Generate optimized SQL from analyzed schema
 */

function generateOptimizedSQL(schema, analysis, dialect = 'postgresql') {
  const { tables } = schema;
  const { issues, recommendations } = analysis;
  const lines = [];

  const isPg = dialect.toLowerCase() !== 'mysql';

  lines.push(`-- FixMyDB Recommended Schema (${isPg ? 'PostgreSQL' : 'MySQL'})`);
  lines.push(`-- Generated at ${new Date().toISOString()}`);
  lines.push('');

  // Generate CREATE TABLE statements
  for (const table of tables) {
    lines.push(`CREATE TABLE IF NOT EXISTS ${table.name} (`);

    const colDefs = [];

    for (const column of table.columns) {
      let def = `  ${column.name} ${formatType(column.type, isPg)}`;

      if (column.isPrimary && table.primaryKeys.length === 1) {
        if (isPg) {
          def = `  ${column.name} ${column.type.includes('SERIAL') || column.type.includes('INT') ? 'SERIAL' : column.type} PRIMARY KEY`;
        } else {
          def = `  ${column.name} ${column.type.includes('INT') ? 'INT' : column.type} AUTO_INCREMENT PRIMARY KEY`;
        }
      } else {
        if (!column.nullable) def += ' NOT NULL';
        if (column.isUnique) def += ' UNIQUE';
        if (column.default !== null && column.default !== undefined) {
          def += ` DEFAULT ${formatDefault(column.default)}`;
        }
        if (column.check) {
          def += ` ${column.check}`;
        }
      }

      colDefs.push(def);
    }

    // Add composite primary key
    if (table.primaryKeys.length > 1) {
      colDefs.push(`  PRIMARY KEY (${table.primaryKeys.join(', ')})`);
    }

    // Add foreign keys
    for (const fk of table.foreignKeys) {
      colDefs.push(
        `  CONSTRAINT fk_${table.name}_${fk.column} FOREIGN KEY (${fk.column}) REFERENCES ${fk.references.table}(${fk.references.column})`
      );
    }

    if (table.checks && table.checks.length > 0) {
      for (const check of table.checks) {
        colDefs.push(`  ${check}`);
      }
    }

    if (table.constraints) {
      for (const constraint of table.constraints) {
        if (constraint.type === 'unique') {
          colDefs.push(`  ${constraint.sql}`);
        }
      }
    }

    lines.push(colDefs.join(',\n'));
    lines.push(');');
    lines.push('');
  }

  // Add missing foreign keys from issues
  const missingFKs = issues.filter(i => i.type === 'missing_foreign_key');
  if (missingFKs.length > 0) {
    lines.push('-- Suggested: Add missing foreign key constraints');
    for (const issue of missingFKs) {
      if (issue.recommendation && issue.recommendation.includes('ALTER TABLE')) {
        lines.push(issue.recommendation);
      }
    }
    lines.push('');
  }

  // Add recommended indexes
  const indexRecs = recommendations.filter(r => r.type === 'missing_index');
  if (indexRecs.length > 0) {
    lines.push('-- Recommended: Add indexes for performance');
    for (const rec of indexRecs) {
      lines.push(rec.sql);
    }
    lines.push('');
  }

  // Add unique constraints
  const uniqueRecs = recommendations.filter(r => r.type === 'missing_unique');
  if (uniqueRecs.length > 0) {
    lines.push('-- Recommended: Add unique constraints');
    for (const rec of uniqueRecs) {
      lines.push(rec.sql);
    }
  }

  const fkRecs = recommendations.filter(r => r.type === 'possible_foreign_key');
  if (fkRecs.length > 0) {
    lines.push('-- Review these potential foreign key suggestions');
    for (const rec of fkRecs) {
      if (rec.sql) lines.push(rec.sql);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function formatDefault(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatType(type, isPg) {
  if (!type) return 'TEXT';
  const upper = type.toUpperCase();

  if (isPg) {
    // PostgreSQL-specific type mappings
    if (upper === 'INT' || upper === 'INTEGER') return 'INTEGER';
    if (upper === 'TINYINT(1)') return 'BOOLEAN';
    if (upper.startsWith('TINYINT')) return 'SMALLINT';
    if (upper.startsWith('BIGINT')) return 'BIGINT';
    if (upper === 'DATETIME') return 'TIMESTAMP';
    if (upper === 'LONGTEXT') return 'TEXT';
    if (upper === 'MEDIUMTEXT') return 'TEXT';
    return type;
  } else {
    // MySQL-specific type mappings
    if (upper === 'SERIAL') return 'INT AUTO_INCREMENT';
    if (upper === 'BOOLEAN') return 'TINYINT(1)';
    if (upper === 'TIMESTAMP') return 'DATETIME';
    return type;
  }
}

module.exports = { generateOptimizedSQL };
