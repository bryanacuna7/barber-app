#!/bin/bash

# 🎥 Record User Flow
# Graba un flujo de usuario específico para documentación/análisis
#
# Uso:
#   ./scripts/record-user-flow.sh "checkout-flow"
#   ./scripts/record-user-flow.sh "onboarding" https://staging.example.com

set -e

FLOW_NAME="${1:-user-flow}"
URL="${2:-http://localhost:3000}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="explorations/flows/${FLOW_NAME}_${TIMESTAMP}"

echo "🎥 Recording User Flow: $FLOW_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 URL: $URL"
echo "📂 Output: $OUTPUT_DIR"
echo ""
echo "💡 Usa esto para:"
echo "   • Documentar flujos de usuario"
echo "   • Mostrar bugs a tu equipo"
echo "   • Onboarding de nuevos devs"
echo "   • Crear specs visuales"
echo "   • Revisar UX con product team"
echo ""
echo "Press ENTER to start recording..."
read

mkdir -p "$OUTPUT_DIR"
mkdir -p "explorations/flows"

# Verificar servidor local si es localhost
if [[ "$URL" == *"localhost"* ]]; then
  if ! lsof -i :3000 2>/dev/null | grep -q LISTEN; then
    echo "🟢 Starting dev server..."
    npm run dev > /dev/null 2>&1 &
    sleep 5
  fi
fi

# Grabar flujo
npx playwright codegen \
  "$URL" \
  --save-trace="$OUTPUT_DIR/trace.zip" \
  --viewport-size=1920,1080 \
  --device="Desktop Chrome" \
  --color-scheme=light

echo ""
echo "✅ Flow recorded!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Saved to: $OUTPUT_DIR/"
echo ""
echo "🎬 View recording:"
echo "   npx playwright show-trace $OUTPUT_DIR/trace.zip"
echo ""
echo "📝 Generated test code saved to clipboard"
echo "   You can paste it into: e2e/${FLOW_NAME}.spec.ts"
echo ""
echo "💾 Save for future reference:"
echo "   mv $OUTPUT_DIR explorations/flows/${FLOW_NAME}_baseline"
echo ""
