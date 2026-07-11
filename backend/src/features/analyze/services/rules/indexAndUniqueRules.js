const { shouldRecommendCompositeIndex, getCompositeIndexColumns } = require('../schemaIssues');
const { isColumnIndexed, hasUniqueConstraint } = require('./helpers');

function compositeIndex(table) {
  if (shouldRecommendCompositeIndex(table)) {
    const compositeColumns = getCompositeIndexColumns(table);
    return {
      recommendations: [{
        type: 'missing_composite_index',
        table: table.name,
        message: `Table '${table.name}' would benefit from a composite index on ${compositeColumns.join(', ')}.`,
        recommendation: `Create an index on (${compositeColumns.join(', ')}) for common filtered lookups.`,
      }],
    };
  }
  return {};
}

function uniqueAndIndexColumns(table) {
  const recommendations = [];

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

    const filterColNames = ['sku', 'status', 'payment_status'];
    if (filterColNames.includes(colName) && !column.isPrimary && !column.isUnique && !isColumnIndexed(table, column.name)) {
      const label = colName === 'payment_status' ? 'payment status' : colName;
      recommendations.push({
        type: 'missing_index',
        table: table.name,
        column: column.name,
        message: `Add index on '${column.name}' for faster ${label} lookups and filtering`,
        sql: `CREATE INDEX idx_${table.name}_${column.name} ON ${table.name}(${column.name});`,
        benefit: `Speeds up queries filtering by ${label}`,
      });
    }
  }

  return { recommendations };
}

function compositeUnique(table) {
  const tableLower = table.name.toLowerCase();
  if (/order_item|order_line|cart_item/.test(tableLower)) {
    const hasOrderId = table.columns.some(c => /order_id/.test(c.name));
    const hasProductId = table.columns.some(c => /product_id/.test(c.name) || /item_id/.test(c.name));
    if (hasOrderId && hasProductId) {
      const hasUnique = table.constraints?.some(c => c.type === 'unique') || false;
      if (!hasUnique) {
        return {
          recommendations: [{
            type: 'composite_unique',
            table: table.name,
            message: `Table '${table.name}' should prevent duplicate entries for the same product in an order.`,
            recommendation: `Add a UNIQUE constraint: ALTER TABLE ${table.name} ADD CONSTRAINT uq_${table.name}_order_product UNIQUE (order_id, product_id);`,
            sql: `ALTER TABLE ${table.name} ADD CONSTRAINT uq_${table.name}_order_product UNIQUE (order_id, product_id);`,
          }],
        };
      }
    }
  }
  return {};
}

module.exports = {
  runCompositeIndex: compositeIndex,
  runUniqueAndIndexColumns: uniqueAndIndexColumns,
  runCompositeUnique: compositeUnique,
};
