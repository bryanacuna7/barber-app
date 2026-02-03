#!/bin/bash

# 🎬 Script para abrir el trace más reciente de Playwright
# Uso: npm run test:e2e:trace
# O directamente: ./scripts/open-latest-trace.sh

set -e

TRACE_DIR="test-results"

# Verificar que existe el directorio de traces
if [ ! -d "$TRACE_DIR" ]; then
  echo "❌ No traces found. Run 'npm run test:e2e' first."
  exit 1
fi

# Encontrar el trace.zip más reciente
LATEST_TRACE=$(find "$TRACE_DIR" -name "trace.zip" -type f -print0 | xargs -0 ls -t | head -n 1)

if [ -z "$LATEST_TRACE" ]; then
  echo "❌ No trace.zip files found in $TRACE_DIR"
  echo "💡 Run a test first: npm run test:e2e"
  exit 1
fi

echo "🎬 Opening latest trace:"
echo "   $LATEST_TRACE"
echo ""
echo "📂 Available traces:"
find "$TRACE_DIR" -name "trace.zip" -type f -exec ls -lh {} \; | awk '{print "   " $9 " (" $5 ")"}'
echo ""

# Abrir Trace Viewer
npx playwright show-trace "$LATEST_TRACE"
