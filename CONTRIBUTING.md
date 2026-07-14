# Contributing to FixMyDB

Thanks for your interest in contributing! FixMyDB is an open-source project, and we welcome all kinds of contributions — bug fixes, new analysis rules, documentation, or feature ideas.

## Code of Conduct

Be respectful, constructive, and inclusive. We're all here to make database schemas better.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/debudebuye/fixmydb.git
   cd fixmydb
   ```
3. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
4. Start development:
   ```bash
   # Terminal 1 — backend
   cd backend && npm run dev

   # Terminal 2 — frontend
   cd frontend && npm run dev
   ```

## Project Structure

```
backend/
├── src/
│   ├── index.js                    # Express entry point
│   ├── features/
│   │   └── {feature}/
│   │       ├── routes.js           # API routes
│   │       └── services/           # Business logic
│   └── shared/utils/               # Shared utilities
├── data/                           # Local SQLite DB
└── package.json

frontend/
├── src/
│   ├── components/                 # React components
│   │   ├── layout/                 # Header, Layout
│   │   ├── input/                  # SQLEditor
│   │   ├── analysis/               # Result tabs
│   │   └── ui/                     # Shared UI components
│   ├── pages/                      # Route pages
│   ├── services/                   # API client
│   └── types/                      # TypeScript types
└── package.json
```

## How to Contribute

### Adding a New Analysis Rule

The analysis engine uses a **rules-based architecture**. Each rule is a standalone module in `backend/src/features/analyze/services/rules/`.

**Quick start:**

1. Create `rules/yourRule.js` — export a `run` function:
   ```js
   function run(table, context) {
     // table: { name, columns, foreignKeys, primaryKeys, indexes, checks, constraints }
     // context: { tables, relationships, tablePatterns, patterns, mode }
     if (/* condition */) {
       return { issues: [{ severity: 'high', table: table.name, type: 'your_type', message: '...', recommendation: '...' }] };
     }
     return {};
   }
   module.exports = { run };
   ```

2. Register it in `rules/index.js` — add to the `tableRules` array:
   ```js
   { run: require('./yourRule').run },
   ```

3. If your issue type should affect the health score, add its type string to the `PENALTY_TIERS` array in `healthScore.js`.

4. Add tests in `rules/yourRule.test.js`:
   ```js
   const { run } = require('./yourRule');
   const { makeTable, makeColumn } = require('./test-utils');

   it('detects the problem', () => {
     const t = makeTable('users', [makeColumn('email')]);
     const result = run(t, {});
     expect(result.issues).toHaveLength(1);
   });
   ```

**Rule conventions:**
- `run(table, context)` returns `{ issues?, recommendations? }`
- Issues have `severity` (high/medium/low) and affect the health score
- Recommendations do not affect the health score
- Both use `type` strings for deduplication and categorization
- Test files import `makeTable`/`makeColumn` from `./test-utils`

**Existing rules to use as reference:**
- Simple: `missingPrimaryKey.js` (single check, single issue)
- Column-level: `columnConstraints.js` (iterates columns, multiple checks)
- Schema-level: `circularDependencies.js` (ignores table arg, uses context)

### Adding a New API Endpoint

1. Create a new folder under `backend/src/features/{name}/`
2. Add `routes.js` with Express routes
3. Register it in `backend/src/index.js` as `app.use('/api/{name}', routes)`
4. Add a corresponding frontend service call in `frontend/src/services/`

### Frontend Changes

- Components go in `frontend/src/components/{category}/`
- Pages go in `frontend/src/pages/`
- Run `npm run lint` and `npm run build` before submitting

## Development Guidelines

### Code Style

- **Backend**: Plain JavaScript (CommonJS), no TypeScript yet
- **Frontend**: TypeScript + React + Tailwind CSS
- **File naming**: camelCase for JS files, PascalCase for TSX components
- **Formatting**: Follow existing patterns (tab indentation, etc.)

### Naming Conventions

- Backend functions: `camelCase`  (e.g., `analyzeSchema`, `calculateHealthScore`)
- Backend files: `camelCase.js`  (e.g., `schemaAnalyzer.js`)
- Frontend components: `PascalCase.tsx` (e.g., `SQLEditor.tsx`)
- Frontend services: `camelCase.ts` (e.g., `apiClient.ts`)
- Database columns: `snake_case`

### File Size

- Keep files under **300 lines** when possible
- If a file grows beyond that, split it into focused modules (see `schemaAnalyzer.js` → `schemaPatterns.js`, `schemaIssues.js`, `healthScore.js`)

### Testing

- Backend tests use **Vitest**
- Test files are co-located: `serviceName.test.js` next to `serviceName.js`
- Run all tests: `cd backend && npm test`
- Run a single test file: `cd backend && npx vitest run path/to/test`

### API Changes

- Document new endpoints in `backend/src/swagger.js`
- Keep responses backward-compatible when possible
- Add validation for all inputs (see `analyze/routes.js` for patterns)

## Pull Request Process

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run lint: `cd backend && npm run lint`
4. Run tests: `cd backend && npm test`
5. Commit with a clear message: `git commit -m "Add X rule for Y detection"`
6. Push: `git push origin feature/your-feature-name`
7. Open a pull request against `main`
8. In the PR description, explain:
   - What the change does
   - Why it's needed
   - How to test it

## Reporting Bugs

- Open a [GitHub Issue](https://github.com/debudebuye/fixmydb/issues)
- Include: steps to reproduce, expected vs actual behavior, SQL schema if relevant
- For security issues, see [SECURITY.md](SECURITY.md)

## Questions?

- Email: [hello@fixmydb.dev](mailto:hello@fixmydb.dev)
- GitHub Discussions: [Join the community](https://github.com/debudebuye/fixmydb/discussions)