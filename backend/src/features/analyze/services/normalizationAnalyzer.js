/**
 * Normalization Analysis (1NF, 2NF, 3NF)
 */

function analyzeNormalization(schema, tablePatterns = {}, options = {}) {
  const { tables } = schema;
  const mode = String(options.mode || 'system').toLowerCase();
  const violations = [];
  const suggestions = [];

  for (const table of tables) {
    const tableName = table.name;
    const patternTags = tablePatterns[tableName] || [];

    // 1NF: Check for atomic values (detect array-like column names or JSON types)
    for (const column of table.columns) {
      if (!column.name || typeof column.name !== 'string') continue;
      const colName = column.name.toLowerCase();
      const colType = String(column.type || '').toUpperCase();

      if (shouldIgnoreNonAtomic(column, patternTags, mode)) continue;

      // Only flag if there are actual semantic indicators of non-atomic data
      if (isActuallyNonAtomic(colName, colType)) {
        violations.push({
          table: table.name,
          column: column.name,
          normalForm: '1NF',
          violation: 'Possible non-atomic value',
          explanation: `Column '${column.name}' appears to store multiple delimited or structured values`,
          suggestion: `Consider creating a separate table for these values with a foreign key reference`,
        });
      }
    }

    // 2NF: Check for partial dependencies (columns that depend on part of a composite key)
    if (table.primaryKeys.length > 1) {
      const nonKeyColumns = table.columns.filter(c => !table.primaryKeys.includes(c.name));
      if (nonKeyColumns.length > 0 && !patternTags.includes('event_outbox') && !patternTags.includes('audit_log')) {
        suggestions.push({
          table: table.name,
          normalForm: '2NF',
          message: `Table '${table.name}' has a composite key. Verify that all non-key columns depend on the ENTIRE key, not just part of it.`,
          suggestion: `If any column depends only on one part of the key, extract it to a separate table`,
        });
      }
    }

    // 3NF: Only flag transitive dependencies when there is stronger evidence than naming conventions.
    // Naming patterns alone are not sufficient for normalization warnings.

    const hasForeignCustomer = table.foreignKeys.some(fk => fk.column === 'customer_id');
    const hasForeignUser = table.foreignKeys.some(fk => fk.column === 'user_id');
    const hasForeignProduct = table.foreignKeys.some(fk => fk.column === 'product_id');

    if (hasForeignCustomer) {
      suggestions.push({
        table: table.name,
        normalForm: 'intentional-denormalization',
        message: `Table '${table.name}' denormalizes customer attributes alongside a customer_id foreign key for performance optimization.`,
        suggestion: 'This is a valid pattern when you want to avoid repeated joins for frequently accessed customer information.',
      });
    }

    if (hasForeignUser) {
      suggestions.push({
        table: table.name,
        normalForm: 'intentional-denormalization',
        message: `Table '${table.name}' denormalizes user attributes alongside a user_id foreign key for performance optimization.`,
        suggestion: 'This is a valid pattern when you need user data readily available without joining the users table.',
      });
    }

    if (hasForeignProduct) {
      suggestions.push({
        table: table.name,
        normalForm: 'intentional-denormalization',
        message: `Table '${table.name}' denormalizes product attributes alongside a product_id foreign key for performance optimization.`,
        suggestion: 'This is a valid pattern to keep product snapshot data with the related record.',
      });
    }

    if (patternTags.includes('event_outbox') || patternTags.includes('audit_log')) {
      suggestions.push({
        table: table.name,
        normalForm: 'architecture-awareness',
        message: `Table '${table.name}' appears to be part of an event or outbox pattern. JSON payload and polymorphic references are acceptable design tradeoffs here.`,
        suggestion: 'Treat this table as a log/event pattern rather than a strict normalization candidate.',
      });
    }
  }

  const maxViolations = tables.length * 3;
  const violationCount = violations.length;
  const normalizationScore = Math.max(0, 100 - Math.round((violationCount / Math.max(maxViolations, 1)) * 100));

  return {
    normalizationScore,
    violations,
    suggestions,
  };
}

function isActuallyNonAtomic(colName, colType) {
  if (colType === 'TEXT') return false;
  if (colType.includes('CHAR')) return false;
  
  const nonAtomicIndicators = ['delimited', 'csv', 'array_agg', 'list_values', 'json_array'];
  return nonAtomicIndicators.some(indicator => colName.includes(indicator));
}

function shouldIgnoreNonAtomic(column, patternTags, mode) {
  if (!column.name || typeof column.name !== 'string') return false;
  const colName = column.name.toLowerCase();
  const colType = String(column.type || '').toUpperCase();

  const domainSafeNames = new Set([
    'password_hash',
    'reference_type',
    'reference_id',
    'aggregate_type',
    'aggregate_id',
    'payload',
    'payload_json',
    'metadata',
    'settings',
    'config',
    'description',
    'content',
    'body',
    'message',
    'notes',
    'comment',
    'text',
  ]);

  if (domainSafeNames.has(colName)) return true;
  if (patternTags.includes('event_outbox') && (colName.includes('payload') || colType.includes('JSON'))) return true;
  if ((patternTags.includes('audit_log') || patternTags.includes('financial_ledger')) && colType.includes('JSON')) return true;
  if (mode !== 'crud' && colType === 'TEXT' && colName.includes('payload')) return true;

  return false;
}

module.exports = { analyzeNormalization };