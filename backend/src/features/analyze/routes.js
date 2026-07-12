const express = require('express');
const router = express.Router();
const { parseSQLSchema } = require('../../shared/utils/sqlParser');
const { analyzeSchema } = require('./services/schemaAnalyzer');
const { analyzeNormalization } = require('./services/normalizationAnalyzer');
const { analyzeDomain } = require('./services/domainAnalyzer');
const { generateERDiagram } = require('./services/erDiagramGenerator');
const { generateOptimizedSQL } = require('./services/sqlGenerator');
const { enhanceWithAI } = require('./services/openaiAnalyzer');
const { trackAnalysis } = require('../../shared/utils/analyticsStore');
const { schemas, validate } = require('../../shared/middleware/validate');
const { sendSuccess, sendError } = require('../../shared/middleware/response');
const logger = require('../../shared/utils/logger');

const isProduction = process.env.NODE_ENV === 'production';

router.post('/', validate(schemas.analyze), async (req, res) => {
  const { sql, dialect, analysisMode, deviceId, apiKey, aiConfig } = req.body;

  try {
    const schema = parseSQLSchema(sql);

    if (schema.tables.length === 0) {
      return sendError(res, 400, 'INVALID_SCHEMA', 'No valid CREATE TABLE statements found', {
        hint: 'Make sure your SQL contains valid CREATE TABLE statements',
      });
    }

    const analysis = analyzeSchema(schema, { mode: analysisMode });
    const domainAnalysis = analyzeDomain(schema);
    const normalization = analyzeNormalization(schema, analysis.tablePatterns, { mode: analysisMode });
    const erDiagram = generateERDiagram(schema);
    const optimizedSQL = generateOptimizedSQL(schema, analysis, dialect);

    let aiInsights = null;
    let aiError = null;
    try {
      const aiKey = aiConfig?.apiKey || apiKey;
      if (aiKey) {
        aiInsights = await enhanceWithAI(sql, analysis, aiKey, aiConfig?.baseURL, aiConfig?.model, aiConfig?.provider);
      } else {
        aiInsights = await enhanceWithAI(sql, analysis);
      }
    } catch (err) {
      aiError = (aiConfig?.apiKey || apiKey) ? err.message : null;
    }

    trackAnalysis(deviceId).catch(() => {});

    const result = {
      meta: {
        tablesFound: schema.tables.length,
        relationshipsFound: schema.relationships.length,
        dialect,
        analyzedAt: new Date().toISOString(),
        aiEnhanced: !!aiInsights,
        aiError,
      },
      healthScore: analysis.healthScore,
      domain: domainAnalysis.detectedDomain,
      confidence: domainAnalysis.confidenceAnalysis.summary,
      summary: generateSummary(analysis, normalization, domainAnalysis, aiInsights),
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      normalization,
      domainAnalysis: {
        detectedType: domainAnalysis.detectedDomain.type,
        domainConfidence: domainAnalysis.detectedDomain.confidence,
        facts: domainAnalysis.confidenceAnalysis.facts,
        inferences: domainAnalysis.confidenceAnalysis.inferences,
        unknowns: domainAnalysis.confidenceAnalysis.unknowns,
        trustScore: domainAnalysis.confidenceAnalysis.summary.trustScore,
      },
      erDiagram,
      optimizedSQL,
      tables: schema.tables,
      relationships: schema.relationships,
      aiInsights,
    };

    sendSuccess(res, result);
  } catch (err) {
    logger.error('Analysis error', { err: err.message, requestId: res.locals.requestId });
    sendError(res, 500, 'ANALYSIS_FAILED', 'Failed to analyze schema',
      isProduction ? undefined : err.message);
  }
});

function generateSummary(analysis, normalization, domainAnalysis, aiInsights) {
  const { healthScore, issues, recommendations } = analysis;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const medIssues = issues.filter(i => i.severity === 'medium').length;
  const domainType = domainAnalysis.detectedDomain.type;
  const trustScore = domainAnalysis.confidenceAnalysis.summary.trustScore;

  let status = 'good';
  if (healthScore < 50) status = 'critical';
  else if (healthScore < 70) status = 'needs work';
  else if (healthScore < 85) status = 'decent';

  const trustStatus = trustScore >= 75 ? 'high' : trustScore >= 50 ? 'medium' : 'low';

  return {
    status,
    trustStatus,
    detectedDomain: domainType,
    overview: aiInsights?.summary ||
      `Your schema has a health score of ${healthScore}/100 (trust score: ${trustScore}%). ` +
      `Detected domain: ${domainType}. ` +
      `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} ` +
      `(${highIssues} high, ${medIssues} medium) and ` +
      `${recommendations.length} recommendation${recommendations.length !== 1 ? 's' : ''}.`,
    disclaimer: `Trust score ${trustScore}% means ${trustScore >= 75 ? 'high confidence' : trustScore >= 50 ? 'moderate confidence' : 'low confidence'} in analysis. ` +
      `Some issues (concurrency, app logic, transaction boundaries) cannot be verified from schema alone.`,
    topIssues: issues.slice(0, 3).map(i => i.message),
    normalizationScore: normalization.normalizationScore,
    architectureNotes: aiInsights?.architectureRecommendations || [],
    scalabilityNotes: aiInsights?.scalabilityNotes || null,
    bestPractices: aiInsights?.bestPractices || [],
  };
}

module.exports = router;
