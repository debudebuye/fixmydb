/**
 * Core Schema Analysis Engine
 * Detects issues, calculates health score, provides recommendations
 */

function analyzeSchema(schema) {
  const { tables, relationships } = schema;
  const issues = [];
  const recommendations = [];
  
  // 1. Check for missing primary keys
  for (const table of tables) {
    if (table.primaryKeys.length === 0) {
      issues.push({
        severity: 'high',
        table: table.name,
        type: 'missing_primary_key',
        message: `Table '${table.name}' has no primary key defined`,
        recommendation: `Add a primary key to table '${table.name}'. Consider: id SERIAL PRIMARY KEY or UUID primary key.`,
      });
    }
  }

  // 2. Check for missing foreign key constraints
  for (const table of tables) {
    for (const column of table.columns) {
      if (!column.name || typeof column.name !== 'string') continue;
      const colName = column.name.toLowerCase();
      
      // Heuristic: column ends with _id and is not in foreignKeys
      if (colName.endsWith('_id') && colName !== 'id') {
        const hasFk = table.foreignKeys.some(fk => fk.column === column.name);
        if (!hasFk) {
          const guessedTable = colName.replace(/_id$/, '');
          issues.push({
            severity: 'medium',
            table: table.name,
            type: 'missing_foreign_key',
            message: `Column '${column.name}' in table '${table.name}' looks like a foreign key but has no constraint`,
            recommendation: `Add foreign key: ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${colName} FOREIGN KEY (${column.name}) REFERENCES ${guessedTable}(id);`,
          });
        }
      }
    }
  }

  // 3. Check for missing indexes on foreign key columns
  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      const hasIndex = table.indexes.some(idx => idx.columns.includes(fk.column));
      if (!hasIndex) {
        recommendations.push({
          type: 'missing_index',
          table: table.name,
          column: fk.column,
          message: `Consider adding an index on '${table.name}.${fk.column}' for better join performance`,
          sql: `CREATE INDEX idx_${table.name}_${fk.column} ON ${table.name}(${fk.column});`,
          benefit: 'Speeds up JOIN queries and foreign key lookups',
        });
      }
    }
  }

  // 4. Check for potential unique columns (like email)
  for (const table of tables) {
    for (const column of table.columns) {
      if (!column.name || typeof column.name !== 'string') continue;
      const colName = column.name.toLowerCase();
      if ((colName === 'email' || colName === 'username') && !column.isUnique && !column.isPrimary) {
        recommendations.push({
          type: 'missing_unique',
          table: table.name,
          column: column.name,
          message: `Column '${column.name}' in table '${table.name}' should probably be UNIQUE`,
          sql: `ALTER TABLE ${table.name} ADD CONSTRAINT uk_${table.name}_${column.name} UNIQUE(${column.name});`,
          benefit: 'Prevents duplicate emails/usernames and improves query performance',
        });
      }

      // Also recommend index on email
      if (colName === 'email') {
        const hasIndex = table.indexes.some(idx => idx.columns.includes(column.name));
        if (!hasIndex) {
          recommendations.push({
            type: 'missing_index',
            table: table.name,
            column: column.name,
            message: `Add index on '${column.name}' for faster authentication queries`,
            sql: `CREATE INDEX idx_${table.name}_${column.name} ON ${table.name}(${column.name});`,
            benefit: 'Speeds up login and user lookup operations',
          });
        }
      }
    }
  }

  // 5. Check naming conventions
  for (const table of tables) {
    for (const column of table.columns) {
      if (!column.name || typeof column.name !== 'string') continue;
      if (column.name !== column.name.toLowerCase()) {
        issues.push({
          severity: 'low',
          table: table.name,
          type: 'naming_convention',
          message: `Column '${column.name}' uses mixed case. Consider using snake_case for consistency`,
          recommendation: `Rename to ${toSnakeCase(column.name)}`,
        });
      }
    }
  }

  // 6. Check for potential data redundancy
  for (const table of tables) {
    const columnNames = table.columns.map(c => c.name.toLowerCase());
    const duplicateSuffixes = columnNames.filter(name => 
      name.startsWith('customer_') || name.startsWith('user_') || name.startsWith('product_')
    );

    if (duplicateSuffixes.length > 2) {
      issues.push({
        severity: 'medium',
        table: table.name,
        type: 'data_redundancy',
        message: `Table '${table.name}' may have redundant/repeated data. Consider normalization.`,
        recommendation: `Review table structure - multiple columns with same prefix suggest denormalization`,
      });
    }
  }

  // 7. Check for circular dependencies
  const circularDeps = detectCircularDependencies(tables, relationships);
  if (circularDeps.length > 0) {
    for (const cycle of circularDeps) {
      issues.push({
        severity: 'high',
        type: 'circular_dependency',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`,
        recommendation: `Consider breaking the cycle by making one FK nullable or using a junction table`,
      });
    }
  }

  // Calculate health score
  const healthScore = calculateHealthScore(tables, issues, recommendations);

  return {
    healthScore,
    issues,
    recommendations,
    tables,
    relationships,
  };
}

/**
 * Calculate a 0-100 health score
 */
function calculateHealthScore(tables, issues, recommendations) {
  let score = 100;

  // Deduct points for issues
  for (const issue of issues) {
    if (issue.severity === 'high') score -= 10;
    else if (issue.severity === 'medium') score -= 5;
    else score -= 2;
  }

  // Deduct smaller points for missing optimizations
  score -= recommendations.length * 1;

  // Bonus for having foreign keys
  const totalFKs = tables.reduce((sum, t) => sum + t.foreignKeys.length, 0);
  score += Math.min(totalFKs * 2, 10);

  // Bonus for having indexes
  const totalIndexes = tables.reduce((sum, t) => sum + t.indexes.length, 0);
  score += Math.min(totalIndexes * 1, 5);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Detect circular dependencies using DFS
 */
function detectCircularDependencies(tables, relationships) {
  const graph = {};
  for (const table of tables) {
    graph[table.name] = [];
  }
  for (const rel of relationships) {
    if (!graph[rel.from]) graph[rel.from] = [];
    graph[rel.from].push(rel.to);
  }

  const cycles = [];
  const visited = new Set();
  const recStack = new Set();

  function dfs(node, path) {
    if (recStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push([...path.slice(cycleStart), node]);
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, [...path]);
    }

    recStack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    dfs(node, []);
  }

  return cycles;
}

function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

module.exports = { analyzeSchema };
