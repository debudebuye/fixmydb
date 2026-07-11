const PENALTY_TIERS = [
  {
    types: ['missing_primary_key', 'missing_idempotency', 'concurrency_control', 'ledger_model', 'transaction_safety', 'circular_dependency'],
    penalty: { default: 12, strict: 15 },
  },
  {
    types: ['nullable_required_column', 'business_rule_constraints', 'relationship_behavior'],
    penalty: { default: 5, strict: 8 },
  },
  {
    types: ['domain_constraint', 'migration_readiness', 'type_safety', 'timestamp_safety', 'missing_composite_index'],
    penalty: { default: 2, strict: 4 },
  },
];

const FALLBACK_PENALTY = { default: 1, strict: 2 };

function calculateHealthScore(tables, issues, recommendations, mode) {
  let score = 100;
  const strictMode = mode === 'strict';

  for (const issue of issues) {
    score -= weightedPenalty(issue, strictMode);
  }

  const highRiskTables = tables.filter(table => isHighRiskTable(table)).length;
  if (highRiskTables > 0) {
    score -= Math.min(highRiskTables * 4, 12);
  }

  const explicitFKs = tables.reduce((sum, t) => sum + t.foreignKeys.length, 0);
  score += Math.min(explicitFKs, 3);

  const totalIndexes = tables.reduce((sum, t) => sum + t.indexes.length, 0);
  score += Math.min(totalIndexes * 0.5, 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function weightedPenalty(item, strictMode) {
  if (!item) return FALLBACK_PENALTY[strictMode ? 'strict' : 'default'];

  const type = String(item.type || '').toLowerCase();

  if (item.severity === 'high') {
    return strictMode ? 15 : 12;
  }

  for (const tier of PENALTY_TIERS) {
    if (tier.types.includes(type)) {
      return strictMode ? tier.penalty.strict : tier.penalty.default;
    }
  }

  return strictMode ? FALLBACK_PENALTY.strict : FALLBACK_PENALTY.default;
}

function isHighRiskTable(table) {
  const names = table.columns.map(col => String(col.name || '').toLowerCase());
  const tableName = String(table.name || '').toLowerCase();
  const financialIndicators = /(wallet|payment|deposit|withdraw|transaction|ledger|bet|settlement|market|balance|account)/.test(tableName);
  const moneyFields = names.some(name => ['amount', 'balance', 'price', 'stake', 'odds', 'fee', 'payout', 'deposit', 'withdrawal'].includes(name));
  const stateFields = names.some(name => ['status', 'state', 'type'].includes(name));
  return financialIndicators || (moneyFields && stateFields);
}

module.exports = { calculateHealthScore };
