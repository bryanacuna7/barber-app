#!/bin/bash
# =============================================================
# Deploy Script: git push → vercel deploy → Discord notification
#
# Usage:
#   npm run deploy:prod      (or: bash scripts/deploy-with-push.sh --prod)
#   npm run deploy:preview   (or: bash scripts/deploy-with-push.sh)
#
# Requires:
#   - DISCORD_WEBHOOK_URL env var (in .env.local or exported)
#   - vercel CLI installed and linked
#   - RELEASE_NOTES.md in project root
# =============================================================
set -euo pipefail

PROD_FLAG=""
ENVIRONMENT="preview"

if [[ "${1:-}" == "--prod" ]]; then
  PROD_FLAG="--prod"
  ENVIRONMENT="production"
fi

VERSION=$(node -p "require('./package.json').version")
PROJECT_NAME="BarberApp"

echo "================================================"
echo "  Deploying $PROJECT_NAME v$VERSION ($ENVIRONMENT)"
echo "================================================"

# ── 1. Git push ──────────────────────────────────────
echo ""
echo "→ Pushing to remote..."
git push
echo "✅ Git push complete"

# ── 2. Vercel deploy ─────────────────────────────────
echo ""
echo "→ Deploying to Vercel ($ENVIRONMENT)..."
DEPLOY_URL=$(vercel deploy $PROD_FLAG --yes 2>&1 | grep -oE 'https://[^ ]+\.vercel\.app' | tail -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "⚠️  Could not capture deploy URL, but deploy may have succeeded."
  DEPLOY_URL="(URL not captured)"
fi

echo "✅ Vercel deploy complete: $DEPLOY_URL"

# ── 3. Discord notification ──────────────────────────
# Load webhook URL from .env.local if not already set
if [ -z "${DISCORD_WEBHOOK_URL:-}" ] && [ -f ".env.local" ]; then
  DISCORD_WEBHOOK_URL=$(grep '^DISCORD_WEBHOOK_URL=' .env.local 2>/dev/null | cut -d'=' -f2- | tr -d '"' || true)
fi

if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo ""
  echo "⚠️  DISCORD_WEBHOOK_URL not set — skipping Discord notification."
  echo "   Add it to .env.local to enable release notifications."
  echo ""
  echo "================================================"
  echo "  ✅ Deploy complete: v$VERSION → $ENVIRONMENT"
  echo "  🔗 $DEPLOY_URL"
  echo "================================================"
  exit 0
fi

echo ""
echo "→ Sending Discord notification..."

# Extract release notes (skip YAML front matter and header)
NOTES=$(sed -n '/^## v/,/^## v/{/^## v.*$/!p}' RELEASE_NOTES.md | head -30 | sed 's/"/\\"/g')

# Build Discord embed payload
PAYLOAD=$(cat <<ENDJSON
{
  "embeds": [{
    "title": "🚀 $PROJECT_NAME v$VERSION deployed to $ENVIRONMENT",
    "url": "$DEPLOY_URL",
    "color": 5763719,
    "description": "$NOTES",
    "footer": {
      "text": "Deployed via deploy-with-push.sh"
    },
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }]
}
ENDJSON
)

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$DISCORD_WEBHOOK_URL")

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Discord notification sent"
else
  echo "⚠️  Discord notification failed (HTTP $HTTP_CODE) — deploy still succeeded"
fi

echo ""
echo "================================================"
echo "  ✅ Deploy complete: v$VERSION → $ENVIRONMENT"
echo "  🔗 $DEPLOY_URL"
echo "================================================"
