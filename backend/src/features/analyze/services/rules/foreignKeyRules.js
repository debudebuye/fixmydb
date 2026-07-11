const { shouldSuggestForeignKey } = require('../schemaIssues');
const { isColumnIndexed, normalizeSerialType } = require('./helpers');

function foreignKeyCandidates(table, { tables, tablePatterns }) {
  const recommendations = [];

  for (const column of table.columns) {
    if (!column.name || typeof column.name !== 'string') continue;
    const colName = column.name.toLowerCase();
    const tablePattern = tablePatterns[table.name] || [];

    if (shouldSuggestForeignKey(colName, tablePattern)) {
      const hasFk = table.foreignKeys.some(fk => fk.column === column.name);
      const guessedTable = colName.replace(/_id$/, '');
      const matchedTable = tables.find(t =>
        t.name === guessedTable ||
        t.name === `${guessedTable}s` ||
        t.name === `${guessedTable}es` ||
        t.name === `${guessedTable}_id`
      );

      if (!hasFk && matchedTable) {
        const refCol = matchedTable.columns.find(c =>
          c.isPrimary || matchedTable.primaryKeys.includes(c.name)
        );
        let typeHint = '';
        if (refCol && normalizeSerialType(column.type) !== normalizeSerialType(refCol.type)) {
          typeHint = ` Note: column type '${column.type}' differs from referenced PK type '${refCol.type}'. Change to '${normalizeSerialType(refCol.type)}' first.`;
        }

        const fkSql = typeHint
          ? `ALTER TABLE ${table.name} ALTER COLUMN ${column.name} TYPE ${normalizeSerialType(refCol.type)};\nALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${colName} FOREIGN KEY (${column.name}) REFERENCES ${matchedTable.name}(id) ON DELETE RESTRICT;`
          : `ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${colName} FOREIGN KEY (${column.name}) REFERENCES ${matchedTable.name}(id) ON DELETE RESTRICT;`;

        recommendations.push({
          type: 'possible_foreign_key',
          table: table.name,
          column: column.name,
          message: `Column '${column.name}' in table '${table.name}' looks like it may reference '${matchedTable.name}', but no foreign key constraint exists. This is a naming-based heuristic; please verify before applying a constraint.${typeHint}`,
          recommendation: fkSql,
          sql: fkSql,
        });
      }
    }
  }

  return { recommendations };
}

function missingFkIndexes(table) {
  const recommendations = [];

  for (const fk of table.foreignKeys) {
    if (!isColumnIndexed(table, fk.column)) {
      recommendations.push({
        type: 'missing_index',
        table: table.name,
        column: fk.column,
        message: `Consider adding an index on '${table.name}.${fk.column}' for better join performance`,
        sql: `CREATE INDEX idx_${table.name}_${fk.column} ON ${table.name}(${fk.column});`,
        benefit: 'Speeds up JOIN queries and foreign key lookups',
      });
    }
  }

  return { recommendations };
}

function relationshipBehavior(table) {
  if (table.foreignKeys.length > 0) {
    return {
      recommendations: [{
        type: 'relationship_behavior',
        table: table.name,
        message: `Table '${table.name}' has foreign keys and should define explicit ON DELETE / ON UPDATE behavior.`,
        recommendation: `Choose whether dependent rows should RESTRICT, CASCADE, or SET NULL on updates and deletes.`,
      }],
    };
  }
  return {};
}

module.exports = {
  runForeignKeyCandidates: foreignKeyCandidates,
  runMissingFkIndexes: missingFkIndexes,
  runRelationshipBehavior: relationshipBehavior,
};
