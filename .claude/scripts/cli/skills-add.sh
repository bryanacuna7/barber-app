#!/usr/bin/env bash

# skills-add.sh
# Install a new skill to Claude Starter Kit

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_error() {
  echo -e "${RED}❌ Error: $1${NC}" >&2
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Show help
show_help() {
  cat << EOF
Usage: claude-kit skills add <skill-name>

Add a new skill from external repositories.

Arguments:
  skill-name    Name of the skill (e.g., vercel/web-guidelines)

Supported sources:
  - vercel/<name>        Skills from Vercel repos
  - antigravity/<name>   Skills from Antigravity collection

Examples:
  claude-kit skills add vercel/web-guidelines
  claude-kit skills add antigravity/error-handling-patterns

Note: Custom skills should be added manually to .claude/skills/custom/
EOF
}

# Parse skill name
parse_skill_name() {
  local skill_full="$1"

  if [[ "$skill_full" == *"/"* ]]; then
    SOURCE="${skill_full%%/*}"
    SKILL_NAME="${skill_full#*/}"
  else
    print_error "Invalid skill format. Use: source/skill-name"
    echo "Example: vercel/web-guidelines"
    exit 1
  fi
}

# Install from Vercel
install_vercel_skill() {
  local skill_name="$1"

  print_info "Installing Vercel skill: $skill_name"

  # Check if skill repo exists in .agents/skills/
  local skill_repo=".agents/skills/$skill_name"

  if [ ! -d "$skill_repo" ]; then
    print_error "Skill repository not found: $skill_repo"
    echo "Available Vercel skills:"
    ls -1 .agents/skills/ | grep "^vercel-" || echo "(none found)"
    exit 1
  fi

  # Create symlink in managed/
  local target_link=".claude/skills/managed/$skill_name"

  if [ -L "$target_link" ] || [ -d "$target_link" ]; then
    print_error "Skill already installed: $skill_name"
    exit 1
  fi

  ln -s "../../../.agents/skills/$skill_name" "$target_link"
  print_success "Installed: $skill_name"
  print_info "Location: $target_link -> $skill_repo"
}

# Install from Antigravity
install_antigravity_skill() {
  local skill_name="$1"

  print_info "Installing Antigravity skill: $skill_name"

  local skill_repo=".agents/skills/antigravity-awesome-skills/skills/$skill_name"

  if [ ! -d "$skill_repo" ]; then
    print_error "Skill not found: $skill_name"
    echo "Available Antigravity skills:"
    ls -1 .agents/skills/antigravity-awesome-skills/skills/ 2>/dev/null || echo "(collection not installed)"
    exit 1
  fi

  local target_link=".claude/skills/managed/$skill_name"

  if [ -L "$target_link" ] || [ -d "$target_link" ]; then
    print_error "Skill already installed: $skill_name"
    exit 1
  fi

  ln -s "../../../.agents/skills/antigravity-awesome-skills/skills/$skill_name" "$target_link"
  print_success "Installed: $skill_name"
  print_info "Location: $target_link -> $skill_repo"
}

# Main
main() {
  if [ $# -eq 0 ]; then
    show_help
    exit 1
  fi

  local skill_full="$1"

  # Parse skill name
  parse_skill_name "$skill_full"

  # Ensure managed directory exists
  mkdir -p .claude/skills/managed

  # Install based on source
  case "$SOURCE" in
    vercel)
      install_vercel_skill "$SKILL_NAME"
      ;;
    antigravity)
      install_antigravity_skill "$SKILL_NAME"
      ;;
    *)
      print_error "Unknown source: $SOURCE"
      echo "Supported sources: vercel, antigravity"
      exit 1
      ;;
  esac

  echo ""
  print_success "Skill installation complete!"
  print_info "The skill will be available in your next Claude Code session."
}

main "$@"
