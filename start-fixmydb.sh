#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "===================================="
echo "  FixMyDB - Database Schema Analyzer"
echo "===================================="
echo ""

echo "[1/2] Building frontend..."
cd frontend
if ! npm run build > /dev/null 2>&1; then
    echo "[!] Frontend build failed. Running full install..."
    npm install
    npm run build
fi
echo "   Frontend built successfully."
cd ..

echo "[2/2] Starting FixMyDB server..."
cd backend
export NODE_ENV=production
export AUTO_OPEN=true
echo ""
echo "   Server will open in your browser automatically."
echo "   Press Ctrl+C to stop, or kill from Task Manager."
echo ""
node src/index.js

read -p "Press Enter to exit..."
