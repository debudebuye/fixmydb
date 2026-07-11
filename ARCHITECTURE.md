# FixMyDB V1 - Architecture Documentation

## Project Overview

FixMyDB is an AI-powered database schema reviewer that helps developers optimize their database designs in seconds.

## System Architecture

```
┌─────────────┐       HTTP/REST       ┌──────────────┐
│   Frontend  │ ──────────────────────> │   Backend    │
│  (React +   │                        │  (Node.js +  │
│  Vite +     │ <────────────────────  │   Express)   │
│  Tailwind)  │       JSON             │              │
└─────────────┘                        └──────────────┘
     │                                        │
     │                                        │
     ├─ Monaco Editor (SQL input)            ├─ SQL Parser
     ├─ React Flow (ER Diagrams)             ├─ Schema Analyzer
     ├─ Axios (API client)                   ├─ Normalization Analyzer
     └─ React Router (navigation)            ├─ Domain Analyzer
                                              ├─ ER Diagram Generator
                                              ├─ SQL Generator
                                              └─ AI Integration (optional)
```

## Tech Stack

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite 8** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Monaco Editor** - SQL code editor
- **React Flow (@xyflow/react)** - Interactive ER diagrams
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Node.js 20+** - Runtime
- **Express.js** - Web framework
- **node-sql-parser** - SQL DDL parsing (with regex fallback)
- **multer** - File upload handling
- **cors** / **helmet** - Security middleware
- **express-rate-limit** - Rate limiting (30 req/min API, 60 req/min general)
- **zod** - Request validation schemas
- **dotenv** - Environment configuration
- **OpenAI SDK** + **Google Generative AI** (optional) - AI-powered enhancements
- **sql.js** - Local SQLite for offline/desktop history
- **@supabase/supabase-js** - Production cloud database (optional)
- **pg** - PostgreSQL client for analytics (fallback)

## Directory Structure

```
FixMyDB/
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Header, Layout
│   │   │   ├── input/         # SQLEditor
│   │   │   ├── analysis/      # Result tabs (Overview, Normalization, etc.)
│   │   │   └── ui/            # Reusable UI components
│   │   ├── pages/             # Route pages (HomePage, AnalyzePage)
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   └── package.json
│
├── backend/                   # Node.js backend
│   ├── src/
│   │   ├── index.js           # Express app entry point
│   │   ├── swagger.js         # API documentation spec
│   │   ├── database/
│   │   │   └── index.js       # Database provider (SQLite / Supabase)
│   │   ├── features/
│   │   │   ├── analyze/
│   │   │   │   ├── routes.js  # POST /api/analyze
│   │   │   │   └── services/
│   │   │   │       ├── schemaAnalyzer.js    # Core analysis orchestrator
│   │   │   │       ├── schemaPatterns.js    # Schema pattern detection
│   │   │   │       ├── schemaIssues.js      # Issue/recommendation helpers
│   │   │   │       ├── healthScore.js       # Health score calculation
│   │   │   │       ├── normalizationAnalyzer.js # 1NF/2NF/3NF analysis
│   │   │   │       ├── domainAnalyzer.js    # Domain detection + confidence
│   │   │   │       ├── erDiagramGenerator.js # ER diagram data generation
│   │   │   │       ├── sqlGenerator.js      # Optimized SQL generation
│   │   │   │       └── openaiAnalyzer.js    # AI integration (OpenAI/Gemini)
│   │   │   ├── history/
│   │   │   │   └── routes.js  # CRUD /api/history
│   │   │   ├── schema/
│   │   │   │   └── routes.js  # GET /api/schema/examples
│   │   │   ├── stats/
│   │   │   │   └── routes.js  # GET /api/stats
│   │   │   └── upload/
│   │   │       └── routes.js  # POST /api/upload
│   │   └── shared/
│   │       ├── middleware/
│   │       │   └── validate.js        # Zod request validation middleware
│   │       └── utils/
│   │           ├── sqlParser.js       # AST-based SQL parsing
│   │           ├── manualSqlParser.js # Regex-based fallback parser
│   │           ├── analyticsStore.js  # Analytics tracking (Postgres/Supabase)
│   │           └── supabase.js        # Supabase client wrapper
│   ├── data/                  # Local SQLite database storage
│   ├── uploads/               # Temporary file uploads
│   ├── Dockerfile             # Production container
│   ├── .env                   # Environment variables
│   └── package.json
│
├── desktop/                   # Electron desktop wrapper
│   ├── main.js                # Electron main process
│   ├── preload.js             # IPC bridge
│   ├── renderer/              # Desktop control panel UI
│   ├── scripts/               # Frontend serving script
│   └── package.json
│
├── data/                      # (moved to backend/data/)
├── README.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── SECURITY.md
├── LICENSE
├── .gitignore
└── docker-compose.yml
```

## Analysis Pipeline

```
User Input (SQL or file upload)
    ↓
POST /api/analyze
    ↓
parseSQLSchema()           ─ sqlParser.js (+ manualSqlParser.js fallback)
    ├─ Extracts tables, columns, keys, constraints
    └─ Detects relationships (foreign keys)
    ↓
analyzeSchema()            ─ schemaAnalyzer.js
    ├─ detectSchemaPatterns()  ─ schemaPatterns.js
    ├─ Missing PKs, naming, FKs, indexes
    ├─ Business-rule integrity checks
    └─ calculateHealthScore()  ─ healthScore.js
    ↓
analyzeDomain()            ─ domainAnalyzer.js
    ├─ Identify domain type (financial, ecommerce, etc.)
    └─ Confidence tracking
    ↓
analyzeNormalization()     ─ normalizationAnalyzer.js
    ├─ 1NF, 2NF, 3NF compliance check
    └─ Violations report
    ↓
generateERDiagram()        ─ erDiagramGenerator.js
    └─ Create React Flow nodes/edges
    ↓
generateOptimizedSQL()     ─ sqlGenerator.js
    └─ Output improved DDL with fixes
    ↓
enhanceWithAI() (optional) ─ openaiAnalyzer.js
    └─ OpenAI / Gemini insights
    ↓
Return JSON Response
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/analyze | Analyze a database schema |
| POST | /api/upload | Upload a schema file (.sql, .txt, .json) |
| GET | /api/schema/examples | Get example schemas |
| GET | /api/history | List analysis history |
| POST | /api/history | Save analysis to history |
| DELETE | /api/history | Clear history |
| GET | /api/stats | Anonymous usage stats |
| GET | /api/health | Health check |
| GET | /api/docs | Swagger docs (development only) |

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |

### Optional
| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Allowed CORS origin (default: http://localhost:5173) |
| `DATABASE_URL` | PostgreSQL connection for analytics (legacy) |
| `SUPABASE_URL` | Supabase project URL (production database) |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `FIXMYDB_DATA_PATH` | Custom path for SQLite data file |

## Database Providers

| Provider | When Active | Use Case |
|----------|-------------|----------|
| **SQLite** (local) | No Supabase env vars | Desktop / local development |
| **Supabase** (cloud) | `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` set | Production deployment |

## Security

1. **File Upload**: Limited to 10MB, only .sql/.txt/.json, deleted after read
2. **CORS**: Restricted to `FRONTEND_URL` in production
3. **Rate Limiting**: 30 req/min on API, 60 req/min general
4. **Helmet**: Security headers (CSP, XSS, etc.)
5. **Request Validation**: All endpoints validate input with Zod schemas
6. **No Auth**: V1 is stateless — auth planned for future versions (V2)
7. **Error Handling**: No error details leaked in production
8. **Graceful Shutdown**: SIGTERM/SIGINT handled — closes DB and server cleanly

## Performance

- Frontend bundle: ~514 KB (164 KB gzipped)
- Backend: Stateless, analysis in ~50-200ms
- No heavy database queries in analysis path (all in-memory processing)

## Future Enhancements (Not in V1)

- Direct database connection via connection strings
- Schema comparison (before/after)
- Migration SQL generation
- Multi-user support with authentication
- Team collaboration features
- AI chat assistant for interactive guidance
- Query performance analysis
- Plugin ecosystem for custom analyzers
- More database dialects (Oracle, SQL Server, etc.)
