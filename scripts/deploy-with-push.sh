#!/bin/bash
# =============================================================
# Deploy Script: git push → Vercel Git Integration handles deploy
#
# Usage:
#   npm run deploy:prod      (or: bash scripts/deploy-with-push.sh --prod)
#   npm run deploy:preview   (or: bash scripts/deploy-with-push.sh)
#
# Note: Vercel deploys automatically via Git Integration on push.
#       Discord notifications are handled by the GitHub Action
#       (.github/workflows/discord-deploy-notify.yml) when
#       RELEASE_NOTES.md changes.
# =============================================================
set -euo pipefail

ENVIRONMENT="preview"

if [[ "${1:-}" == "--prod" ]]; then
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

# Vercel Git Integration will automatically deploy from the push.
# Track deployment at: https://vercel.com/nexo/barber-app/deployments

echo ""
echo "================================================"
echo "  ✅ Push complete: v$VERSION → $ENVIRONMENT"
echo "  🔗 Vercel will deploy automatically via Git Integration"
echo "  📋 https://vercel.com/nexo/barber-app/deployments"
echo "================================================"
