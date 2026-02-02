#!/bin/bash
# Clean unnecessary agent directories created by npx skills
# This is a Claude Code project - we only need .claude/

echo "🧹 Cleaning non-Claude agent directories..."
echo ""

# List of agents to remove (keep only .claude)
AGENTS_TO_REMOVE=(
  ".agent"           # Duplicate of .agents
  ".antigravity"
  ".cline"
  ".codebuddy"
  ".codex"
  ".commandcode"
  ".continue"
  ".crush"
  ".cursor"
  ".droid"
  ".factory"
  ".gemini"
  ".goose"
  ".junie"
  ".kilocode"
  ".kilo"
  ".kiro"
  ".kode"
  ".mcpjam"
  ".mux"
  ".neovate"
  ".opencode"
  ".openclaw"
  ".openhands"
  ".pi"
  ".pochi"
  ".qoder"
  ".qwen"
  ".replit"
  ".roo"
  ".trae"
  ".windsurf"
  ".zencoder"
  "skills"          # Duplicate in root (should only be in .claude/)
)

# Directories to keep (whitelist)
KEEP_DIRS=(
  ".agents"
  ".claude"
  ".git"
  ".github"
  ".husky"
  ".next"
  ".playwright-mcp"
  ".vscode"
  ".idea"
  ".env"
  ".env.local"
  ".env.example"
)

REMOVED=0
SKIPPED=0

for agent in "${AGENTS_TO_REMOVE[@]}"; do
  if [ -d "$agent" ] || [ -f "$agent" ]; then
    rm -rf "$agent"
    echo "  ✓ Removed $agent"
    ((REMOVED++))
  fi
done

echo ""
if [ $REMOVED -eq 0 ]; then
  echo "✅ No unnecessary directories found - project is clean!"
else
  echo "✅ Removed $REMOVED unnecessary agent directories"
fi

echo ""
echo "📂 Keeping (Claude Code essentials):"
echo "  .agents/         - Skills source (✓)"
echo "  .claude/         - Claude Code config (✓)"
echo "  .git/            - Version control (✓)"
echo "  .github/         - GitHub workflows (✓)"
echo "  .husky/          - Git hooks (✓)"
echo "  .next/           - Next.js build (✓)"
echo "  .playwright-mcp/ - Browser cache (✓)"
