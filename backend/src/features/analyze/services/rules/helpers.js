function isColumnIndexed(table, columnName) {
  const normalized = columnName.toLowerCase();
  const hasIndexedColumn = table.indexes.some(idx => idx.columns.some(col => col.toLowerCase() === normalized))
    || table.primaryKeys.some(pk => pk.toLowerCase() === normalized)
    || table.columns.some(col => col.name.toLowerCase() === normalized && (col.isPrimary || col.isUnique));
  const hasUniqueColumn = table.constraints?.some(constraint =>
    constraint.type === 'unique' && constraint.columns.some(col => col.toLowerCase() === normalized)
  );
  return hasIndexedColumn || hasUniqueColumn;
}

function hasUniqueConstraint(table, columnName) {
  const normalized = columnName.toLowerCase();
  if (table.columns.some(col => col.name.toLowerCase() === normalized && (col.isPrimary || col.isUnique))) {
    return true;
  }
  return table.constraints?.some(constraint =>
    constraint.type === 'unique' && constraint.columns.some(col => col.toLowerCase() === normalized)
  );
}

function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function normalizeSerialType(type) {
  const upper = (type || '').toUpperCase();
  if (upper === 'SERIAL' || upper === 'SERIAL4') return 'INTEGER';
  if (upper === 'BIGSERIAL' || upper === 'SERIAL8') return 'BIGINT';
  if (upper === 'SMALLSERIAL' || upper === 'SERIAL2') return 'SMALLINT';
  return type;
}

module.exports = { isColumnIndexed, hasUniqueConstraint, toSnakeCase, normalizeSerialType };
