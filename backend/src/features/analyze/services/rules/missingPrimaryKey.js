function missingPrimaryKey(table) {
  if (table.primaryKeys.length === 0) {
    return {
      issues: [{
        severity: 'high',
        table: table.name,
        type: 'missing_primary_key',
        message: `Table '${table.name}' has no primary key defined`,
        recommendation: `Add a primary key to table '${table.name}'. Consider: id SERIAL PRIMARY KEY or UUID primary key.`,
      }],
    };
  }
  return {};
}

module.exports = { run: missingPrimaryKey };
