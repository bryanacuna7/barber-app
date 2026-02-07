#!/bin/bash

# 🔍 UI/UX Exploration Tool
# Abre un navegador para explorar manualmente con grabación completa
#
# Uso:
#   ./scripts/explore-ui.sh                    # Tu app (localhost:3000)
#   ./scripts/explore-ui.sh https://example.com # Competencia

set -e

URL="${1:-http://localhost:3000}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="explorations/${TIMESTAMP}"

echo "🔍 UI/UX Exploration Mode"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 URL: $URL"
echo "📂 Recording to: $OUTPUT_DIR"
echo ""
echo "🎬 Todo será grabado:"
echo "   ✅ Trace completo de acciones"
echo "   ✅ Video de la sesión"
echo "   ✅ Screenshots automáticos"
echo ""
echo "💡 Qué hacer:"
echo "   1. Navega libremente por el sitio"
echo "   2. Prueba features, clicks, forms"
echo "   3. Cuando termines, cierra el navegador"
echo "   4. Se generará un trace para revisar"
echo ""
echo "Press ENTER to start..."
read

# Crear directorio de output
mkdir -p "$OUTPUT_DIR"

# Ejecutar Playwright en modo codegen (grabación + inspector)
# --save-trace graba trace completo
# --viewport-size simula desktop común
npx playwright codegen \
  "$URL" \
  --save-trace="$OUTPUT_DIR/trace.zip" \
  --viewport-size=1920,1080 \
  --color-scheme=light

echo ""
echo "✅ Exploración completa!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Archivos guardados en: $OUTPUT_DIR/"
echo ""
echo "🎬 Ver el trace ahora:"
echo "   npx playwright show-trace $OUTPUT_DIR/trace.zip"
echo ""
echo "📝 El código generado está en tu portapapeles"
echo "   Puedes pegarlo en un test si quieres automatizar"
echo ""
