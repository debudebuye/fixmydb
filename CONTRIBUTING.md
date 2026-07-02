# Contributing to FixMyDB

First off, thanks for taking the time to contribute! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## What We're Looking For

- **Bug reports** — clear steps to reproduce
- **Feature requests** — describe the problem you're solving
- **Code contributions** — PRs for issues labeled `good first issue` or `help wanted`
- **Documentation improvements** — typos, clarifications, translations
- **Example schemas** — add realistic schemas to `backend/examples/`

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Fork and clone the repo
git clone https://github.com/your-username/fixmydb.git
cd fixmydb

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Optional: set up environment variables
cp backend/.env.example backend/.env
```

### Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
fixmydb/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── features/      # Feature modules (analyze, settings, etc.)
│   │   ├── shared/        # Shared components, services, types
│   │   └── App.tsx
│   └── package.json
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── routes/        # Express route handlers
│   │   ├── services/      # Business logic
│   │   └── index.js
│   └── package.json
├── README.md
├── ARCHITECTURE.md
└── LICENSE
```

## Coding Guidelines

### General

- Write readable, self-documenting code over comments
- Keep functions small and focused (one job per function)
- Use meaningful variable and function names

### Frontend (React + TypeScript)

- Use TypeScript strict mode — avoid `any` wherever possible
- Prefer functional components with hooks over class components
- Co-locate styles using inline `style` objects or CSS variables
- Use `const` assertions and proper typing for event handlers
- Follow existing patterns in the codebase for consistency

### Backend (Node.js + Express)

- Use async/await over raw promises or callbacks
- Handle errors with try/catch and return meaningful error messages
- Keep route handlers thin — move logic to service files
- Validate input at the route level

### Git Commit Messages

Use conventional commits:

```
feat: add schema comparison view
fix: handle empty SQL gracefully
docs: update API endpoints in README
refactor: extract ER diagram logic into service
chore: bump dependencies
```

## Pull Request Process

1. **Find or create an issue** — comment to let others know you're working on it
2. **Fork the repo** and create a branch from `main`
   ```
   git checkout -b feat/my-feature
   ```
3. **Make your changes** — keep them focused on the issue
4. **Run lint and build**
   ```bash
   cd frontend && npm run lint && npm run build
   cd ../backend && npm run lint && npm run build
   ```
5. **Write or update tests** if applicable
6. **Commit** using conventional commit messages
7. **Push** and open a Pull Request against `main`
8. **Describe your changes** — reference the issue number, explain what and why

### PR Review Checklist

- [ ] Code follows project style and conventions
- [ ] No lint errors or TypeScript warnings
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts without errors (`npm run dev`)
- [ ] New features include documentation if needed
- [ ] No hardcoded secrets, API keys, or credentials

## Need Help?

- Open a [Discussion](https://github.com/debudebuye/fixmydb/discussions) for questions
- Open an [Issue](https://github.com/debudebuye/fixmydb/issues) for bugs or feature requests
