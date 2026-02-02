#!/usr/bin/env bash

# skills-update.sh
# Update all managed skills (git pull in external repos)

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
AGENTS_DIR="$PROJECT_ROOT/.agents/skills"

echo "🔄 Updating managed skills..."
echo ""

if [ ! -d "$AGENTS_DIR" ]; then
  echo "⚠️  No .agents/skills directory found"
  exit 0
fi

updated_count=0
failed_count=0
skipped_count=0

# Update each skill repository
for skill_dir in "$AGENTS_DIR"/*; do
  if [ ! -d "$skill_dir" ]; then
    continue
  fi

  skill_name=$(basename "$skill_dir")

  # Check if it's a git repository
  if [ -d "$skill_dir/.git" ]; then
    echo "📦 $skill_name"

    # Check if there are uncommitted changes
    cd "$skill_dir"
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
      echo "   ⚠️  Has uncommitted changes, skipping"
      ((skipped_count++))
      continue
    fi

    # Pull latest changes
    if git pull --quiet 2>/dev/null; then
      echo "   ✅ Updated"
      ((updated_count++))
    else
      echo "   ❌ Failed to update"
      ((failed_count++))
    fi
  else
    echo "📦 $skill_name"
    echo "   ℹ️  Not a git repository, skipping"
    ((skipped_count++))
  fi
done

echo ""
echo "📊 Summary:"
echo "   ✅ Updated: $updated_count"
if [ $failed_count -gt 0 ]; then
  echo "   ❌ Failed: $failed_count"
fi
if [ $skipped_count -gt 0 ]; then
  echo "   ⏭️  Skipped: $skipped_count"
fi

echo ""

if [ $updated_count -gt 0 ]; then
  echo "✅ Managed skills updated successfully!"
  echo ""
  echo "💡 Run './bin/claude-kit doctor' to verify everything works"
else
  echo "ℹ️  No skills were updated"
fi
