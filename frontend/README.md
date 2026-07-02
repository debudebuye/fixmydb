# FixMyDB Frontend

React 19 + TypeScript + Vite 8 SPA for the FixMyDB database schema reviewer.

## Quick Start

```bash
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build to dist/
npm run lint       # ESLint check
npm run preview    # Preview production build
```

## Environment Variables

See `.env.example` for available variables.

## Tech Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS 4
- React Router v7
- Monaco Editor (SQL input)
- React Flow (ER diagrams)
- Axios (API client)

## Project Structure

```
src/
├── features/       # Feature modules (analyze, settings, security)
│   └── analyze/    # Schema analysis page + components
├── shared/         # Shared components, services, theme, types
└── App.tsx         # Root component with routes
```
