#!/bin/bash
# =============================================================
# Hook: enforce-deploy-script.sh
# Purpose: Block direct "vercel deploy" commands and redirect
#          to npm run deploy:prod / deploy:preview which does
#          git push BEFORE deploying (triggering Discord notify)
# =============================================================
set -e

INPUT=$(cat)

# Extract the command from tool_input
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command found, allow
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Check if the command is a direct vercel deploy (not through npm script)
# Allow: npm run deploy:prod, npm run deploy:preview, bash scripts/deploy-with-push.sh
# Block: vercel deploy, vercel --prod, vercel deploy --prod
if echo "$COMMAND" | grep -qE '^\s*vercel\s+(deploy|--prod)'; then
  cat >&2 <<'MSG'
BLOCKED: Direct "vercel deploy" bypasses git push, so Discord release notifications won't fire.

Use instead:
  npm run deploy:prod      → production (pushes to git first)
  npm run deploy:preview   → preview (pushes to git first)

These run scripts/deploy-with-push.sh which does git push before vercel deploy.
MSG
  exit 2
fi

# Allow everything else
exit 0
