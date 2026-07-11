const { detectCircularDependencies } = require('../schemaIssues');

function circularDependencies({ tables, relationships }) {
  const cycles = detectCircularDependencies(tables, relationships);
  if (cycles.length === 0) return {};

  return {
    issues: cycles.map(cycle => ({
      severity: 'high',
      type: 'circular_dependency',
      message: `Circular dependency detected: ${cycle.join(' -> ')}`,
      recommendation: `Consider breaking the cycle by making one FK nullable or using a junction table`,
    })),
  };
}

module.exports = { run: circularDependencies };
