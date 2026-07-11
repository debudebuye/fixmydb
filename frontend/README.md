# FixMyDB Frontend

React 19 + TypeScript + Vite 8 SPA for the FixMyDB database schema reviewer.

## Quick Start

```bash
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build to dist/
npm run lint       # ESLint check
npm run preview    # Preview production build
npm test           # Run tests
```

## Environment Variables

See `.env.example` for available variables. Key variables:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL for dev proxy (default: `http://localhost:5000`) |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:5173`) |
| `VITE_BINANCE_ID` | Optional Binance Pay ID for donation footer |

## Tech Stack

- React 19, TypeScript (strict mode), Vite 8
- Tailwind CSS 4
- React Router v7 (lazy-loaded routes)
- Monaco Editor (SQL input + output)
- React Flow (ER diagrams)
- Axios (centralized API client with interceptors + retry)
- Lucide React (icons)

## Project Structure

```
src/
├── features/
│   ├── analyze/           # Schema analysis page
│   │   ├── components/    # SQLOditor, ResultsDashboard, tabs
│   │   └── AnalyzePage.tsx
│   ├── home/              # Landing page + sections
│   │   ├── HeroSection, FeaturesGrid, WorkflowSteps
│   │   ├── TerminalDemo, LiveStatsSection
│   │   └── HomePage.tsx
│   ├── security/          # Data security explanation page
│   └── settings/          # AI provider configuration
├── shared/
│   ├── components/        # Layout, NavBar, MobileDrawer, ErrorBoundary
│   ├── services/          # api.ts, apiConfig.ts, device.ts, history.ts
│   ├── types/             # schema.ts (TypeScript interfaces)
│   └── theme.tsx          # Dark/light theme provider
├── assets/                # Static images
├── App.tsx                # Routes with React.lazy + Suspense
├── main.tsx               # Entry point
└── index.css              # Global styles + CSS variables
```

## Architecture

### API Layer (`shared/services/api.ts`)
- Centralized Axios client with `/api/v1` base URL
- Response interceptor unwraps `{ success, data, error }` envelope
- Retry helper with exponential backoff (network/5xx errors)
- All API calls go through this module — no direct axios/fetch elsewhere

### Theme (`shared/theme.tsx`)
- Dark/light mode with system preference detection
- CSS variables for all colors
- Persisted to localStorage

### Code Splitting
- All page components use `React.lazy()` + `Suspense`
- Vite manual chunks: Monaco, React Flow, Lucide separated

### Desktop App
- Electron wraps this SPA
- Backend runs as a child process
- Custom IPC for start/stop/status

## Running Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```
