function makeTable(name, columns, fks = [], pks = [], indexes = [], checks = [], constraints = []) {
  return { name, columns, foreignKeys: fks, primaryKeys: pks, indexes, checks, constraints };
}

function makeColumn(name, type = 'INTEGER', opts = {}) {
  return {
    name,
    type,
    nullable: opts.nullable !== undefined ? opts.nullable : true,
    default: opts.default || null,
    isPrimary: opts.isPrimary || false,
    isUnique: opts.isUnique || false,
    references: opts.references || null,
    check: opts.check || null,
    enumValues: opts.enumValues || null,
    length: opts.length || undefined,
    scale: opts.scale || undefined,
  };
}

module.exports = { makeTable, makeColumn };
