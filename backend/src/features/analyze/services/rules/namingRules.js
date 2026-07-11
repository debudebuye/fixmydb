const { toSnakeCase } = require('./helpers');

function namingRules(table) {
  const issues = [];

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

  return { issues };
}

module.exports = { run: namingRules };
