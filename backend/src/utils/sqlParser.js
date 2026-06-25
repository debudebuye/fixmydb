const { Parser } = require('node-sql-parser');

const parser = new Parser();

/**
 * Parse SQL DDL statements into a structured schema
 * @param {string} sql - Raw SQL DDL string
 * @returns {{ tables: Table[], relationships: Relationship[], rawAst: any }}
 */
function parseSQLSchema(sql) {
  const tables = [];
  const relationships = [];

  // Split SQL into individual statements
  const statements = sql
    .split(/;\s*\n|;\s*$/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.toUpperCase().startsWith('CREATE TABLE'));

  for (const stmt of statements) {
    try {
      const table = parseCreateTable(stmt + ';');
      if (table) {
        tables.push(table);
      }
    } catch (err) {
      // Try manual parsing as fallback
      const table = manualParseCreateTable(stmt);
      if (table) tables.push(table);
    }
  }

  // Extract relationships from foreign keys
  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      relationships.push({
        from: table.name,
        fromColumn: fk.column,
        to: fk.references.table,
        toColumn: fk.references.column,
        type: 'FOREIGN KEY',
      });
    }
  }

  return { tables, relationships };
}

/**
 * Parse a single CREATE TABLE statement using node-sql-parser
 */
function parseCreateTable(stmt) {
  try {
    const ast = parser.astify(stmt, { database: 'PostgresQL' });
    const node = Array.isArray(ast) ? ast[0] : ast;

    if (!node || node.type !== 'create') return null;

    const tableName = node.table?.[0]?.table || extractTableName(stmt);
    if (!tableName) return null;

    const columns = [];
    const primaryKeys = [];
    const foreignKeys = [];
    const indexes = [];

    const definitions = node.create_definitions || [];
    for (const def of definitions) {
      if (def.resource === 'column') {
        const colName = extractColumnName(def);
        const col = {
          name: String(colName || 'unknown'),
          type: def.definition?.dataType || 'UNKNOWN',
          nullable: def.nullable?.value !== 'NOT NULL',
          default: def.default_val?.value ?? null,
          isPrimary: false,
          isUnique: false,
          references: null,
        };

        // Check inline primary key
        if (def.primary_key || def.unique_or_primary === 'primary key') {
          col.isPrimary = true;
          primaryKeys.push(col.name);
        }

        // Check inline unique
        if (def.unique || def.unique_or_primary === 'unique') {
          col.isUnique = true;
        }

        // Check inline foreign key / references
        if (def.reference_definition) {
          const ref = def.reference_definition;
          const refTableRaw = ref.table;
          let refTableName = null;
          if (Array.isArray(refTableRaw)) {
            refTableName = refTableRaw[0]?.table || null;
          } else if (typeof refTableRaw === 'string') {
            refTableName = refTableRaw;
          } else {
            refTableName = refTableRaw?.table || null;
          }
          const refColRaw = ref.definition?.[0];
          const refColName = extractDefColumnName(refColRaw);
          col.references = {
            table: refTableName,
            column: refColName || 'id',
          };
          foreignKeys.push({
            column: col.name,
            references: col.references,
          });
        }

        columns.push(col);
      } else if (def.resource === 'constraint') {
        if (def.constraint_type === 'primary key') {
          const pkCols = (def.definition || []).map(d => extractDefColumnName(d)).filter(Boolean);
          for (const pk of pkCols) {
            primaryKeys.push(pk);
            const col = columns.find(c => c.name === pk);
            if (col) col.isPrimary = true;
          }
        } else if (def.constraint_type === 'FOREIGN KEY' || def.constraint_type === 'foreign key') {
          const fkColRaw = def.definition?.[0];
          const fkCol = extractDefColumnName(fkColRaw);
          // reference_definition.table can be an array [{table: 'users'}] or a string/object
          const refTableRaw = def.reference_definition?.table;
          let refTable = null;
          if (Array.isArray(refTableRaw)) {
            refTable = refTableRaw[0]?.table || null;
          } else if (typeof refTableRaw === 'string') {
            refTable = refTableRaw;
          } else {
            refTable = refTableRaw?.table || null;
          }
          const refColRaw = def.reference_definition?.definition?.[0];
          const refCol = extractDefColumnName(refColRaw);
          if (fkCol && refTable) {
            foreignKeys.push({
              column: fkCol,
              references: { table: refTable, column: refCol || 'id' },
            });
          }
        } else if (def.constraint_type === 'unique') {
          const uCols = (def.definition || []).map(d => extractDefColumnName(d)).filter(Boolean);
          for (const uc of uCols) {
            const col = columns.find(c => c.name === uc);
            if (col) col.isUnique = true;
          }
        } else if (def.index_type === 'index' || def.constraint_type === 'index') {
          const idxCols = (def.definition || []).map(d => extractDefColumnName(d)).filter(Boolean);
          indexes.push({ columns: idxCols, type: 'INDEX' });
        }
      }
    }

    return {
      name: tableName,
      columns,
      primaryKeys,
      foreignKeys,
      indexes,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Extract column name from AST column definition - handles nested objects from node-sql-parser
 */
function extractColumnName(colDef) {
  if (!colDef) return null;
  
  // node-sql-parser nests: def.column.column.expr.value
  if (colDef.column) {
    const c = colDef.column;
    if (typeof c === 'string') return c;
    if (c.expr?.value) return String(c.expr.value);
    if (c.column) {
      if (typeof c.column === 'string') return c.column;
      if (c.column?.expr?.value) return String(c.column.expr.value);
    }
  }
  if (typeof colDef === 'string') return colDef;
  return null;
}

/**
 * Extract column name from FK/constraint definition
 */
function extractDefColumnName(def) {
  if (!def) return null;
  if (typeof def === 'string') return def;
  if (def.column) {
    if (typeof def.column === 'string') return def.column;
    if (def.column?.expr?.value) return String(def.column.expr.value);
  }
  if (def.expr?.value) return String(def.expr.value);
  return null;
}


function manualParseCreateTable(stmt) {
  const tableNameMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(/i);
  if (!tableNameMatch) return null;

  const tableName = tableNameMatch[1];
  const columns = [];
  const primaryKeys = [];
  const foreignKeys = [];
  const indexes = [];

  // Extract the content between the outermost parens
  const contentMatch = stmt.match(/\((.+)\)/s);
  if (!contentMatch) return null;

  const content = contentMatch[1];
  const lines = splitColumnDefinitions(content);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const upper = trimmed.toUpperCase();

    // PRIMARY KEY constraint
    if (upper.startsWith('PRIMARY KEY')) {
      const pkMatch = trimmed.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const pkCols = pkMatch[1].split(',').map(c => c.trim().replace(/["`]/g, ''));
        primaryKeys.push(...pkCols);
        for (const pk of pkCols) {
          const col = columns.find(c => c.name === pk);
          if (col) col.isPrimary = true;
        }
      }
      continue;
    }

    // FOREIGN KEY constraint
    if (upper.startsWith('FOREIGN KEY') || upper.startsWith('CONSTRAINT')) {
      const fkMatch = trimmed.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+["`]?(\w+)["`]?\s*\(([^)]+)\)/i);
      if (fkMatch) {
        foreignKeys.push({
          column: fkMatch[1].trim().replace(/["`]/g, ''),
          references: {
            table: fkMatch[2].trim(),
            column: fkMatch[3].trim().replace(/["`]/g, ''),
          },
        });
      }
      continue;
    }

    // INDEX constraint
    if (upper.startsWith('INDEX') || upper.startsWith('KEY') || upper.startsWith('UNIQUE KEY')) {
      continue;
    }

    // Column definition
    const colMatch = trimmed.match(/^["`]?(\w+)["`]?\s+(\w+(?:\s*\([^)]*\))?)/);
    if (!colMatch) continue;

    const col = {
      name: colMatch[1],
      type: colMatch[2].toUpperCase(),
      nullable: !upper.includes('NOT NULL'),
      default: null,
      isPrimary: upper.includes('PRIMARY KEY'),
      isUnique: upper.includes('UNIQUE'),
      references: null,
    };

    if (col.isPrimary) {
      primaryKeys.push(col.name);
    }

    // Inline references
    const refMatch = trimmed.match(/REFERENCES\s+["`]?(\w+)["`]?\s*\(([^)]+)\)/i);
    if (refMatch) {
      col.references = { table: refMatch[1], column: refMatch[2].trim().replace(/["`]/g, '') };
      foreignKeys.push({ column: col.name, references: col.references });
    }

    // Default value
    const defaultMatch = trimmed.match(/DEFAULT\s+([^\s,]+)/i);
    if (defaultMatch) col.default = defaultMatch[1];

    columns.push(col);
  }

  return { name: tableName, columns, primaryKeys, foreignKeys, indexes };
}

function extractTableName(stmt) {
  const m = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?/i);
  return m ? m[1] : null;
}

/**
 * Split comma-delimited column definitions, respecting parentheses
 */
function splitColumnDefinitions(content) {
  const result = [];
  let depth = 0;
  let current = '';

  for (const char of content) {
    if (char === '(') depth++;
    else if (char === ')') depth--;

    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) result.push(current.trim());
  return result;
}

module.exports = { parseSQLSchema, parseCreateTable };
