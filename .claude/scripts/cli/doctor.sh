#!/usr/bin/env bash

# doctor.sh
# Health check for Claude Starter Kit project

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
  echo -e "${CYAN}🏥 Claude Starter Kit - Health Check${NC}"
  echo -e "${CYAN}═══════════════════════════════════════${NC}"
  echo ""
}

print_section() {
  echo -e "\n${BLUE}▶ $1${NC}"
}

check_pass() {
  echo -e "  ${GREEN}✅ $1${NC}"
}

check_fail() {
  echo -e "  ${RED}❌ $1${NC}"
}

check_warn() {
  echo -e "  ${YELLOW}⚠️  $1${NC}"
}

check_info() {
  echo -e "  ${CYAN}ℹ️  $1${NC}"
}

# Check counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 1. Git Status
check_git() {
  print_section "Git Repository"

  if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Git repository initialized"
    PASS_COUNT=$((PASS_COUNT + 1))

    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
      check_pass "Working tree clean"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      local changes=$(git status --porcelain | wc -l | tr -d ' ')
      check_warn "Working tree has $changes uncommitted changes"
      WARN_COUNT=$((WARN_COUNT + 1))
    fi

    # Check current branch
    local branch=$(git branch --show-current)
    check_info "Current branch: $branch"
  else
    check_fail "Not a git repository"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# 2. Node.js & NPM
check_node() {
  print_section "Node.js Environment"

  if command -v node &> /dev/null; then
    local node_version=$(node --version)
    check_pass "Node.js: $node_version"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    check_fail "Node.js not installed"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi

  if command -v npm &> /dev/null; then
    local npm_version=$(npm --version)
    check_pass "NPM: v$npm_version"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    check_fail "NPM not installed"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi

  # Check for package.json
  if [ -f "package.json" ]; then
    check_pass "package.json found"
    PASS_COUNT=$((PASS_COUNT + 1))

    # Check node_modules
    if [ -d "node_modules" ]; then
      check_pass "node_modules installed"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      check_warn "node_modules not found (run: npm install)"
      WARN_COUNT=$((WARN_COUNT + 1))
    fi

    # Check for outdated packages
    local outdated=$(npm outdated 2>&1 | grep -v "^$" | wc -l | tr -d ' ')
    if [ "$outdated" -gt 0 ]; then
      check_warn "$outdated packages outdated"
      WARN_COUNT=$((WARN_COUNT + 1))
    else
      check_pass "All packages up to date"
      PASS_COUNT=$((PASS_COUNT + 1))
    fi
  else
    check_info "No package.json (not a Node.js project)"
  fi
}

# 3. Dev Server
check_dev_server() {
  print_section "Development Server"

  if lsof -i :3000 2>/dev/null | grep -q LISTEN; then
    local pid=$(lsof -t -i:3000 2>/dev/null)
    check_pass "Server running on :3000 (PID: $pid)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    check_info "Server not running on :3000"
  fi
}

# 4. Claude Code Configuration
check_claude_config() {
  print_section "Claude Code Configuration"

  # Check .claude directory
  if [ -d ".claude" ]; then
    check_pass ".claude directory exists"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    check_fail ".claude directory missing"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    return
  fi

  # Check config.json
  if [ -f ".claude/config.json" ]; then
    check_pass "config.json found"
    PASS_COUNT=$((PASS_COUNT + 1))

    # Validate JSON syntax
    if command -v jq &> /dev/null; then
      if jq empty .claude/config.json 2>/dev/null; then
        check_pass "config.json is valid JSON"
        PASS_COUNT=$((PASS_COUNT + 1))
      else
        check_fail "config.json has invalid JSON syntax"
        FAIL_COUNT=$((FAIL_COUNT + 1))
      fi
    fi
  else
    check_warn "config.json not found (legacy structure)"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi

  # Check CLAUDE.md
  if [ -f "CLAUDE.md" ]; then
    check_pass "CLAUDE.md found"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    check_warn "CLAUDE.md missing"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi

  # Check PROGRESS.md
  if [ -f "PROGRESS.md" ]; then
    check_info "PROGRESS.md exists (session continuity active)"
  fi
}

# 5. Skills
check_skills() {
  print_section "Skills"

  if [ -d ".claude/skills" ]; then
    # New structure (bundled/managed/custom)
    if [ -d ".claude/skills/bundled" ]; then
      local bundled_count=$(find .claude/skills/bundled -maxdepth 1 -type d ! -path .claude/skills/bundled | wc -l | tr -d ' ')
      check_pass "Bundled skills: $bundled_count"
      PASS_COUNT=$((PASS_COUNT + 1))
    fi

    if [ -d ".claude/skills/managed" ]; then
      local managed_count=$(find .claude/skills/managed -maxdepth 1 -type l | wc -l | tr -d ' ')
      check_pass "Managed skills: $managed_count"
      PASS_COUNT=$((PASS_COUNT + 1))
    fi

    if [ -d ".claude/skills/custom" ]; then
      local custom_count=$(find .claude/skills/custom -maxdepth 1 -type d ! -path .claude/skills/custom | wc -l | tr -d ' ')
      if [ "$custom_count" -gt 0 ]; then
        check_pass "Custom skills: $custom_count"
      else
        check_info "Custom skills: 0 (empty)"
      fi
      PASS_COUNT=$((PASS_COUNT + 1))
    fi
  else
    check_fail ".claude/skills directory missing"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# 6. MCPs
check_mcps() {
  print_section "Model Context Protocols"

  if [ -f ".mcp.json" ] || [ -f ".claude/config.json" ]; then
    check_pass "MCP configuration found"
    PASS_COUNT=$((PASS_COUNT + 1))

    # Check if npx is available
    if command -v npx &> /dev/null; then
      check_pass "npx available for MCP servers"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      check_fail "npx not available"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi

    # Check Memory MCP file
    if [ -f ".claude/memory.json" ]; then
      check_pass "Memory MCP storage found"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      check_info "Memory MCP storage not initialized yet"
    fi
  else
    check_warn "No MCP configuration found"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi
}

# 7. Security
check_security() {
  print_section "Security"

  # Check for .env file
  if [ -f ".env" ]; then
    check_warn ".env file exists (ensure it's in .gitignore)"
    WARN_COUNT=$((WARN_COUNT + 1))

    if grep -q "^\.env$" .gitignore 2>/dev/null; then
      check_pass ".env is gitignored"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      check_fail ".env NOT in .gitignore (security risk!)"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  fi

  # Check for exposed secrets in git history (basic check)
  if git rev-parse --git-dir > /dev/null 2>&1; then
    if git log --all --full-history --pretty=format: | grep -i -E "(password|secret|key|token)" 2>/dev/null | head -1 > /dev/null; then
      check_warn "Potential secrets found in git history"
      WARN_COUNT=$((WARN_COUNT + 1))
    else
      check_pass "No obvious secrets in git history"
      PASS_COUNT=$((PASS_COUNT + 1))
    fi
  fi

  # Run npm audit if available
  if [ -f "package.json" ] && [ -d "node_modules" ]; then
    local vulnerabilities=$(npm audit --json 2>/dev/null | grep -o '"total":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    if [ "$vulnerabilities" -eq 0 ]; then
      check_pass "No npm vulnerabilities"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      check_warn "$vulnerabilities npm vulnerabilities found"
      WARN_COUNT=$((WARN_COUNT + 1))
    fi
  fi
}

# Summary
print_summary() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════${NC}"
  echo -e "${CYAN}📊 Summary${NC}"
  echo -e "${CYAN}═══════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ Passed: $PASS_COUNT${NC}"
  echo -e "${YELLOW}  ⚠️  Warnings: $WARN_COUNT${NC}"
  echo -e "${RED}  ❌ Failed: $FAIL_COUNT${NC}"
  echo ""

  if [ "$FAIL_COUNT" -eq 0 ] && [ "$WARN_COUNT" -eq 0 ]; then
    echo -e "${GREEN}🎉 Your project is healthy!${NC}"
    exit 0
  elif [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Your project has some warnings, but is functional.${NC}"
    exit 0
  else
    echo -e "${RED}❌ Your project has critical issues that need attention.${NC}"
    exit 1
  fi
}

# Main
main() {
  print_header
  check_git
  check_node
  check_dev_server
  check_claude_config
  check_skills
  check_mcps
  check_security
  print_summary
}

main "$@"
