const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FixMyDB API',
      version: '1.0.0',
      description: 'AI-powered database schema reviewer. Analyze SQL schemas, get health scores, normalization reports, index recommendations, and ER diagrams.',
      license: { name: 'MIT', url: 'https://github.com/debudebuye/fixmydb/blob/master/LICENSE' },
      contact: { name: 'GitHub', url: 'https://github.com/debudebuye/fixmydb' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' },
      { url: '/', description: 'Production server' },
    ],
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Check API health',
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      version: { type: 'string', example: '1.0.0' },
                      service: { type: 'string', example: 'FixMyDB API' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/analyze': {
        post: {
          tags: ['Analysis'],
          summary: 'Analyze a SQL schema',
          description: 'Parse SQL CREATE TABLE statements and return a full schema review including health score, normalization analysis, index recommendations, ER diagram, and optional AI-enhanced insights.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sql'],
                  properties: {
                    sql: { type: 'string', description: 'Raw SQL schema containing CREATE TABLE statements' },
                    dialect: { type: 'string', enum: ['postgresql', 'mysql'], default: 'postgresql', description: 'Target SQL dialect for optimization output' },
                    analysisMode: { type: 'string', enum: ['system', 'strict'], default: 'system', description: 'Analysis strictness mode' },
                    deviceId: { type: 'string', format: 'uuid', description: 'Anonymous device ID for usage tracking' },
                    apiKey: { type: 'string', description: 'OpenAI API key for AI-enhanced analysis (deprecated, use aiConfig)' },
                    aiConfig: {
                      type: 'object',
                      properties: {
                        apiKey: { type: 'string', description: 'AI provider API key' },
                        baseURL: { type: 'string', description: 'Custom API base URL' },
                        model: { type: 'string', description: 'Model identifier' },
                        provider: { type: 'string', enum: ['openai', 'groq', 'openrouter', 'google'], description: 'AI provider' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Analysis result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      meta: {
                        type: 'object',
                        properties: {
                          tablesFound: { type: 'integer' },
                          relationshipsFound: { type: 'integer' },
                          dialect: { type: 'string' },
                          analyzedAt: { type: 'string', format: 'date-time' },
                          aiEnhanced: { type: 'boolean' },
                          aiError: { type: 'string', nullable: true },
                        },
                      },
                      healthScore: { type: 'number', description: 'Overall schema health score 0-100' },
                      summary: { type: 'object', description: 'Human-readable analysis summary' },
                      issues: { type: 'array', items: { type: 'object' }, description: 'Detected schema issues' },
                      recommendations: { type: 'array', items: { type: 'object' }, description: 'Optimization recommendations' },
                      normalization: { type: 'object', description: 'Normal form analysis (1NF, 2NF, 3NF, BCNF)' },
                      erDiagram: { type: 'object', description: 'ER diagram node/edge data' },
                      optimizedSQL: { type: 'string', description: 'Generated optimized DDL' },
                      tables: { type: 'array', items: { type: 'object' }, description: 'Parsed table definitions' },
                      relationships: { type: 'array', items: { type: 'object' }, description: 'Detected relationships' },
                      aiInsights: { type: 'object', nullable: true, description: 'AI-enhanced insights if an API key was provided' },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid input - SQL missing or no CREATE TABLE statements found' },
            500: { description: 'Analysis failed' },
          },
        },
      },
      '/api/schema/examples': {
        get: {
          tags: ['Schemas'],
          summary: 'Get example schemas',
          description: 'Returns a set of pre-built example SQL schemas for quick testing.',
          responses: {
            200: {
              description: 'Array of example schemas',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        sql: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/upload': {
        post: {
          tags: ['Upload'],
          summary: 'Upload a SQL schema file',
          description: 'Upload a .sql, .txt, or .json file (max 10 MB) containing SQL schema. The file is read and its content returned as text, then deleted from the server.',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'SQL schema file (.sql, .txt, or .json)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'File content',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      filename: { type: 'string' },
                      size: { type: 'integer' },
                      sql: { type: 'string' },
                    },
                  },
                },
              },
            },
            400: { description: 'No file uploaded or invalid file type' },
            500: { description: 'Failed to read file' },
          },
        },
      },
      '/api/stats': {
        get: {
          tags: ['Stats'],
          summary: 'Get live analytics stats',
          description: 'Returns total unique users and total schemas processed from the analytics database.',
          responses: {
            200: {
              description: 'Analytics statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalUsers: { type: 'integer' },
                      totalSchemasProcessed: { type: 'integer' },
                      recentAnalyses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            analysesId: { type: 'integer' },
                            deviceId: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/history': {
        get: {
          tags: ['History'],
          summary: 'List analysis history',
          description: 'Returns a summary list of all past analyses (without the full result payload).',
          responses: {
            200: {
              description: 'Array of history entries',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        timestamp: { type: 'string', format: 'date-time' },
                        healthScore: { type: 'number' },
                        tablesFound: { type: 'integer' },
                        issuesCount: { type: 'integer' },
                        recommendationsCount: { type: 'integer' },
                        sqlPreview: { type: 'string' },
                        dialect: { type: 'string' },
                        deviceId: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['History'],
          summary: 'Save an analysis to history',
          description: 'Stores a new history entry in the local SQLite database.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    healthScore: { type: 'number' },
                    tablesFound: { type: 'integer' },
                    issuesCount: { type: 'integer' },
                    recommendationsCount: { type: 'integer' },
                    sqlPreview: { type: 'string' },
                    dialect: { type: 'string' },
                    fullResult: { type: 'object' },
                    deviceId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Created history entry with auto-generated id and timestamp' },
          },
        },
        delete: {
          tags: ['History'],
          summary: 'Clear all history',
          description: 'Deletes all history entries from the local SQLite database.',
          responses: {
            200: {
              description: 'History cleared',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { success: { type: 'boolean', example: true } },
                  },
                },
              },
            },
          },
        },
      },
      '/api/history/{id}': {
        get: {
          tags: ['History'],
          summary: 'Get a single history entry',
          description: 'Returns a full history entry including the complete analysis result.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'History entry ID',
            },
          ],
          responses: {
            200: {
              description: 'Full history entry with analysis result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      timestamp: { type: 'string' },
                      healthScore: { type: 'number' },
                      tablesFound: { type: 'integer' },
                      issuesCount: { type: 'integer' },
                      recommendationsCount: { type: 'integer' },
                      sqlPreview: { type: 'string' },
                      dialect: { type: 'string' },
                      fullResult: { type: 'object' },
                      deviceId: { type: 'string' },
                    },
                  },
                },
              },
            },
            404: { description: 'History entry not found' },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
