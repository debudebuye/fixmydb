/**
 * Normalization Analysis (1NF, 2NF, 3NF)
 */

function analyzeNormalization(schema) {
  const { tables } = schema;
  const violations = [];
  const suggestions = [];

  for (const table of tables) {
    // 1NF: Check for atomic values (detect array-like column names or JSON types)
    for (const column of table.columns) {
      if (!column.name || typeof column.name !== 'string') continue;
      const colName = column.name.toLowerCase();
      const colType = column.type.toUpperCase();

      if (colName.includes('list') || colName.includes('array') || colType.includes('JSON') || colType.includes('TEXT')) {
        violations.push({
          table: table.name,
          column: column.name,
          normalForm: '1NF',
          violation: 'Possible non-atomic value',
          explanation: `Column '${column.name}' may store multiple values (array, JSON, or delimited text)`,
          suggestion: `Consider creating a separate table for these values with a foreign key reference`,
        });
      }
    }

    // 2NF: Check for partial dependencies (columns that depend on part of a composite key)
    if (table.primaryKeys.length > 1) {
      // Composite key detected
      const nonKeyColumns = table.columns.filter(c => !table.primaryKeys.includes(c.name));
      if (nonKeyColumns.length > 0) {
        suggestions.push({
          table: table.name,
          normalForm: '2NF',
          message: `Table '${table.name}' has a composite key. Verify that all non-key columns depend on the ENTIRE key, not just part of it.`,
          suggestion: `If any column depends only on one part of the key, extract it to a separate table`,
        });
      }
    }

    // 3NF: Check for transitive dependencies (non-key columns depending on other non-key columns)
    // Heuristic: Look for repeated column prefixes suggesting embedded entities
    const columnNames = table.columns.map(c => c.name.toLowerCase());
    const prefixes = {};

    for (const name of columnNames) {
      const parts = name.split('_');
      if (parts.length > 1) {
        const prefix = parts[0];
        if (!prefixes[prefix]) prefixes[prefix] = [];
        prefixes[prefix].push(name);
      }
    }

    for (const [prefix, cols] of Object.entries(prefixes)) {
      if (cols.length >= 2 && !table.primaryKeys.includes(prefix) && prefix !== 'is' && prefix !== 'has') {
        violations.push({
          table: table.name,
          normalForm: '3NF',
          violation: 'Possible transitive dependency',
          explanation: `Multiple columns with prefix '${prefix}_*' suggest an embedded entity`,
          columns: cols,
          suggestion: `Consider creating a separate '${prefix}' table and referencing it with a foreign key`,
        });
      }
    }

    // Check for obvious embedded data (e.g., customer_name, customer_email in orders)
    const customerCols = columnNames.filter(c => c.startsWith('customer_'));
    const userCols = columnNames.filter(c => c.startsWith('user_') && c !== 'user_id');
    const productCols = columnNames.filter(c => c.startsWith('product_') && c !== 'product_id');

    if (customerCols.length > 1) {
      violations.push({
        table: table.name,
        normalForm: '3NF',
        violation: 'Embedded customer data',
        explanation: `Table contains customer attributes: ${customerCols.join(', ')}`,
        suggestion: `Create a 'customers' table and reference it with customer_id foreign key`,
      });
    }

    if (userCols.length > 1) {
      violations.push({
        table: table.name,
        normalForm: '3NF',
        violation: 'Embedded user data',
        explanation: `Table contains user attributes: ${userCols.join(', ')}`,
        suggestion: `Reference the 'users' table instead of duplicating user data`,
      });
    }

    if (productCols.length > 1) {
      violations.push({
        table: table.name,
        normalForm: '3NF',
        violation: 'Embedded product data',
        explanation: `Table contains product attributes: ${productCols.join(', ')}`,
        suggestion: `Create a 'products' table and reference it with product_id foreign key`,
      });
    }
  }

  // Generate normalization score
  const maxViolations = tables.length * 3; // Assume max 3 violations per table
  const violationCount = violations.length;
  const normalizationScore = Math.max(0, 100 - Math.round((violationCount / Math.max(maxViolations, 1)) * 100));

  return {
    normalizationScore,
    violations,
    suggestions,
  };
}

module.exports = { analyzeNormalization };
