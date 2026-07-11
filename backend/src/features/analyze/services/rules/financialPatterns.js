function financialPatterns(table, _context) {
  const recommendations = [];
  const tableNameLower = table.name.toLowerCase();
  const columnNames = table.columns.map(column => String(column.name || '').toLowerCase());
  const isFinancialDomain = /(wallet|payment|deposit|withdraw|transaction|ledger|bet|settlement|market|odds|balance|account)/.test(tableNameLower);
  const hasMoneyFields = columnNames.some(name => ['amount','balance','price','stake','odds','fee','payout','total','deposit','withdrawal'].includes(name));
  const hasBusinessState = columnNames.some(name => ['status','state','type','kind','currency'].includes(name));
  const hasLifecycleColumns = columnNames.some(name => ['created_at','updated_at','deleted_at','settled_at','closed_at','expires_at','version','row_version'].includes(name));
  const hasBalanceColumn = columnNames.some(name => ['balance','current_balance','available_balance','ledger_balance'].includes(name));

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

  if (hasBusinessState && /bet|settlement|event/.test(tableNameLower)) {
    recommendations.push({
      type: 'migration_readiness',
      table: table.name,
      message: `Table '${table.name}' uses business states that may need a migration-safe strategy over time.`,
      recommendation: `Use a lookup table or enum/domain constraint for state values to make future changes safer.`,
    });
  }

  return { recommendations };
}

module.exports = { run: financialPatterns };
