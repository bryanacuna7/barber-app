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
  ]),
  // Temporary rules for Phase 2-3 transition (will be fixed in Phase 3: Testing)
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off', // Allow @ts-nocheck temporarily
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade to warning
      '@typescript-eslint/no-unused-vars': 'warn', // Downgrade to warning
    },
  },
])

export default eslintConfig
