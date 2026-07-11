const { detectSchemaPatterns } = require('./schemaPatterns');
const { calculateHealthScore } = require('./healthScore');
const { runTableRules, runSchemaRules } = require('./rules');

function analyzeSchema(schema, options = {}) {
  const { tables, relationships } = schema;
  const mode = String(options.mode || 'system').toLowerCase();
  const { patterns, tablePatterns } = detectSchemaPatterns(tables);
  const issues = [];
  const recommendations = [];

  if (patterns.length > 0) {
    recommendations.push({
      type: 'architecture_pattern',
      message: `Detected architecture-aware patterns: ${patterns.join(', ')}`,
      recommendation: 'Review these tables with design-first tradeoffs instead of rigid normalization rules.',
      context: patterns,
    });
  }

  const context = { tables, relationships, tablePatterns, patterns, mode };

  for (const table of tables) {
    const result = runTableRules(table, context);
    issues.push(...result.issues);
    recommendations.push(...result.recommendations);
  }

  const schemaResult = runSchemaRules(context);
  issues.push(...schemaResult.issues);
  recommendations.push(...schemaResult.recommendations);

  const healthScore = calculateHealthScore(tables, issues, recommendations, mode);

  return {
    healthScore,
    issues,
    recommendations,
    tables,
    relationships,
    patterns,
    tablePatterns,
    mode,
  };
}

module.exports = { analyzeSchema };
