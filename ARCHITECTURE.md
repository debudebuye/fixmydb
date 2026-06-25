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
     └─ React Router (navigation)            ├─ ER Diagram Generator
                                              ├─ SQL Generator
                                              └─ OpenAI Integration (optional)
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
- **node-sql-parser** - SQL DDL parsing
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment configuration
- **OpenAI SDK** (optional) - AI-powered enhancements

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
│   └── package.json           # Dependencies
│
├── backend/                   # Node.js backend
│   ├── src/
│   │   ├── routes/            # Express routes
│   │   │   ├── analyze.js     # POST /api/analyze
│   │   │   ├── schema.js      # GET /api/schema/examples
│   │   │   └── upload.js      # POST /api/upload
│   │   ├── services/          # Business logic
│   │   │   ├── schemaAnalyzer.js
│   │   │   ├── normalizationAnalyzer.js
│   │   │   ├── erDiagramGenerator.js
│   │   │   ├── sqlGenerator.js
│   │   │   └── openaiAnalyzer.js
│   │   ├── utils/
│   │   │   └── sqlParser.js   # SQL parsing utilities
│   │   └── index.js           # Express app entry point
│   ├── uploads/               # Temporary file uploads
│   ├── .env                   # Environment variables
│   └── package.json           # Dependencies
│
├── README.md                  # Project documentation
├── ARCHITECTURE.md            # This file
├── LICENSE                    # MIT license
└── .gitignore                 # Git ignore rules
```

## Core Workflows

### 1. Schema Analysis Flow

```
User Input (SQL) 
    ↓
SQLEditor Component
    ↓
POST /api/analyze
    ↓
parseSQLSchema()
    ├─ Extracts tables, columns, keys
    └─ Detects relationships
    ↓
analyzeSchema()
    ├─ Checks for missing keys
    ├─ Detects naming issues
    ├─ Identifies redundancy
    └─ Calculates health score (0-100)
    ↓
analyzeNormalization()
    ├─ Checks 1NF, 2NF, 3NF compliance
    └─ Suggests improvements
    ↓
generateERDiagram()
    └─ Creates React Flow nodes/edges
    ↓
generateOptimizedSQL()
    └─ Outputs improved DDL
    ↓
Optional: enhanceWithAI()
    └─ OpenAI analysis (if API key present)
    ↓
Return JSON Response
    ↓
ResultsDashboard Component
    └─ Display tabbed results
```

### 2. File Upload Flow

```
User selects .sql file
    ↓
SQLEditor Component
    ↓
POST /api/upload (multipart/form-data)
    ↓
Multer middleware
    ├─ Validate file type (.sql, .txt, .json)
    ├─ Store temporarily
    └─ Read content
    ↓
Return { sql: "...", filename: "..." }
    ↓
Populate SQLEditor
    ↓
User clicks "Analyze Schema"
```

## Key Features Implementation

### Health Score Calculation
```javascript
// backend/src/services/schemaAnalyzer.js
function calculateHealthScore(tables, issues, recommendations) {
  let score = 100;
  // Deduct for issues
  for (const issue of issues) {
    if (issue.severity === 'high') score -= 10;
    else if (issue.severity === 'medium') score -= 5;
    else score -= 2;
  }
  // Deduct for missing optimizations
  score -= recommendations.length * 1;
  // Bonus for FKs and indexes
  score += bonusPoints;
  return Math.max(0, Math.min(100, score));
}
```

### SQL Parsing Strategy
1. **Primary**: Use `node-sql-parser` to parse DDL into AST
2. **Fallback**: Manual regex-based parsing for unsupported syntax
3. **Extraction**: Custom helper functions to safely extract column names, types, and constraints from deeply nested AST objects

### ER Diagram Generation
- Uses **React Flow** library
- Generates nodes (tables) and edges (relationships)
- Custom `TableNode` component displays columns with type annotations
- Auto-layout with manual pan/zoom support

## API Endpoints

### POST /api/analyze
Analyze a database schema.

**Request:**
```json
{
  "sql": "CREATE TABLE users...",
  "dialect": "postgresql" | "mysql"
}
```

**Response:**
```json
{
  "meta": { "tablesFound": 2, "relationshipsFound": 1, ... },
  "healthScore": 94,
  "summary": { "status": "good", "overview": "...", ... },
  "issues": [ { "severity": "high", "message": "...", ... } ],
  "recommendations": [ { "type": "missing_index", "sql": "...", ... } ],
  "normalization": { "normalizationScore": 85, "violations": [...], ... },
  "erDiagram": { "nodes": [...], "edges": [...] },
  "optimizedSQL": "CREATE TABLE users ...",
  "tables": [...],
  "relationships": [...],
  "aiInsights": null | { ... }
}
```

### POST /api/upload
Upload a schema file (.sql, .txt, .json).

**Request:** multipart/form-data with `file` field

**Response:**
```json
{
  "filename": "schema.sql",
  "size": 1234,
  "sql": "CREATE TABLE ..."
}
```

### GET /api/schema/examples
Get example schemas for demo purposes.

**Response:**
```json
[
  {
    "id": "basic-ecommerce",
    "name": "Basic E-Commerce",
    "description": "...",
    "sql": "CREATE TABLE ..."
  }
]
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "FixMyDB API"
}
```

## Environment Variables

### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=          # Optional: for AI enhancements
DATABASE_URL=            # Optional: for future direct DB connection
FRONTEND_URL=http://localhost:5173
```

### Frontend
```bash
VITE_API_URL=/api        # Proxied through Vite dev server
```

## Development

### Start Backend
```bash
cd backend
npm install
npm run dev              # nodemon for auto-reload
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev              # Vite dev server
```

### Build Frontend
```bash
cd frontend
npm run build            # Outputs to dist/
```

## Deployment Considerations

### Frontend
- Build with `npm run build`
- Deploy `dist/` folder to:
  - Vercel
  - Netlify
  - GitHub Pages
  - Any static host

### Backend
- Deploy to:
  - Heroku
  - Railway
  - Render
  - AWS EC2 / ECS
  - DigitalOcean App Platform
- Set environment variables in platform settings
- Use production Node.js server (not nodemon)

### Database (Future)
- PostgreSQL on:
  - Supabase
  - Railway
  - AWS RDS
  - Heroku Postgres

## Security Considerations

1. **File Upload**: Limited to 10MB, only .sql/.txt/.json files
2. **CORS**: Restricted to FRONTEND_URL in production
3. **Input Validation**: SQL parsing fails gracefully with error messages
4. **No Auth Required**: V1 is stateless and client-side only
5. **API Key Protection**: OpenAI key stored in backend .env, never exposed to client

## Performance

- Frontend bundle: ~514 KB (164 KB gzipped)
  - Main contributors: Monaco Editor (~300 KB), React Flow (~150 KB)
  - Consider code splitting in future versions
- Backend: Stateless, handles analysis in ~50-200ms
- No database queries in V1 (all in-memory processing)

## Future Enhancements (Not in V1)

- Direct database connection via connection strings
- Schema comparison (before/after)
- Migration SQL generation
- Multi-user support with authentication
- Team collaboration features
- AI chat assistant for interactive guidance
- Query performance analysis
- Support for more database dialects (SQLite, Oracle, SQL Server)
- Plugin ecosystem for custom analyzers

## Testing Strategy (Recommended)

- **Unit Tests**: Backend services (Jest)
- **Integration Tests**: API endpoints (Supertest)
- **E2E Tests**: Frontend flows (Playwright)
- **SQL Fixtures**: Test with various schema patterns

## Contributing

See main README.md for contribution guidelines.

## License

MIT License - see LICENSE file.

---

**Last Updated:** June 25, 2026
