function manualParseCreateTable(stmt) {
  const tableNameMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(/i);
  if (!tableNameMatch) return null;

  const tableName = tableNameMatch[1];
  const columns = [];
  const primaryKeys = [];
  const foreignKeys = [];
  const indexes = [];
  const checks = [];

  const contentMatch = stmt.match(/\((.+)\)/s);
  if (!contentMatch) return null;

  const content = contentMatch[1];
  const lines = splitColumnDefinitions(content);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const upper = trimmed.toUpperCase();

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

    if (upper.startsWith('INDEX') || upper.startsWith('KEY') || upper.startsWith('UNIQUE KEY')) {
      continue;
    }

    if (upper.startsWith('CHECK')) {
      checks.push(trimmed.replace(/,$/, ''));
      continue;
    }

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

    const refMatch = trimmed.match(/REFERENCES\s+["`]?(\w+)["`]?\s*\(([^)]+)\)/i);
    if (refMatch) {
      col.references = { table: refMatch[1], column: refMatch[2].trim().replace(/["`]/g, '') };
      foreignKeys.push({ column: col.name, references: col.references });
    }

    const defaultMatch = trimmed.match(/DEFAULT\s+(.+?)(?:\s+NOT\s+NULL|\s+NULL|\s+UNIQUE|\s+CHECK|\s+REFERENCES|\s+PRIMARY\s+KEY|,|$)/i);
    if (defaultMatch) col.default = defaultMatch[1].trim().replace(/,$/, '');

    columns.push(col);
  }

  return { name: tableName, columns, primaryKeys, foreignKeys, indexes, checks };
}

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

function extractTableName(stmt) {
  const m = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?/i);
  return m ? m[1] : null;
}

module.exports = { manualParseCreateTable, splitColumnDefinitions, extractTableName };
