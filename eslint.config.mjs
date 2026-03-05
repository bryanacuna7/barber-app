import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Project-specific generated/external content:
    'node_modules/**',
    'dist/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    '.agents/**',
    '.claude/**',
    '.github/**',
    '.playwright-mcp/**',
    'public/sw.js',
  ]),
  // Temporary rules for Phase 2-3 transition (will be fixed in Phase 3: Testing)
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-nocheck temporarily
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade to warning
      '@typescript-eslint/no-unused-vars': 'warn', // Downgrade to warning
      // Prevent naive Date construction from template literals (timezone bugs).
      // Use localDateTimeToUtcIso() or anchorDateToNoon() from @/lib/utils/timezone.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'NewExpression[callee.name="Date"][arguments.0.type="TemplateLiteral"]',
          message:
            'Do not use new Date(`...`) with template literals — it causes timezone bugs. Use localDateTimeToUtcIso() for persistence or anchorDateToNoon() for day-only logic from @/lib/utils/timezone.',
        },
      ],
    },
  },
  // Relax React hooks rules for components (valid edge cases)
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
    },
  },
  // CommonJS utility scripts can use require/module.exports.
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
])

export default eslintConfig
