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
    .map(stripLeadingComments)
    .filter(s => s.length > 0 && /^CREATE\s+TABLE/i.test(s));

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

  function stripLeadingComments(statement) {
    return statement
      .replace(/^(?:\s*--.*(?:\r?\n|$))+/g, '')
      .trim();
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

function formatExpression(expr) {
  if (!expr) return '';
  switch (expr.type) {
    case 'binary_expr':
      return `${formatExpression(expr.left)} ${expr.operator} ${formatExpression(expr.right)}`;
    case 'column_ref':
      return extractColumnName(expr) || '';
    case 'number':
    case 'int':
    case 'float':
      return String(expr.value);
    case 'single_quote_string':
      return `'${expr.value}'`;
    case 'bool':
      return String(expr.value).toUpperCase();
    case 'default':
      return typeof expr.value === 'string' ? expr.value : formatExpression(expr.value);
    case 'function':
      const fnName = Array.isArray(expr.name?.name)
        ? expr.name.name.map(part => typeof part === 'object' ? part.value : part).join('')
        : expr.name?.name || '';
      const args = Array.isArray(expr.args?.value)
        ? expr.args.value.map(formatExpression).join(', ')
        : '';
      return args ? `${fnName}(${args})` : fnName;
    case 'expr_list':
      return Array.isArray(expr.value) ? expr.value.map(formatExpression).join(', ') : '';
    default:
      return String(expr.value || '');
  }
}

function formatCheckConstraint(def) {
  if (!def) return null;
  const definition = def.definition || (def.check?.definition ? def.check.definition : null);
  if (Array.isArray(definition) && definition.length > 0) {
    return `CHECK (${formatExpression(definition[0])})`;
  }
  if (def.type === 'check') {
    return `CHECK (${formatExpression(def)})`;
  }
  return null;
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
    const checks = [];
    const constraints = [];

    const definitions = node.create_definitions || [];
    for (const def of definitions) {
      if (def.resource === 'column') {
        const colName = extractColumnName(def);
        const defaultVal = parseDefaultValue(def.default_val);
        const dataType = def.definition?.dataType || 'UNKNOWN';
        let enumValues = null;
        if (dataType === 'ENUM' && def.definition?.expr?.value) {
          enumValues = def.definition.expr.value
            .filter(v => v.type === 'single_quote_string')
            .map(v => v.value);
        }
        const col = {
          name: String(colName || 'unknown'),
          type: dataType,
          nullable: String(def.nullable?.value ?? '').toUpperCase() !== 'NOT NULL',
          default: defaultVal,
          isPrimary: false,
          isUnique: false,
          references: null,
          check: null,
          enumValues,
          length: def.definition?.parentheses ? def.definition?.length : undefined,
          scale: def.definition?.scale,
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

        // Column-level CHECK constraint
        if (def.check) {
          const checkSql = formatCheckConstraint(def.check);
          col.check = checkSql;
          if (checkSql) {
            constraints.push({ type: 'check', sql: checkSql });
            checks.push(checkSql);
          }
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
          if (uCols.length > 0) {
            constraints.push({
              type: 'unique',
              columns: uCols,
              sql: `UNIQUE (${uCols.join(', ')})`,
            });
          }
        } else if (def.constraint_type === 'check') {
          const checkSql = formatCheckConstraint(def);
          if (checkSql) {
            checks.push(checkSql);
            constraints.push({ type: 'check', sql: checkSql });
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
      checks,
      constraints,
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

function parseDefaultValue(defaultVal) {
  if (defaultVal === null || defaultVal === undefined) return null;
  if (typeof defaultVal !== 'object') return defaultVal;
  if (defaultVal.type === 'default' && defaultVal.value !== undefined) {
    const val = defaultVal.value;
    if (typeof val === 'string') return val;
    if (val === null || val === undefined) return null;
    if (val.type === 'single_quote_string') return `'${val.value}'`;
    if (val.type === 'number' || val.type === 'int' || val.type === 'float') return String(val.value);
    if (val.type === 'bool') return String(val.value).toUpperCase();
    if (val.type === 'column_ref') return extractColumnName(val);
    if (val.type === 'function') {
      const fnName = Array.isArray(val.name?.name)
        ? val.name.name.map(part => typeof part === 'object' ? part.value : part).join('')
        : val.name?.name || '';
      const args = Array.isArray(val.args?.value)
        ? val.args.value.map(arg => parseDefaultValue({ type: arg.type, value: arg.value })).filter(Boolean).join(', ')
        : '';
      return args ? `${fnName}(${args})` : fnName;
    }
    if (typeof val === 'object' && val.value !== undefined) {
      return parseDefaultValue(val);
    }
  }
  try {
    return parser.sqlify(defaultVal);
  } catch {
    return null;
  }
}

function manualParseCreateTable(stmt) {
  const tableNameMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(/i);
  if (!tableNameMatch) return null;

  const tableName = tableNameMatch[1];
  const columns = [];
  const primaryKeys = [];
  const foreignKeys = [];
  const indexes = [];
  const checks = [];

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

    if (upper.startsWith('CHECK')) {
      checks.push(trimmed.replace(/,$/, ''));
      continue;
    }

    // Column definition
    const colMatch = trimmed.match(/^["`]?(\w+)["`]?\s+(\w+(?:\s*\([^)]*\))?)/);
    if (!colMatch) continue;

    const rawType = colMatch[2];
    const typeUpper = rawType.toUpperCase();
    let colLength, colScale;
    const parenMatch = rawType.match(/\((\d+)(?:\s*,\s*(\d+))?\)/);
    if (parenMatch) {
      colLength = parseInt(parenMatch[1], 10);
      if (parenMatch[2]) colScale = parseInt(parenMatch[2], 10);
    }

    const col = {
      name: colMatch[1],
      type: typeUpper,
      nullable: !upper.includes('NOT NULL'),
      default: null,
      isPrimary: upper.includes('PRIMARY KEY'),
      isUnique: upper.includes('UNIQUE'),
      references: null,
      length: colLength,
      scale: colScale,
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
    const defaultMatch = trimmed.match(/DEFAULT\s+(.+?)(?:\s+NOT\s+NULL|\s+NULL|\s+UNIQUE|\s+CHECK|\s+REFERENCES|\s+PRIMARY\s+KEY|,|$)/i);
    if (defaultMatch) col.default = defaultMatch[1].trim().replace(/,$/, '');

    columns.push(col);
  }

  return { name: tableName, columns, primaryKeys, foreignKeys, indexes, checks };
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