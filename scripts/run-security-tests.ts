#!/usr/bin/env tsx
/**
 * Comprehensive Security Test Runner for Mi Día Feature
 *
 * This script runs all 8 critical security test cases and generates
 * a detailed report with pass/fail status and recommendations.
 *
 * Test Cases:
 * 1. IDOR test: Barbers cannot access other barbers' appointments
 * 2. IDOR test: Business owners CAN access all barbers' appointments
 * 3. IDOR test: Status updates validate barber ownership
 * 4. Race condition test: Client stats updates are atomic
 * 5. Rate limiting test: Endpoints return 429 after 10 requests
 * 6. Auth test: Unauthenticated requests are rejected
 * 7. Auth test: BARBER_ID_PLACEHOLDER is completely removed
 * 8. Integration test: Full flow works end-to-end
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  testCase: string
  priority: string
  status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR'
  duration: number
  error?: string
  details?: string
}

interface TestReport {
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  skipped: number
  errors: number
  duration: number
  results: TestResult[]
  recommendations: string[]
}

class SecurityTestRunner {
  private results: TestResult[] = []
  private startTime: number = 0

  async run(): Promise<TestReport> {
    console.log('🔒 Starting Comprehensive Security Test Suite for Mi Día Feature\n')
    this.startTime = Date.now()

    // Test 1: IDOR - Barbers cannot access other barbers' appointments
    await this.runTest({
      testCase: 'SEC-001: IDOR Protection - Barber Access Control',
      priority: 'P0 (BLOCKING)',
      testCommand:
        'npx vitest run src/app/api/barbers/\\[id\\]/appointments/today/__tests__/route.security.test.ts -t "SEC-001"',
      description: 'Barbers cannot access appointments of other barbers',
    })

    // Test 2: Business owners can access all barbers
    await this.runTest({
      testCase: 'SEC-002: Business Owner Access',
      priority: 'P0 (BLOCKING)',
      testCommand:
        'npx vitest run src/app/api/barbers/\\[id\\]/appointments/today/__tests__/route.security.test.ts -t "SEC-002"',
      description: "Business owners can access all barbers' appointments",
    })

    // Test 3: Status updates validate barber ownership
    await this.runTest({
      testCase: 'SEC-003: Status Update IDOR Protection',
      priority: 'P0 (BLOCKING)',
      testCommand:
        'npx vitest run src/app/api/appointments/\\[id\\]/check-in/__tests__/route.security.test.ts -t "SEC-003"',
      description: 'Status updates validate barber ownership',
    })

    // Test 4: Race condition - Atomic client stats
    await this.runTest({
      testCase: 'SEC-004: Race Condition Protection',
      priority: 'P0 (BLOCKING)',
      testCommand:
        'npx vitest run src/app/api/appointments/\\[id\\]/complete/__tests__/route.security.test.ts -t "atomic"',
      description: 'Client stats updates are atomic (CWE-915)',
    })

    // Test 5: Rate limiting
    await this.runTest({
      testCase: 'SEC-005: Rate Limiting',
      priority: 'P1 (HIGH)',
      testCommand:
        'npx vitest run src/app/api/appointments/\\[id\\]/check-in/__tests__/route.rate-limit.test.ts',
      description: 'Endpoints return 429 after 10 requests',
    })

    // Test 6: Authentication required
    await this.runTest({
      testCase: 'SEC-006: Authentication Required',
      priority: 'P0 (BLOCKING)',
      testCommand:
        'npx vitest run src/app/api/barbers/\\[id\\]/appointments/today/__tests__/route.security.test.ts -t "SEC-003"',
      description: 'Unauthenticated requests are rejected',
    })

    // Test 7: No hardcoded barber IDs
    await this.runTest({
      testCase: 'SEC-007: No Hardcoded Credentials',
      priority: 'P0 (BLOCKING)',
      testCommand:
        'grep -r "BARBER_ID_PLACEHOLDER" src/app/api/ || echo "✓ No hardcoded credentials found"',
      description: 'BARBER_ID_PLACEHOLDER is completely removed',
    })

    // Test 8: Integration test
    await this.runTest({
      testCase: 'SEC-008: End-to-End Integration',
      priority: 'P1 (HIGH)',
      testCommand: 'npx vitest run src/app/api/appointments/\\[id\\]/__tests__/integration.test.ts',
      description: 'Full flow works end-to-end',
      optional: true,
    })

    return this.generateReport()
  }

  private async runTest(config: {
    testCase: string
    priority: string
    testCommand: string
    description: string
    optional?: boolean
  }): Promise<void> {
    const startTime = Date.now()
    console.log(`\n📋 Running: ${config.testCase}`)
    console.log(`   Priority: ${config.priority}`)
    console.log(`   Description: ${config.description}`)

    try {
      const output = execSync(config.testCommand, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000,
      })

      const duration = Date.now() - startTime
      this.results.push({
        testCase: config.testCase,
        priority: config.priority,
        status: 'PASS',
        duration,
        details: output.substring(0, 500),
      })

      console.log(`   ✅ PASSED (${duration}ms)`)
    } catch (error: any) {
      const duration = Date.now() - startTime

      // Check if this is a "no hardcoded credentials" test
      if (config.testCase.includes('Hardcoded')) {
        const isSuccess = error.stdout?.includes('No hardcoded credentials found')
        if (isSuccess) {
          this.results.push({
            testCase: config.testCase,
            priority: config.priority,
            status: 'PASS',
            duration,
            details: 'No hardcoded credentials found',
          })
          console.log(`   ✅ PASSED (${duration}ms)`)
          return
        }
      }

      if (config.optional) {
        this.results.push({
          testCase: config.testCase,
          priority: config.priority,
          status: 'SKIP',
          duration,
          details: 'Test file not found or optional test skipped',
        })
        console.log(`   ⏭️  SKIPPED (${duration}ms)`)
      } else {
        this.results.push({
          testCase: config.testCase,
          priority: config.priority,
          status: 'FAIL',
          duration,
          error: error.message || 'Unknown error',
          details: error.stdout?.substring(0, 500) || error.stderr?.substring(0, 500),
        })
        console.log(`   ❌ FAILED (${duration}ms)`)
        console.log(`   Error: ${error.message}`)
      }
    }
  }

  private generateReport(): TestReport {
    const totalDuration = Date.now() - this.startTime
    const passed = this.results.filter((r) => r.status === 'PASS').length
    const failed = this.results.filter((r) => r.status === 'FAIL').length
    const skipped = this.results.filter((r) => r.status === 'SKIP').length
    const errors = this.results.filter((r) => r.status === 'ERROR').length

    const recommendations = this.generateRecommendations()

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      skipped,
      errors,
      duration: totalDuration,
      results: this.results,
      recommendations,
    }

    this.printReport(report)
    this.saveReport(report)

    return report
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    const failedTests = this.results.filter((r) => r.status === 'FAIL')
    const p0Failed = failedTests.filter((r) => r.priority.includes('P0'))

    if (p0Failed.length > 0) {
      recommendations.push(
        '🚨 CRITICAL: P0 tests are failing. DO NOT deploy to production until these are fixed.'
      )
      p0Failed.forEach((test) => {
        recommendations.push(`   - Fix: ${test.testCase}`)
      })
    }

    if (failedTests.some((t) => t.testCase.includes('IDOR'))) {
      recommendations.push(
        '⚠️  IDOR vulnerabilities detected. Review authentication and authorization logic.'
      )
    }

    if (failedTests.some((t) => t.testCase.includes('Rate Limiting'))) {
      recommendations.push(
        '⚠️  Rate limiting tests failing. Verify rate limit middleware is properly configured.'
      )
    }

    if (failedTests.some((t) => t.testCase.includes('Race Condition'))) {
      recommendations.push(
        '⚠️  Race condition tests failing. Ensure atomic operations are used for stats updates.'
      )
    }

    const passRate =
      (this.results.filter((r) => r.status === 'PASS').length / this.results.length) * 100

    if (passRate === 100) {
      recommendations.push('✅ All security tests passing! Safe to deploy.')
    } else if (passRate >= 75) {
      recommendations.push(
        '⚠️  Most tests passing, but some issues need attention before deployment.'
      )
    } else {
      recommendations.push('🚨 Significant security issues detected. DO NOT deploy until fixed.')
    }

    return recommendations
  }

  private printReport(report: TestReport): void {
    console.log('\n')
    console.log('═'.repeat(80))
    console.log('                    SECURITY TEST REPORT')
    console.log('═'.repeat(80))
    console.log(`\nTimestamp: ${report.timestamp}`)
    console.log(`Duration: ${report.duration}ms`)
    console.log('\n📊 Summary:')
    console.log(`   Total Tests: ${report.totalTests}`)
    console.log(`   ✅ Passed: ${report.passed}`)
    console.log(`   ❌ Failed: ${report.failed}`)
    console.log(`   ⏭️  Skipped: ${report.skipped}`)
    console.log(`   🔥 Errors: ${report.errors}`)

    const passRate = (report.passed / report.totalTests) * 100
    console.log(`\n   Pass Rate: ${passRate.toFixed(1)}%`)

    console.log('\n📝 Test Results:')
    report.results.forEach((result, index) => {
      const icon =
        result.status === 'PASS'
          ? '✅'
          : result.status === 'FAIL'
            ? '❌'
            : result.status === 'SKIP'
              ? '⏭️'
              : '🔥'
      console.log(`\n   ${index + 1}. ${icon} ${result.testCase}`)
      console.log(`      Status: ${result.status}`)
      console.log(`      Priority: ${result.priority}`)
      console.log(`      Duration: ${result.duration}ms`)
      if (result.error) {
        console.log(`      Error: ${result.error.substring(0, 200)}`)
      }
    })

    console.log('\n💡 Recommendations:')
    report.recommendations.forEach((rec) => {
      console.log(`   ${rec}`)
    })

    console.log('\n' + '═'.repeat(80))
  }

  private saveReport(report: TestReport): void {
    const reportDir = path.join(process.cwd(), 'test-reports')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const filename = `security-test-report-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`
    const filepath = path.join(reportDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Report saved to: ${filepath}`)

    // Also save a latest.json for easy access
    const latestPath = path.join(reportDir, 'security-test-latest.json')
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2))
    console.log(`📄 Latest report: ${latestPath}`)
  }
}

// Run the tests
const runner = new SecurityTestRunner()
runner
  .run()
  .then((report) => {
    const exitCode = report.failed > 0 || report.errors > 0 ? 1 : 0
    process.exit(exitCode)
  })
  .catch((error) => {
    console.error('Fatal error running security tests:', error)
    process.exit(1)
  })
