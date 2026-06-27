/**
 * Core Schema Analysis Engine
 * Detects issues, calculates health score, provides recommendations
 */

function analyzeSchema(schema, options = {}) {
  const { tables, relationships } = schema;
  const mode = String(options.mode || 'system').toLowerCase();
  const { patterns, tablePatterns } = detectSchemaPatterns(tables);
  const issues = [];
  const recommendations = [];

  if (patterns.length > 0) {
    recommendations.push({
      type: 'architecture_pattern',
      message: `Detected architecture-aware patterns: ${patterns.join(', ')}`,
      recommendation: 'Review these tables with design-first tradeoffs instead of rigid normalization rules.',
      context: patterns,
    });
  }
  
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

  // 2. Add integrity, business-rule, and safety recommendations
  for (const table of tables) {
    const tableNameLower = table.name.toLowerCase();
    const columnNames = table.columns.map(column => String(column.name || '').toLowerCase());
    const isFinancialDomain = /(wallet|payment|deposit|withdraw|transaction|ledger|bet|settlement|market|odds|balance|account)/.test(tableNameLower);
    const hasMoneyFields = columnNames.some(name => ['amount','balance','price','stake','odds','fee','payout','total','deposit','withdrawal'].includes(name));
    const hasBusinessState = columnNames.some(name => ['status','state','type','kind','currency'].includes(name));
    const hasLifecycleColumns = columnNames.some(name => ['created_at','updated_at','deleted_at','settled_at','closed_at','expires_at','version','row_version'].includes(name));
    const hasBalanceColumn = columnNames.some(name => ['balance','current_balance','available_balance','ledger_balance'].includes(name));

    for (const column of table.columns) {
      const colName = String(column.name || '').toLowerCase();
      const colType = String(column.type || '').toUpperCase();

      if (shouldRequireNonNull(colName, tableNameLower, column)) {
        issues.push({
          severity: 'medium',
          table: table.name,
          type: 'nullable_required_column',
          message: `Column '${column.name}' in table '${table.name}' looks like a required business reference but is nullable.`,
          recommendation: `Make '${column.name}' NOT NULL unless the relationship is intentionally optional.`,
        });
      }

      if (shouldSuggestDomainConstraint(colName, colType, tableNameLower, table)) {
        recommendations.push({
          type: 'domain_constraint',
          table: table.name,
          column: column.name,
          message: `Column '${column.name}' in table '${table.name}' should use a stricter domain constraint.`,
          recommendation: `Add a CHECK/ENUM constraint or a lookup table for '${column.name}' to prevent invalid states.`,
          sql: `ALTER TABLE ${table.name} ADD CONSTRAINT chk_${table.name}_${colName} CHECK (${column.name} IN (...));`,
        });
      }

      if (shouldSuggestNumericType(colName, colType, tableNameLower)) {
        recommendations.push({
          type: 'type_safety',
          table: table.name,
          column: column.name,
          message: `Column '${column.name}' appears to hold monetary or quantitative data and should use a precise numeric type.`,
          recommendation: `Use NUMERIC(12,2) or another fixed-precision numeric type for '${column.name}'.`,
        });
      }

      if (shouldSuggestTimestampType(colName, colType, tableNameLower)) {
        recommendations.push({
          type: 'timestamp_safety',
          table: table.name,
          column: column.name,
          message: `Column '${column.name}' looks like a temporal field and should use a timezone-aware timestamp type.`,
          recommendation: `Prefer TIMESTAMPTZ for '${column.name}' when the value represents real-world time.`,
        });
      }
    }

    if ((isFinancialDomain || hasMoneyFields) && !columnNames.some(name => name === 'idempotency_key' || name === 'request_id')) {
      recommendations.push({
        type: 'missing_idempotency',
        table: table.name,
        message: `Table '${table.name}' looks like a financial or transactional table and should support idempotent retries.`,
        recommendation: `Add an idempotency_key column (UUID/VARCHAR) with a UNIQUE constraint for safe retries.`,
      });
    }

    if ((isFinancialDomain || hasMoneyFields) && hasBalanceColumn && !columnNames.some(name => ['version','row_version'].includes(name))) {
      recommendations.push({
        type: 'concurrency_control',
        table: table.name,
        message: `Table '${table.name}' has balance-like data but no optimistic-locking column.`,
        recommendation: `Add a version or row_version column to reduce race-condition issues on concurrent updates.`,
      });
    }

    if ((isFinancialDomain || hasMoneyFields) && hasBalanceColumn && !hasLifecycleColumns) {
      recommendations.push({
        type: 'ledger_model',
        table: table.name,
        message: `Table '${table.name}' uses mutable balance data without a clear append-only ledger pattern.`,
        recommendation: `Consider an append-only ledger or transaction journal model instead of updating balances in place.`,
      });
    }

    if ((isFinancialDomain || hasMoneyFields) && !hasLifecycleColumns) {
      recommendations.push({
        type: 'transaction_safety',
        table: table.name,
        message: `Table '${table.name}' may require stricter transactional boundaries for consistency.`,
        recommendation: `Wrap writes in a transaction and consider an outbox pattern for downstream side effects.`,
      });
    }

    if ((isFinancialDomain || hasMoneyFields) && !hasBusinessState && /bet|settlement|event/.test(tableNameLower)) {
      recommendations.push({
        type: 'business_rule_constraints',
        table: table.name,
        message: `Table '${table.name}' appears to encode business lifecycle state but does not expose a clear status column.`,
        recommendation: `Add explicit business-rule columns such as status, settled_at, or closed_at to enforce workflow correctness.`,
      });
    }

    if (table.foreignKeys.length > 0) {
      recommendations.push({
        type: 'relationship_behavior',
        table: table.name,
        message: `Table '${table.name}' has foreign keys and should define explicit ON DELETE / ON UPDATE behavior.`,
        recommendation: `Choose whether dependent rows should RESTRICT, CASCADE, or SET NULL on updates and deletes.`,
      });
    }

    if (hasBusinessState && /bet|settlement|event/.test(tableNameLower)) {
      recommendations.push({
        type: 'migration_readiness',
        table: table.name,
        message: `Table '${table.name}' uses business states that may need a migration-safe strategy over time.`,
        recommendation: `Use a lookup table or enum/domain constraint for state values to make future changes safer.`,
      });
    }

    if (shouldRecommendCompositeIndex(table)) {
      const compositeColumns = getCompositeIndexColumns(table);
      recommendations.push({
        type: 'missing_composite_index',
        table: table.name,
        message: `Table '${table.name}' would benefit from a composite index on ${compositeColumns.join(', ')}.`,
        recommendation: `Create an index on (${compositeColumns.join(', ')}) for common filtered lookups.`,
      });
    }
  }

  // 3. Check for possible foreign key candidates based on naming
  const GENERIC_ID_COLUMNS = new Set([
    'public_id', 'external_id', 'reference_id', 'aggregate_id',
    'entity_id', 'object_id', 'token_id', 'uuid', 'id',
  ]);

  function findMatchingTable(name) {
    return tables.find(t => 
      t.name === name ||
      t.name === `${name}s` ||
      t.name === `${name}es` ||
      t.name === `${name}_id`
    );
  }

  for (const table of tables) {
    for (const column of table.columns) {
      if (!column.name || typeof column.name !== 'string') continue;
      const colName = column.name.toLowerCase();
      const tablePattern = tablePatterns[table.name] || [];

      if (shouldSuggestForeignKey(colName, tablePattern, mode)) {
        const hasFk = table.foreignKeys.some(fk => fk.column === column.name);
        const guessedTable = colName.replace(/_id$/, '');
        const matchedTable = findMatchingTable(guessedTable);

        if (!hasFk && matchedTable) {
          recommendations.push({
            type: 'possible_foreign_key',
            table: table.name,
            column: column.name,
            message: `Column '${column.name}' in table '${table.name}' looks like it may reference '${matchedTable.name}', but no foreign key constraint exists. This is a naming-based heuristic; please verify before applying a constraint.`, 
            recommendation: `If this is a foreign key, add: ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${colName} FOREIGN KEY (${column.name}) REFERENCES ${matchedTable.name}(id);`,
            sql: `ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${colName} FOREIGN KEY (${column.name}) REFERENCES ${matchedTable.name}(id);`,
          });
        }
      }
    }
  }

  // 3. Check for missing indexes on foreign key columns
  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      if (!isColumnIndexed(table, fk.column)) {
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

      if ((colName === 'email' || colName === 'username') && !column.isUnique && !column.isPrimary && !hasUniqueConstraint(table, column.name)) {
        recommendations.push({
          type: 'missing_unique',
          table: table.name,
          column: column.name,
          message: `Column '${column.name}' in table '${table.name}' should probably be UNIQUE`,
          sql: `ALTER TABLE ${table.name} ADD CONSTRAINT uk_${table.name}_${column.name} UNIQUE(${column.name});`,
          benefit: 'Prevents duplicate emails/usernames and improves query performance',
        });
      }

      if (colName === 'email' && !isColumnIndexed(table, column.name)) {
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
  const healthScore = calculateHealthScore(tables, issues, recommendations, mode);

  return {
    healthScore,
    issues,
    recommendations,
    tables,
    relationships,
    patterns,
    tablePatterns,
    mode,
  };
}

function detectSchemaPatterns(tables) {
  const patterns = new Set();
  const tablePatterns = {};

  for (const table of tables) {
    const tableName = table.name.toLowerCase();
    const columnNames = table.columns.map(c => c.name.toLowerCase());
    const tablePattern = [];

    if (isEventOutboxTable(tableName, columnNames)) {
      tablePattern.push('event_outbox');
      patterns.add('event_outbox');
    }
    if (isLedgerTable(tableName, columnNames)) {
      tablePattern.push('financial_ledger');
      patterns.add('financial_ledger');
    }
    if (isBettingTable(tableName, columnNames)) {
      tablePattern.push('betting_domain');
      patterns.add('betting_domain');
    }
    if (isPolymorphicTable(columnNames)) {
      tablePattern.push('polymorphic_reference');
      patterns.add('polymorphic_reference');
    }
    if (isAuditTable(tableName, columnNames)) {
      tablePattern.push('audit_log');
      patterns.add('audit_log');
    }

    tablePatterns[table.name] = tablePattern;
  }

  return { patterns: [...patterns], tablePatterns };
}

function isEventOutboxTable(tableName, columnNames) {
  if (!/outbox|event(_log)?|messages?|notifications?/.test(tableName)) {
    return false;
  }
  const hasKeyIndicator = columnNames.includes('payload') || columnNames.includes('payload_json')
    || (columnNames.includes('aggregate_id') && columnNames.includes('aggregate_type'));
  return hasKeyIndicator;
}

function isLedgerTable(tableName, columnNames) {
  if (!/transaction|ledger|wallet|payment|entry|journal/.test(tableName)) return false;
  const hasKeyIndicator = columnNames.includes('amount') || columnNames.includes('balance')
    || columnNames.includes('wallet_id') || columnNames.includes('currency');
  return hasKeyIndicator;
}

function isBettingTable(tableName, columnNames) {
  if (!/bet|market|odds|event/.test(tableName)) return false;
  const hasKeyIndicator = columnNames.includes('odds') || columnNames.includes('stake')
    || columnNames.includes('payout') || columnNames.includes('market_id') || columnNames.includes('bet_id');
  return hasKeyIndicator;
}

function isPolymorphicTable(columnNames) {
  return (columnNames.includes('reference_type') && columnNames.includes('reference_id'))
    || (columnNames.includes('aggregate_type') && columnNames.includes('aggregate_id'));
}

function isAuditTable(tableName, columnNames) {
  if (!/audit|history|log|event(_log)?/.test(tableName)) {
    return false;
  }
  const hasKeyIndicator = columnNames.includes('created_at') && columnNames.includes('payload')
    || columnNames.includes('action')
    || columnNames.includes('entity_type');
  return hasKeyIndicator;
}

function shouldSuggestForeignKey(colName, tablePattern, mode) {
  const skipColumns = new Set([
    'reference_id', 'aggregate_id', 'object_id', 'entity_id', 'external_id', 'public_id', 'token_id', 'uuid', 'id',
  ]);

  if (skipColumns.has(colName)) return false;
  if (tablePattern.includes('polymorphic_reference')) return false;
  if (colName === 'password_hash') return false;
  if (colName === 'payload' || colName === 'payload_json') return false;

  return colName.endsWith('_id');
}

function shouldRequireNonNull(colName, tableNameLower, column) {
  if (column.nullable === false) return false;

  const requiredColumns = new Set([
    'user_id', 'wallet_id', 'event_id', 'account_id', 'bet_id', 'transaction_id',
    'payment_id', 'order_id', 'customer_id', 'merchant_id', 'tenant_id'
  ]);

  return requiredColumns.has(colName) || /(?:^|_)(user|wallet|event|account|bet|transaction|payment|order|customer|merchant|tenant)_id$/.test(colName);
}

function shouldSuggestDomainConstraint(colName, colType, tableNameLower, table) {
  const isDomainColumn = ['status', 'state', 'type', 'kind', 'currency'].includes(colName);
  const isFreeText = ['VARCHAR', 'CHAR', 'TEXT'].includes(colType);
  const hasConstraint = table.columns.some(column => column.name.toLowerCase() === colName && (column.check || column.isPrimary || column.isUnique));

  return isDomainColumn && isFreeText && !hasConstraint;
}

function shouldSuggestNumericType(colName, colType, tableNameLower) {
  const moneyColumns = new Set(['amount', 'balance', 'price', 'stake', 'odds', 'fee', 'payout', 'total', 'deposit', 'withdrawal']);
  if (!moneyColumns.has(colName)) return false;
  return !/NUMERIC|DECIMAL|DOUBLE|REAL|FLOAT|MONEY|INT|BIGINT|SMALLINT|SERIAL|BIGSERIAL/.test(colType);
}

function shouldSuggestTimestampType(colName, colType, tableNameLower) {
  if (!/created_at|updated_at|deleted_at|settled_at|closed_at|expires_at|occurred_at/.test(colName)) return false;
  return !/TIMESTAMP|TIMESTAMPTZ|DATE/.test(colType);
}

function shouldRecommendCompositeIndex(table) {
  const columns = table.columns.map(column => String(column.name || '').toLowerCase());
  const candidates = [];
  if (columns.includes('user_id') && columns.includes('created_at')) candidates.push(['user_id', 'created_at']);
  if (columns.includes('event_id') && columns.includes('status')) candidates.push(['event_id', 'status']);
  if (columns.includes('wallet_id') && columns.includes('created_at')) candidates.push(['wallet_id', 'created_at']);
  if (columns.includes('user_id') && columns.includes('status')) candidates.push(['user_id', 'status']);

  const tableColumns = new Set(columns);
  const hasExistingCompositeIndex = (table.indexes || []).some(index => {
    const indexCols = (index.columns || []).map(col => String(col || '').toLowerCase());
    return indexCols.length >= 2 && indexCols.every(col => tableColumns.has(col));
  });

  return candidates.length > 0 && !hasExistingCompositeIndex;
}

function getCompositeIndexColumns(table) {
  const columns = table.columns.map(column => String(column.name || '').toLowerCase());
  if (columns.includes('user_id') && columns.includes('created_at')) return ['user_id', 'created_at'];
  if (columns.includes('event_id') && columns.includes('status')) return ['event_id', 'status'];
  if (columns.includes('wallet_id') && columns.includes('created_at')) return ['wallet_id', 'created_at'];
  if (columns.includes('user_id') && columns.includes('status')) return ['user_id', 'status'];
  return [];
}

/**
 * Calculate a 0-100 health score
 */
function calculateHealthScore(tables, issues, recommendations, mode) {
  let score = 100;
  const strictMode = mode === 'crud';

  const weightedPenalty = (item) => {
    const type = String(item?.type || '').toLowerCase();
    if (item?.severity === 'high' || ['missing_primary_key', 'missing_idempotency', 'concurrency_control', 'ledger_model', 'transaction_safety', 'circular_dependency'].includes(type)) {
      return strictMode ? 15 : 12;
    }
    if (item?.severity === 'medium' || ['nullable_required_column', 'business_rule_constraints', 'relationship_behavior'].includes(type)) {
      return strictMode ? 8 : 5;
    }
    if (['domain_constraint', 'migration_readiness', 'type_safety', 'timestamp_safety', 'missing_composite_index'].includes(type)) {
      return strictMode ? 4 : 2;
    }
    return strictMode ? 2 : 1;
  };

  for (const issue of issues) {
    score -= weightedPenalty(issue);
  }

  for (const recommendation of recommendations) {
    score -= weightedPenalty(recommendation);
  }

  const highRiskTables = tables.filter(table => isHighRiskTable(table)).length;
  if (highRiskTables > 0) {
    score -= Math.min(highRiskTables * 4, 12);
  }

  // Bonus for explicit foreign keys and indexes, but only a small benefit.
  const explicitFKs = tables.reduce((sum, t) => sum + t.foreignKeys.length, 0);
  score += Math.min(explicitFKs, 3);

  const totalIndexes = tables.reduce((sum, t) => sum + t.indexes.length, 0);
  score += Math.min(totalIndexes * 0.5, 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function isHighRiskTable(table) {
  const names = table.columns.map(col => String(col.name || '').toLowerCase());
  const tableName = String(table.name || '').toLowerCase();
  const financialIndicators = /(wallet|payment|deposit|withdraw|transaction|ledger|bet|settlement|market|balance|account)/.test(tableName);
  const moneyFields = names.some(name => ['amount', 'balance', 'price', 'stake', 'odds', 'fee', 'payout', 'deposit', 'withdrawal'].includes(name));
  const stateFields = names.some(name => ['status', 'state', 'type'].includes(name));
  return financialIndicators || (moneyFields && stateFields);
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
    if (rel.from === rel.to) continue; // self-references are valid hierarchical relationships, not cycles
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

function isColumnIndexed(table, columnName) {
  const normalized = columnName.toLowerCase();
  const hasIndexedColumn = table.indexes.some(idx => idx.columns.some(col => col.toLowerCase() === normalized))
    || table.primaryKeys.some(pk => pk.toLowerCase() === normalized)
    || table.columns.some(col => col.name.toLowerCase() === normalized && (col.isPrimary || col.isUnique));
  const hasUniqueColumn = table.constraints?.some(constraint =>
    constraint.type === 'unique' && constraint.columns.some(col => col.toLowerCase() === normalized)
  );
  return hasIndexedColumn || hasUniqueColumn;
}

function hasUniqueConstraint(table, columnName) {
  const normalized = columnName.toLowerCase();
  if (table.columns.some(col => col.name.toLowerCase() === normalized && (col.isPrimary || col.isUnique))) {
    return true;
  }
  return table.constraints?.some(constraint =>
    constraint.type === 'unique' && constraint.columns.some(col => col.toLowerCase() === normalized)
  );
}

function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

module.exports = { analyzeSchema };