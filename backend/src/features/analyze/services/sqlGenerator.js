/**
 * Generate optimized SQL from analyzed schema
 */

function generateOptimizedSQL(schema, analysis, dialect = 'postgresql') {
  const { tables } = schema;
  const { issues, recommendations } = analysis;
  const lines = [];

  const isPg = dialect.toLowerCase() !== 'mysql';

  // Build a map of PK column types so FK columns match their referenced PK type
  const pkTypeMap = {};
  const tableNames = new Set(tables.map(t => t.name));
  for (const table of tables) {
    pkTypeMap[table.name] = {};
    for (const col of table.columns) {
      if (col.isPrimary || table.primaryKeys.includes(col.name)) {
        pkTypeMap[table.name][col.name] = col.type;
      }
    }
  }

  function findReferencedTable(colName) {
    const name = colName.toLowerCase();
    if (!name.endsWith('_id') || name === 'id') return null;
    const base = name.slice(0, -3);
    if (tableNames.has(base)) return base;
    if (tableNames.has(base + 's')) return base + 's';
    if (tableNames.has(base + 'es')) return base + 'es';
    // Handle -y → -ies plural (e.g. category → categories)
    if (base.endsWith('y')) {
      const iesForm = base.slice(0, -1) + 'ies';
      if (tableNames.has(iesForm)) return iesForm;
    }
    return null;
  }

  lines.push(`-- FixMyDB Recommended Schema (${isPg ? 'PostgreSQL' : 'MySQL'})`);
  lines.push(`-- Generated at ${new Date().toISOString()}`);
  lines.push('');

  // Generate CREATE TABLE statements
  for (const table of tables) {
    lines.push(`CREATE TABLE IF NOT EXISTS ${table.name} (`);

    const colDefs = [];

    for (const column of table.columns) {
      // Override FK column type to match referenced PK type for type compatibility
      let colType = column.type;
      const fk = table.foreignKeys.find(f => f.column === column.name);
      if (fk) {
        const refPkType = pkTypeMap[fk.references.table]?.[fk.references.column];
        if (refPkType) {
          colType = normalizeSerialType(refPkType);
        }
      } else {
        // Naming-based FK heuristic: column ending in _id should match PK type
        const refTable = findReferencedTable(column.name);
        if (refTable) {
          const refPk = pkTypeMap[refTable] && Object.keys(pkTypeMap[refTable])[0];
          if (refPk) {
            const refType = normalizeSerialType(pkTypeMap[refTable][refPk]);
            if (refType) colType = refType;
          }
        }
      }

      // Handle ENUM type for PostgreSQL (no native generic ENUM)
      let checkSuffix = '';
      if (isPg && colType === 'ENUM' && column.enumValues && column.enumValues.length > 0) {
        colType = 'VARCHAR(20)';
        checkSuffix = ` CHECK (${column.name} IN (${column.enumValues.map(v => `'${v.replace(/'/g, "''")}'`).join(', ')}))`;
      }

      // Format type with preserved length/scale
      let formattedType = formatType(colType, isPg);
      const typeLen = column.length;
      const typeScale = column.scale;
      if (typeLen != null && !formattedType.includes('(')) {
        formattedType += typeScale != null ? `(${typeLen}, ${typeScale})` : `(${typeLen})`;
      }

      // Generate CHECK constraint for numeric business columns (price >= 0, quantity > 0, etc.)
      const colNameLower = column.name.toLowerCase();
      let numericCheck = '';
      if (isPg && formattedType.startsWith('DECIMAL') || formattedType.startsWith('NUMERIC') || formattedType === 'INTEGER' || formattedType === 'BIGINT' || formattedType === 'SMALLINT') {
        if (['price', 'total', 'total_amount', 'amount', 'balance', 'fee', 'payout', 'deposit', 'withdrawal', 'stock_quantity', 'quantity'].includes(colNameLower)) {
          const op = colNameLower === 'quantity' ? '> 0' : '>= 0';
          numericCheck = ` CHECK (${column.name} ${op})`;
        }
      }

      let def = `  ${column.name} ${formattedType}`;

      if (column.isPrimary && table.primaryKeys.length === 1) {
        if (isPg) {
          const pkType = formattedType === 'BIGINT' ? 'BIGSERIAL'
            : formattedType === 'INTEGER' || formattedType === 'INT' ? 'SERIAL'
            : formattedType.includes('SERIAL') ? formattedType
            : formattedType;
          def = `  ${column.name} ${pkType} PRIMARY KEY`;
        } else {
          const pkType = formattedType === 'BIGINT' ? 'BIGINT AUTO_INCREMENT'
            : formattedType.includes('INT') ? 'INT AUTO_INCREMENT'
            : formattedType;
          def = `  ${column.name} ${pkType} PRIMARY KEY`;
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
        def += checkSuffix;
        def += numericCheck;
      }

      colDefs.push(def);
    }

    // Add composite primary key
    if (table.primaryKeys.length > 1) {
      colDefs.push(`  PRIMARY KEY (${table.primaryKeys.join(', ')})`);
    }

    // Add foreign keys with explicit ON DELETE (RESTRICT is safe default; adjust per app semantics)
    for (const fk of table.foreignKeys) {
      colDefs.push(
        `  CONSTRAINT fk_${table.name}_${fk.column} FOREIGN KEY (${fk.column}) REFERENCES ${fk.references.table}(${fk.references.column}) ON DELETE RESTRICT`
      );
    }

    // Auto-generate UNIQUE(order_id, product_id) for order_items-like junction tables
    const tableLower = table.name.toLowerCase();
    const hasOrderId = table.columns.some(c => /^order_id$/.test(c.name.toLowerCase()));
    const hasProductId = table.columns.some(c => /^product_id$/.test(c.name.toLowerCase()) || /^item_id$/.test(c.name.toLowerCase()));
    if (/order_item|order_line|cart_item/.test(tableLower) && hasOrderId && hasProductId) {
      const exists = (table.constraints || []).some(c =>
        c.type === 'unique' && c.columns &&
        c.columns.some(col => /order_id/.test(col)) &&
        c.columns.some(col => /product_id/.test(col) || /item_id/.test(col))
      );
      if (!exists) {
        colDefs.push('  UNIQUE (order_id, product_id)');
      }
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

  // Add composite unique constraints
  const compositeUniqueRecs = recommendations.filter(r => r.type === 'composite_unique');
  if (compositeUniqueRecs.length > 0) {
    if (uniqueRecs.length === 0) lines.push('-- Recommended: Add unique constraints');
    for (const rec of compositeUniqueRecs) {
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

function normalizeSerialType(type) {
  const upper = (type || '').toUpperCase();
  if (upper === 'SERIAL' || upper === 'SERIAL4') return 'INTEGER';
  if (upper === 'BIGSERIAL' || upper === 'SERIAL8') return 'BIGINT';
  if (upper === 'SMALLSERIAL' || upper === 'SERIAL2') return 'SMALLINT';
  return type;
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