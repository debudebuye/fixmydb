const missingPrimaryKey = require('./missingPrimaryKey');
const columnConstraints = require('./columnConstraints');
const financialPatterns = require('./financialPatterns');
const foreignKeyRules = require('./foreignKeyRules');
const indexAndUniqueRules = require('./indexAndUniqueRules');
const namingRules = require('./namingRules');
const triggerRules = require('./triggerRules');
const circularDependencies = require('./circularDependencies');

const tableRules = [
  missingPrimaryKey,
  columnConstraints,
  financialPatterns,
  { run: foreignKeyRules.runRelationshipBehavior },
  { run: foreignKeyRules.runForeignKeyCandidates },
  { run: foreignKeyRules.runMissingFkIndexes },
  { run: indexAndUniqueRules.runCompositeIndex },
  { run: indexAndUniqueRules.runUniqueAndIndexColumns },
  { run: indexAndUniqueRules.runCompositeUnique },
  namingRules,
  triggerRules,
];

const schemaRules = [
  circularDependencies,
];

function runTableRules(table, context) {
  const issues = [];
  const recommendations = [];
  for (const rule of tableRules) {
    const result = rule.run(table, context);
    if (result) {
      if (result.issues) issues.push(...result.issues);
      if (result.recommendations) recommendations.push(...result.recommendations);
    }
  }
  return { issues, recommendations };
}

function runSchemaRules(context) {
  const issues = [];
  const recommendations = [];
  for (const rule of schemaRules) {
    const result = rule.run(context);
    if (result) {
      if (result.issues) issues.push(...result.issues);
      if (result.recommendations) recommendations.push(...result.recommendations);
    }
  }
  return { issues, recommendations };
}

module.exports = { runTableRules, runSchemaRules };
