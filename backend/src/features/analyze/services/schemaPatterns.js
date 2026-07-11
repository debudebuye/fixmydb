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

module.exports = { detectSchemaPatterns };
