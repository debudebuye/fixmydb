function shouldSuggestForeignKey(colName, tablePattern, _mode) {
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

function shouldSuggestDomainConstraint(colName, colType, _tableNameLower, table) {
  const isDomainColumn = ['status', 'state', 'type', 'kind', 'currency'].includes(colName);
  const isFreeText = ['VARCHAR', 'CHAR', 'TEXT'].includes(colType);
  const hasConstraint = table.columns.some(column => column.name.toLowerCase() === colName && (column.check || column.isPrimary || column.isUnique));

  return isDomainColumn && isFreeText && !hasConstraint;
}

function shouldSuggestNumericType(colName, colType, _tableNameLower) {
  const moneyColumns = new Set(['amount', 'balance', 'price', 'stake', 'odds', 'fee', 'payout', 'total', 'deposit', 'withdrawal']);
  if (!moneyColumns.has(colName)) return false;
  return !/NUMERIC|DECIMAL|DOUBLE|REAL|FLOAT|MONEY|INT|BIGINT|SMALLINT|SERIAL|BIGSERIAL/.test(colType);
}

function shouldSuggestTimestampType(colName, colType, _tableNameLower) {
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

function detectCircularDependencies(tables, relationships) {
  const graph = {};
  for (const table of tables) {
    graph[table.name] = [];
  }
  for (const rel of relationships) {
    if (rel.from === rel.to) continue;
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

module.exports = {
  shouldSuggestForeignKey,
  shouldRequireNonNull,
  shouldSuggestDomainConstraint,
  shouldSuggestNumericType,
  shouldSuggestTimestampType,
  shouldRecommendCompositeIndex,
  getCompositeIndexColumns,
  detectCircularDependencies,
};
