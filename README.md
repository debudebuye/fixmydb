# FixMyDB V1 — Open Source AI Database Schema Reviewer

**FixMyDB** helps developers review, optimize, normalize, and improve database schemas in seconds. Built as an AI-powered Database Architect and Schema Reviewer, it saves developers time by automatically analyzing database schemas and providing actionable recommendations.

**No subscriptions. No paid plans. 100% Open Source.**

## Features

### Schema Input
- **Paste SQL** directly into the editor
- **Upload multiple files** (.sql, .txt, .json) — drag & drop or file picker
- **Load example schemas** — e-commerce, blog, social network demos
- **Clipboard paste** with one click

### Analysis Engine (Six Modules)
1. **Health Score** — 0–100 score with color-coded severity gauge
2. **Normalization Review** — 1NF, 2NF, 3NF compliance with suggestions
3. **Index Recommendations** — composite indexes, unique constraints, covering indexes
4. **Relationship Analysis** — missing foreign keys, circular dependencies, ON DELETE behavior
5. **Domain Detection** — auto-detects financial, e-commerce, social, healthcare schemas with confidence score
6. **Schema Patterns** — identifies event outbox, audit log, polymorphic references, financial ledger patterns

### AI Enhancement (Bring Your Own Key)
- Supports **OpenAI**, **Groq**, **OpenRouter**, **Google Gemini**
- User-provided API keys — never stored on server, session-only
- AI adds architecture recommendations, scalability notes, best practices
- Graceful fallback when AI is unavailable — core analysis still works

### Output
- **ER Diagram** — interactive React Flow visualization, export as PNG
- **Optimized SQL** — PostgreSQL and MySQL dialects, copy-to-clipboard
- **V1 disclaimer** — clear warning that output is optimized for structure, not runtime concerns

### Desktop App
- Electron-based desktop application
- Custom app icon, embedded backend + frontend
- Works offline with local SQLite database
- **Windows:** If SmartScreen warns "Windows protected your PC", click **"More info"** → **"Run anyway"**. The app is open source and safe to run.

### Production Features
- **API versioning** — `/api/v1/*` with backward-compatible redirects
- **Structured logging** — JSON logs with request IDs
- **Rate limiting** — 30 req/min on API, 60 req/min on root
- **Input validation** — Zod schemas on all endpoints
- **CORS + Helmet** — security headers, origin checking
- **Health check** — `/health` endpoint with uptime

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Backend | Node.js, Express.js, Zod validation |
| Database | SQLite (local) / Supabase (production) |
| AI | OpenAI, Groq, OpenRouter, Google Gemini (BYOK) |
| Visualization | React Flow (ER diagrams), Monaco Editor (SQL) |
| Desktop | Electron |
| Testing | Vitest, Supertest |
| Deployment | Docker, Nginx |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/debudebuye/fixmydb.git
cd fixmydb
```

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

### Environment Variables

**Backend** (`backend/.env`):
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | `production` enables strict error handling |
| `FRONTEND_URL` | Yes | — | Comma-separated allowed origins (e.g. `http://localhost:5173`) |
| `SUPABASE_URL` | No | — | Supabase project URL (production DB) |
| `SUPABASE_SERVICE_KEY` | No | — | Supabase service role key |
| `SUPABASE_ANON_KEY` | No | — | Supabase anon key |
| `DATABASE_URL` | No | — | Direct PostgreSQL connection string |

**Frontend** (`frontend/.env`):
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:5000` | Backend URL for dev proxy |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend origin (for CORS) |
| `VITE_BINANCE_ID` | No | — | Binance Pay ID for donation footer |

### Docker

```bash
docker-compose up --build
```

## Usage

1. **Paste SQL** or **upload .sql files** (multiple files supported)
2. Select your database dialect (PostgreSQL / MySQL)
3. Optionally configure an AI provider in Settings
4. Click **Analyze Schema**
5. Review results across six tabs:
   - Overview (health score, issues, recommendations)
   - Normalization (1NF/2NF/3NF compliance)
   - Indexes (recommended indexes with SQL)
   - Relationships (foreign keys, circular deps)
   - ER Diagram (interactive, exportable)
   - SQL Output (optimized schema with copy/download)
6. Copy the improved SQL and apply to your database

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/analyze` | Analyze SQL schema |
| `POST` | `/api/v1/upload` | Upload SQL file(s) |
| `GET` | `/api/v1/schema/examples` | Get example schemas |
| `GET` | `/api/v1/stats` | Get usage statistics |
| `POST` | `/api/v1/stats/download` | Track download event |
| `GET` | `/api/v1/history` | Get analysis history (paginated) |
| `POST` | `/api/v1/history` | Save analysis to history |
| `DELETE` | `/api/v1/history` | Clear all history |
| `GET` | `/health` | Health check |

## Example

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(255)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  total DECIMAL(10,2)
);
```

**FixMyDB will detect:**
- Missing foreign key between `orders.user_id` and `users.id`
- Missing index on `users.email`
- Missing `NOT NULL` constraints
- Normalization opportunities

## Running Tests

```bash
# Backend (143 tests)
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Project Structure

```
fixmydb/
├── backend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── analyze/     # Core analysis engine + rules
│   │   │   ├── history/     # Analysis history CRUD
│   │   │   ├── schema/      # Example schemas
│   │   │   ├── stats/       # Usage analytics
│   │   │   └── upload/      # File upload handler
│   │   ├── shared/
│   │   │   ├── middleware/   # Auth, validation, logging, response
│   │   │   └── utils/       # Logger, DB, analytics, Supabase
│   │   ├── app.js           # Express app setup
│   │   └── index.js         # Server entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── analyze/     # Schema editor + results dashboard
│   │   │   ├── home/        # Landing page
│   │   │   ├── security/    # Data security page
│   │   │   └── settings/    # AI provider config
│   │   ├── shared/
│   │   │   ├── components/  # Layout, NavBar, ErrorBoundary
│   │   │   ├── services/    # API client, history, device
│   │   │   └── types/       # TypeScript interfaces
│   │   └── App.tsx          # Routes with lazy loading
│   └── Dockerfile
├── desktop/                  # Electron app
└── docker-compose.yml
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/debudebuye/fixmydb/issues)
- Discussions: [Join the community](https://github.com/debudebuye/fixmydb/discussions)
- Email: [support@fixmydb.dev](mailto:support@fixmydb.dev) — help & support
- Email: [hello@fixmydb.dev](mailto:hello@fixmydb.dev) — general inquiries

## Acknowledgments

Inspired by ESLint for code and Postman for APIs — but for database architecture.

---

**Built for the open source community**
