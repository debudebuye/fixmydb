const { z } = require('zod');
const { sendError } = require('./response');

const ALLOWED_DIALECTS = ['postgresql', 'mysql', 'mariadb', 'mssql', 'sqlite', 'oracledb'];
const ALLOWED_MODES = ['system', 'strict', 'relaxed'];

const dialectMsg = `Invalid dialect. Allowed: ${ALLOWED_DIALECTS.join(', ')}`;
const modeMsg = `Invalid analysis mode. Allowed: ${ALLOWED_MODES.join(', ')}`;

const schemas = {
  analyze: z.object({
    sql: z.string({ required_error: 'SQL schema is required' })
      .min(1, 'SQL schema is required')
      .max(1000000, 'SQL schema too large (max 1MB)')
      .trim(),
    dialect: z.string().default('postgresql')
      .refine(v => ALLOWED_DIALECTS.includes(v), dialectMsg),
    analysisMode: z.string().default('system')
      .refine(v => ALLOWED_MODES.includes(v), modeMsg),
    deviceId: z.string().max(256).optional(),
    apiKey: z.string().max(512).optional(),
    aiConfig: z.object({
      apiKey: z.string().max(512).optional(),
      baseURL: z.string().url().max(2048).optional(),
      model: z.string().max(128).optional(),
      provider: z.enum(['openai', 'groq', 'openrouter', 'google', 'gemini']).optional(),
    }).optional(),
  }),

  historyEntry: z.object({
    healthScore: z.number().min(0).max(100).optional(),
    tablesFound: z.number().int().min(0).optional(),
    issuesCount: z.number().int().min(0).optional(),
    recommendationsCount: z.number().int().min(0).optional(),
    sqlPreview: z.string().max(1000).optional(),
    dialect: z.string().refine(v => !v || ALLOWED_DIALECTS.includes(v), dialectMsg).optional(),
    fullResult: z.any().optional(),
    deviceId: z.string().max(256).optional(),
  }).strict(),

  historyId: z.object({
    id: z.string().regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'Invalid history ID format'
    ),
  }),
};

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const msgs = result.error.issues.map(i => i.message).join('; ');
      return sendError(res, 400, 'VALIDATION_ERROR', msgs);
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { schemas, validate };
