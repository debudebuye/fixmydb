const { shouldRequireNonNull, shouldSuggestDomainConstraint, shouldSuggestNumericType, shouldSuggestTimestampType } = require('../schemaIssues');

function columnConstraints(table, _context) {
  const issues = [];
  const recommendations = [];
  const tableNameLower = table.name.toLowerCase();

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

  return { issues, recommendations };
}

module.exports = { run: columnConstraints };
