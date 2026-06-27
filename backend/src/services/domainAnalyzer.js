/**
 * Layer 2 + 4: Domain Analysis with Confidence Tracking
 * Identifies domain type, applies domain-specific rules, and tracks confidence levels
 */

function analyzeDomain(schema, tablePatterns = {}) {
  const { tables } = schema;
  const domainSignals = identifyDomainSignals(tables, tablePatterns);
  const detectedDomain = selectDomain(domainSignals);
  const domainRules = applyDomainRules(tables, detectedDomain);
  const confidenceAnalysis = analyzeConfidence(tables, domainRules);

  return {
    detectedDomain,
    domainSignals,
    domainRules,
    confidenceAnalysis,
  };
}

function identifyDomainSignals(tables, tablePatterns) {
  const signals = {};
  const tableNames = tables.map(t => t.name.toLowerCase());
  const allColumns = tables.flatMap(t => t.columns.map(c => c.name.toLowerCase()));

  const domainPatterns = {
    financial: {
      tableKeywords: ['wallet', 'payment', 'transaction', 'ledger', 'balance', 'account', 'deposit', 'withdrawal'],
      columnKeywords: ['balance', 'amount', 'debit', 'credit', 'currency'],
      weight: 0,
    },
    betting: {
      tableKeywords: ['bet', 'event', 'odds', 'market', 'settlement', 'wager'],
      columnKeywords: ['odds', 'stake', 'payout', 'event_id', 'market_id'],
      weight: 0,
    },
    ecommerce: {
      tableKeywords: ['product', 'order', 'customer', 'inventory', 'cart', 'checkout'],
      columnKeywords: ['price', 'quantity', 'sku', 'product_id'],
      weight: 0,
    },
    healthcare: {
      tableKeywords: ['patient', 'appointment', 'prescription', 'medical', 'diagnosis', 'provider'],
      columnKeywords: ['patient_id', 'medical_record', 'diagnosis'],
      weight: 0,
    },
  };

  for (const [domain, pattern] of Object.entries(domainPatterns)) {
    signals[domain] = {
      confidence: 0,
      matchingTables: [],
      matchingColumns: [],
    };

    for (const keyword of pattern.tableKeywords) {
      const matches = tableNames.filter(name => name.includes(keyword));
      if (matches.length > 0) {
        signals[domain].matchingTables.push(...matches);
        signals[domain].confidence += matches.length * 0.3;
      }
    }

    for (const keyword of pattern.columnKeywords) {
      const matches = allColumns.filter(col => col.includes(keyword));
      if (matches.length > 0) {
        signals[domain].matchingColumns.push(...matches);
        signals[domain].confidence += Math.min(matches.length * 0.2, 0.5);
      }
    }
  }

  return signals;
}

function selectDomain(domainSignals) {
  let highestDomain = null;
  let highestConfidence = 0;

  for (const [domain, signal] of Object.entries(domainSignals)) {
    if (signal.confidence > highestConfidence) {
      highestConfidence = signal.confidence;
      highestDomain = domain;
    }
  }

  return {
    type: highestDomain || 'generic',
    confidence: Math.min(highestConfidence, 1.0),
  };
}

function applyDomainRules(tables, detectedDomain) {
  const rules = [];

  if (detectedDomain.type === 'financial' || detectedDomain.type === 'betting') {
    rules.push(applyFinancialRules(tables));
  }
  if (detectedDomain.type === 'ecommerce') {
    rules.push(applyEcommerceRules(tables));
  }

  return rules.filter(Boolean).flat();
}

function applyFinancialRules(tables) {
  const findings = [];
  const walletTables = tables.filter(t => /wallet|account|balance/.test(t.name.toLowerCase()));
  const transactionTables = tables.filter(t => /transaction|ledger|entry|journal/.test(t.name.toLowerCase()));
  const betTables = tables.filter(t => /bet|wager/.test(t.name.toLowerCase()));

  for (const table of walletTables) {
    const cols = table.columns.map(c => c.name.toLowerCase());
    const hasBalance = cols.some(c => ['balance', 'current_balance', 'available_balance'].includes(c));
    const hasVersion = cols.some(c => ['version', 'row_version', 'optimistic_lock'].includes(c));
    const hasIdempotencyKey = cols.some(c => ['idempotency_key', 'request_id', 'idempotency_id'].includes(c));

    findings.push({
      type: 'financial_rule',
      severity: 'high',
      table: table.name,
      rule: 'mutable_balance_model',
      fact: hasBalance && !hasVersion,
      message: hasBalance && !hasVersion
        ? `Table '${table.name}' stores mutable balance without concurrency control.`
        : `Table '${table.name}' has proper concurrency controls.`,
      confidence: 'high',
    });

    findings.push({
      type: 'financial_rule',
      severity: 'high',
      table: table.name,
      rule: 'idempotency_support',
      fact: !hasIdempotencyKey,
      message: !hasIdempotencyKey
        ? `Table '${table.name}' lacks idempotency key for retry safety.`
        : `Table '${table.name}' supports idempotent operations.`,
      confidence: 'high',
    });
  }

  for (const table of transactionTables) {
    const cols = table.columns.map(c => c.name.toLowerCase());
    const isAppendOnly = table.columns.some(c => c.name.toLowerCase() === 'deleted_at' || c.name.toLowerCase() === 'is_deleted');
    findings.push({
      type: 'financial_rule',
      severity: 'high',
      table: table.name,
      rule: 'append_only_ledger',
      fact: !isAppendOnly,
      message: !isAppendOnly
        ? `Table '${table.name}' allows mutation of financial records (risky).`
        : `Table '${table.name}' supports immutable ledger pattern.`,
      confidence: 'medium',
    });
  }

  for (const table of betTables) {
    const cols = table.columns.map(c => c.name.toLowerCase());
    const hasStatus = cols.includes('status');
    const hasSettledAt = cols.includes('settled_at');
    const hasEventId = cols.some(c => c.includes('event'));

    findings.push({
      type: 'financial_rule',
      severity: 'high',
      table: table.name,
      rule: 'betting_lifecycle',
      fact: hasStatus && hasSettledAt,
      message: hasStatus && hasSettledAt
        ? `Table '${table.name}' models betting lifecycle with status and settlement tracking.`
        : `Table '${table.name}' lacks explicit settlement tracking for betting events.`,
      confidence: 'high',
    });

    findings.push({
      type: 'financial_rule',
      severity: 'high',
      table: table.name,
      rule: 'event_reference',
      fact: hasEventId,
      message: hasEventId
        ? `Table '${table.name}' properly references events.`
        : `Table '${table.name}' missing event relationship for betting constraints.`,
      confidence: 'high',
    });
  }

  return findings;
}

function applyEcommerceRules(tables) {
  const findings = [];
  const orderTables = tables.filter(t => /order|cart|checkout/.test(t.name.toLowerCase()));
  const productTables = tables.filter(t => /product|item|sku/.test(t.name.toLowerCase()));

  for (const table of orderTables) {
    const cols = table.columns.map(c => c.name.toLowerCase());
    const hasStatus = cols.includes('status');
    const hasOrderItems = tables.some(t => t.name.toLowerCase().includes('order_item') || t.name.toLowerCase().includes('order_line'));

    findings.push({
      type: 'ecommerce_rule',
      severity: 'medium',
      table: table.name,
      rule: 'order_composition',
      fact: hasOrderItems,
      message: hasOrderItems
        ? `Table '${table.name}' properly uses order items for line items.`
        : `Orders may lack proper item composition tracking.`,
      confidence: 'medium',
    });
  }

  return findings;
}

function analyzeConfidence(tables, domainRules) {
  const facts = [];
  const inferences = [];
  const unknowns = [];

  for (const rule of domainRules) {
    if (rule.confidence === 'high') {
      if (rule.fact) {
        facts.push(rule);
      } else {
        inferences.push(rule);
      }
    } else if (rule.confidence === 'medium') {
      inferences.push(rule);
    }
  }

  // Add unknowns
  unknowns.push({
    category: 'concurrency_strategy',
    message: 'Cannot determine if application uses SELECT...FOR UPDATE, optimistic locking, or Redis locks from schema alone.',
    confidence: 'unknown',
  });

  unknowns.push({
    category: 'transaction_boundaries',
    message: 'Cannot verify if multi-table updates are wrapped in transactions from schema alone.',
    confidence: 'unknown',
  });

  unknowns.push({
    category: 'application_logic',
    message: 'Cannot determine business rule enforcement in application code from schema alone.',
    confidence: 'unknown',
  });

  unknowns.push({
    category: 'idempotency_implementation',
    message: 'Cannot verify if idempotency_key is actually checked in application code from schema alone.',
    confidence: 'unknown',
  });

  return {
    facts,
    inferences,
    unknowns,
    summary: {
      factCount: facts.length,
      inferenceCount: inferences.length,
      unknownCount: unknowns.length,
      trustScore: calculateTrustScore(facts, inferences, unknowns),
    },
  };
}

function calculateTrustScore(facts, inferences, unknowns) {
  const total = facts.length + inferences.length + unknowns.length;
  if (total === 0) return 0;
  return Math.round(((facts.length * 1.0 + inferences.length * 0.5) / total) * 100);
}

module.exports = { analyzeDomain };
