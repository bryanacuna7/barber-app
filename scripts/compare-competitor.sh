#!/bin/bash

# 🆚 Competitor Analysis Tool
# Compara tu app vs competencia lado a lado
#
# Uso:
#   ./scripts/compare-competitor.sh https://competitor.com /your-page

set -e

COMPETITOR_URL="${1}"
YOUR_PATH="${2:-/}"
YOUR_URL="http://localhost:3000${YOUR_PATH}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="explorations/comparison_${TIMESTAMP}"

if [ -z "$COMPETITOR_URL" ]; then
  echo "❌ Error: Debes proporcionar URL de competencia"
  echo ""
  echo "Uso:"
  echo "  ./scripts/compare-competitor.sh https://competitor.com"
  echo "  ./scripts/compare-competitor.sh https://competitor.com /pricing"
  echo ""
  exit 1
fi

echo "🆚 Competitor Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔴 Tu app:        $YOUR_URL"
echo "🔵 Competencia:   $COMPETITOR_URL"
echo "📂 Guardando en:  $OUTPUT_DIR"
echo ""
echo "🎯 Qué revisar:"
echo "   • Layout y diseño"
echo "   • Features disponibles"
echo "   • Flujos de usuario"
echo "   • Performance (network tab)"
echo "   • Mensajes de error"
echo ""

# Verificar que dev server esté corriendo
if ! lsof -i :3000 2>/dev/null | grep -q LISTEN; then
  echo "⚠️  Dev server no está corriendo"
  echo "   Iniciando servidor..."
  npm run dev > /dev/null 2>&1 &
  sleep 5
fi

mkdir -p "$OUTPUT_DIR"

echo "Abriendo navegadores..."
echo ""
echo "🔴 Navegador 1 (izquierda): TU APP"
echo "   Explora tu aplicación aquí"
echo ""

# Abrir tu app
npx playwright codegen \
  "$YOUR_URL" \
  --save-trace="$OUTPUT_DIR/yours-trace.zip" \
  --viewport-size=1400,900 &

YOUR_PID=$!

sleep 2

echo "🔵 Navegador 2 (derecha): COMPETENCIA"
echo "   Explora la competencia aquí"
echo ""

# Abrir competencia
npx playwright codegen \
  "$COMPETITOR_URL" \
  --save-trace="$OUTPUT_DIR/competitor-trace.zip" \
  --viewport-size=1400,900 &

COMPETITOR_PID=$!

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Tips para comparar:"
echo ""
echo "   ✅ Haz las mismas acciones en ambos"
echo "   ✅ Compara tiempos de carga (network tab)"
echo "   ✅ Nota diferencias en UX"
echo "   ✅ Screenshot features interesantes"
echo ""
echo "Cierra ambos navegadores cuando termines..."
echo ""

# Esperar a que ambos procesos terminen
wait $YOUR_PID
wait $COMPETITOR_PID

echo ""
echo "✅ Comparación completa!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Archivos guardados:"
echo "   $OUTPUT_DIR/yours-trace.zip       (tu app)"
echo "   $OUTPUT_DIR/competitor-trace.zip  (competencia)"
echo ""
echo "🎬 Ver traces:"
echo "   # Tu app"
echo "   npx playwright show-trace $OUTPUT_DIR/yours-trace.zip"
echo ""
echo "   # Competencia"
echo "   npx playwright show-trace $OUTPUT_DIR/competitor-trace.zip"
echo ""
echo "📊 Siguiente paso: Documentar findings"
echo "   Crear: docs/analysis/competitor-analysis-${TIMESTAMP}.md"
echo ""
