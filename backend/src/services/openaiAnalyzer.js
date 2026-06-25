const OpenAI = require('openai');

let openai = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

/**
 * Enhance analysis results with OpenAI insights
 */
async function enhanceWithAI(sql, localAnalysis) {
  const client = getOpenAIClient();
  if (!client) {
    return null; // No API key, skip AI enhancement
  }

  const prompt = `You are an expert database architect. Analyze this SQL schema and provide specific recommendations.

SQL Schema:
${sql}

Local analysis found:
- Health Score: ${localAnalysis.healthScore}/100
- Issues: ${localAnalysis.issues.length}
- Recommendations: ${localAnalysis.recommendations.length}

Provide a JSON response with:
{
  "summary": "2-3 sentence overview",
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

Only return valid JSON.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (err) {
    console.error('OpenAI enhancement failed:', err.message);
    return null;
  }
}

module.exports = { enhanceWithAI };
