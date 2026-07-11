function triggerRules(table) {
  const hasUpdatedAt = table.columns.some(c => c.name.toLowerCase() === 'updated_at');
  if (hasUpdatedAt) {
    return {
      recommendations: [{
        type: 'auto_update',
        table: table.name,
        message: `Table '${table.name}' has an 'updated_at' column with DEFAULT CURRENT_TIMESTAMP, but PostgreSQL will only set it on INSERT, not UPDATE.`,
        recommendation: `To auto-update on changes, create a trigger: CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql; then: CREATE TRIGGER trg_${table.name}_updated_at BEFORE UPDATE ON ${table.name} FOR EACH ROW EXECUTE FUNCTION set_updated_at();`,
      }],
    };
  }
  return {};
}

module.exports = { run: triggerRules };
