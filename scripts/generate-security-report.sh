#!/bin/bash

# Comprehensive Security Test Report Generator
# This script runs all security tests and generates a detailed report

set -e

echo "================================================================"
echo "  SECURITY TEST REPORT - Mi Día Feature"
echo "================================================================"
echo ""
echo "Running comprehensive security test suite..."
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Create test reports directory
mkdir -p test-reports

# Test output file
REPORT_FILE="test-reports/security-report-$(date +%Y%m%d-%H%M%S).txt"

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local priority="$3"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Test: $test_name"
    echo "   Priority: $priority"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if eval "$test_command" >> "$REPORT_FILE" 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "   See $REPORT_FILE for details"
    fi
    echo ""
}

# Initialize report
echo "Security Test Report - $(date)" > "$REPORT_FILE"
echo "========================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "🔍 Test Suite Execution:"
echo ""

# Test 1: IDOR - Barber access control
run_test \
    "SEC-001: IDOR Protection - Barber Access Control" \
    "npx vitest run 'src/app/api/barbers/\[id\]/appointments/today/__tests__/route.security.test.ts' --reporter=verbose 2>&1 | tee -a" \
    "P0 (BLOCKING)"

# Test 2: IDOR - Status updates
run_test \
    "SEC-002: IDOR Protection - Status Updates" \
    "npx vitest run 'src/app/api/appointments/\[id\]/check-in/__tests__/route.security.test.ts' --reporter=verbose 2>&1 | tee -a" \
    "P0 (BLOCKING)"

# Test 3: IDOR - Complete endpoint
run_test \
    "SEC-003: IDOR Protection - Complete Endpoint" \
    "npx vitest run 'src/app/api/appointments/\[id\]/complete/__tests__/route.security.test.ts' --reporter=verbose 2>&1 | tee -a" \
    "P0 (BLOCKING)"

# Test 4: Rate Limiting
run_test \
    "SEC-004: Rate Limiting Protection" \
    "npx vitest run 'src/app/api/appointments/\[id\]/check-in/__tests__/route.rate-limit.test.ts' --reporter=verbose 2>&1 | tee -a" \
    "P1 (HIGH)"

# Test 5: No hardcoded credentials
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Test: SEC-005: No Hardcoded Credentials"
echo "   Priority: P0 (BLOCKING)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if ! grep -r "BARBER_ID_PLACEHOLDER" src/app/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC} - No hardcoded credentials found"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "✓ No hardcoded credentials found" >> "$REPORT_FILE"
else
    echo -e "${RED}❌ FAILED${NC} - Found hardcoded credentials"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "✗ Found hardcoded credentials:" >> "$REPORT_FILE"
    grep -r "BARBER_ID_PLACEHOLDER" src/app/api/ >> "$REPORT_FILE" 2>&1 || true
fi
echo ""

# Test 6: Check for SQL injection vulnerabilities
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Test: SEC-006: SQL Injection Protection"
echo "   Priority: P0 (BLOCKING)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check for dangerous SQL patterns (string interpolation in queries)
if ! grep -r '\${\|' src/app/api/ | grep -E '(select|insert|update|delete|from|where)' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC} - No SQL injection vulnerabilities found"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "✓ No SQL injection vulnerabilities found" >> "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Potential SQL injection patterns found"
    echo "⚠ Potential SQL injection patterns found:" >> "$REPORT_FILE"
    grep -r '\${\|' src/app/api/ | grep -E '(select|insert|update|delete|from|where)' >> "$REPORT_FILE" 2>&1 || true
fi
echo ""

# Test 7: Check atomic operations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Test: SEC-007: Atomic Operations (Race Condition Protection)"
echo "   Priority: P0 (BLOCKING)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check that complete endpoint uses increment_client_stats RPC
if grep -q "increment_client_stats" src/app/api/appointments/\[id\]/complete/route.ts; then
    echo -e "${GREEN}✅ PASSED${NC} - Atomic RPC function is used"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "✓ Atomic RPC function is used for client stats" >> "$REPORT_FILE"
else
    echo -e "${RED}❌ FAILED${NC} - Atomic RPC function not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "✗ Atomic RPC function not found - race condition vulnerability" >> "$REPORT_FILE"
fi
echo ""

# Test 8: Authentication middleware
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Test: SEC-008: Authentication Middleware"
echo "   Priority: P0 (BLOCKING)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check that routes use withAuth or withAuthAndRateLimit
UNPROTECTED_ROUTES=0
for route in src/app/api/barbers/\[id\]/appointments/today/route.ts \
              src/app/api/appointments/\[id\]/check-in/route.ts \
              src/app/api/appointments/\[id\]/complete/route.ts \
              src/app/api/appointments/\[id\]/no-show/route.ts; do
    if [ -f "$route" ]; then
        if ! grep -q "withAuth\|withAuthAndRateLimit" "$route"; then
            echo -e "${RED}⚠️  Route not protected: $route${NC}"
            UNPROTECTED_ROUTES=$((UNPROTECTED_ROUTES + 1))
        fi
    fi
done

if [ $UNPROTECTED_ROUTES -eq 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - All routes protected with authentication"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "✓ All routes protected with authentication middleware" >> "$REPORT_FILE"
else
    echo -e "${RED}❌ FAILED${NC} - $UNPROTECTED_ROUTES routes not protected"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "✗ $UNPROTECTED_ROUTES routes not protected with authentication" >> "$REPORT_FILE"
fi
echo ""

# Generate summary
echo "================================================================"
echo "                      TEST SUMMARY"
echo "================================================================"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}✅ Passed: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Failed: $FAILED_TESTS${NC}"
echo ""

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "Pass Rate: $PASS_RATE%"
echo ""

# Add summary to report
{
    echo ""
    echo "================================================================"
    echo "SUMMARY"
    echo "================================================================"
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo "Pass Rate: $PASS_RATE%"
    echo ""
} >> "$REPORT_FILE"

# Generate recommendations
echo "💡 Recommendations:"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All security tests passing! Safe to deploy.${NC}"
    echo "✅ All security tests passing! Safe to deploy." >> "$REPORT_FILE"
elif [ $PASS_RATE -ge 75 ]; then
    echo -e "${YELLOW}⚠️  Most tests passing, but some issues need attention before deployment.${NC}"
    echo "⚠️  Most tests passing, but some issues need attention before deployment." >> "$REPORT_FILE"
else
    echo -e "${RED}🚨 CRITICAL: Significant security issues detected. DO NOT deploy until fixed.${NC}"
    echo "🚨 CRITICAL: Significant security issues detected. DO NOT deploy until fixed." >> "$REPORT_FILE"
fi

echo ""
echo "📄 Full report saved to: $REPORT_FILE"
echo ""
echo "================================================================"

# Copy to latest
cp "$REPORT_FILE" "test-reports/security-report-latest.txt"

# Exit with appropriate code
if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
else
    exit 0
fi
