const express = require('express');
const router = express.Router();
const { parseSQLSchema } = require('../utils/sqlParser');
const { analyzeSchema } = require('../services/schemaAnalyzer');
const { analyzeNormalization } = require('../services/normalizationAnalyzer');
const { generateERDiagram } = require('../services/erDiagramGenerator');
const { generateOptimizedSQL } = require('../services/sqlGenerator');
const { enhanceWithAI } = require('../services/openaiAnalyzer');

/**
 * POST /api/analyze
 * Main analysis endpoint
 */
router.post('/', async (req, res) => {
  const { sql, dialect = 'postgresql' } = req.body;

  if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
    return res.status(400).json({ error: 'SQL schema is required' });
  }

  try {
    // Step 1: Parse the SQL
    const schema = parseSQLSchema(sql);

    if (schema.tables.length === 0) {
      return res.status(400).json({
        error: 'No valid CREATE TABLE statements found',
        hint: 'Make sure your SQL contains valid CREATE TABLE statements',
      });
    }

    // Step 2: Analyze schema
    const analysis = analyzeSchema(schema);

    // Step 3: Normalization analysis
    const normalization = analyzeNormalization(schema);

    // Step 4: Generate ER diagram data
    const erDiagram = generateERDiagram(schema);

    // Step 5: Generate optimized SQL
    const optimizedSQL = generateOptimizedSQL(schema, analysis, dialect);

    // Step 6: Optional AI enhancement
    let aiInsights = null;
    try {
      aiInsights = await enhanceWithAI(sql, analysis);
    } catch (err) {
      // AI enhancement is optional
    }

    const result = {
      meta: {
        tablesFound: schema.tables.length,
        relationshipsFound: schema.relationships.length,
        dialect,
        analyzedAt: new Date().toISOString(),
        aiEnhanced: !!aiInsights,
      },
      healthScore: analysis.healthScore,
      summary: generateSummary(analysis, normalization, aiInsights),
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      normalization,
      erDiagram,
      optimizedSQL,
      tables: schema.tables,
      relationships: schema.relationships,
      aiInsights,
    };

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze schema', detail: err.message });
  }
});

function generateSummary(analysis, normalization, aiInsights) {
  const { healthScore, issues, recommendations } = analysis;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const medIssues = issues.filter(i => i.severity === 'medium').length;

  let status = 'good';
  if (healthScore < 50) status = 'critical';
  else if (healthScore < 70) status = 'needs work';
  else if (healthScore < 85) status = 'decent';

  return {
    status,
    overview: aiInsights?.summary ||
      `Your schema has a health score of ${healthScore}/100. ` +
      `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} ` +
      `(${highIssues} high, ${medIssues} medium) and ` +
      `${recommendations.length} optimization opportunit${recommendations.length !== 1 ? 'ies' : 'y'}.`,
    topIssues: issues.slice(0, 3).map(i => i.message),
    normalizationScore: normalization.normalizationScore,
    architectureNotes: aiInsights?.architectureRecommendations || [],
    scalabilityNotes: aiInsights?.scalabilityNotes || null,
    bestPractices: aiInsights?.bestPractices || [],
  };
}

module.exports = router;
