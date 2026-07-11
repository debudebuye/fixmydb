const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../../shared/utils/logger');

const promptTemplate = `You are an expert database architect. Analyze this SQL schema and provide specific recommendations.

SQL Schema:
__SQL__

Local analysis found:
- Health Score: __SCORE__/100
- Issues: __ISSUES__
- Recommendations: __RECS__

Provide a JSON response with:
{
  "summary": "2-3 sentence overview of the schema quality",
  "additionalIssues": [
    { "severity": "high|medium|low", "message": "...", "recommendation": "..." }
  ],
  "architectureRecommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "scalabilityNotes": "Notes on potential scaling issues",
  "bestPractices": ["practice 1", "practice 2"]
}

Only return valid JSON. No markdown, no code fences.`;

function buildPrompt(sql, localAnalysis) {
  return promptTemplate
    .replace('__SQL__', sql)
    .replace('__SCORE__', localAnalysis.healthScore)
    .replace('__ISSUES__', localAnalysis.issues.length)
    .replace('__RECS__', localAnalysis.recommendations.length);
}

function parseJSONResponse(content) {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return null;
}

/**
 * Enhance analysis results with AI-powered insights.
 * Supports OpenAI-compatible providers (OpenAI, Groq, OpenRouter)
 * and Google Gemini via its own SDK.
 */
async function enhanceWithAI(sql, localAnalysis, userApiKey, baseURL, model, provider) {
  if (provider === 'gemini') {
    return callGemini(sql, localAnalysis, userApiKey, model);
  }

  if (!userApiKey) {
    return null;
  }

  const clientOptions = { apiKey: userApiKey };
  if (baseURL) {
    clientOptions.baseURL = baseURL;
  }
  const client = new OpenAI(clientOptions);

  try {
    const response = await client.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: buildPrompt(sql, localAnalysis) }],
      temperature: 0.3,
      max_tokens: 1000,
    }, {
      timeout: 60000,
      maxRetries: 0,
    });

    const content = response.choices[0].message.content;
    return parseJSONResponse(content);
  } catch (err) {
    logger.error('AI enhancement failed', { err: err.message, status: err.status, code: err.code });
    throw err;
  }
}

async function callGemini(sql, localAnalysis, apiKey, model) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model: model || 'gemini-2.0-flash',
  });

  const prompt = buildPrompt(sql, localAnalysis);

  try {
    const result = await geminiModel.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    const text = result.response.text();
    return parseJSONResponse(text);
  } catch (err) {
    const msg = cleanGeminiError(err);
    logger.error('Gemini enhancement failed', { err: msg });
    throw new Error(msg);
  }
}

function cleanGeminiError(err) {
  const fullMsg = err.message || String(err);
  if (fullMsg.includes('429') || fullMsg.includes('quota')) {
    const retryMatch = fullMsg.match(/retry in\s+([\d.]+)s/i);
    const retry = retryMatch ? ` Retry in ~${Math.ceil(parseFloat(retryMatch[1]))}s.` : '';
    return `429 Free tier quota exceeded.${retry} Gemini free tier has rate limits (requests/min & tokens/min). Wait before retrying.`;
  }
  if (fullMsg.includes('API_KEY_INVALID') || fullMsg.includes('API key not valid')) {
    return '401 Invalid API key. Check your Gemini API key at aistudio.google.com/apikey.';
  }
  if (fullMsg.includes('404') || fullMsg.includes('not found')) {
    return `404 Model not found. Ensure the model name is correct for Gemini.`;
  }
  if (fullMsg.includes('permission') || fullMsg.includes('not allowed') || fullMsg.includes('403')) {
    return `403 Access denied. The model may require billing. Try a free-tier model like gemini-2.0-flash.`;
  }
  return fullMsg.split('.')[0] + '.';
}

module.exports = { enhanceWithAI };