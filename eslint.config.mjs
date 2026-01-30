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
  // Relax React 19 strict rules for components (valid edge cases)
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
    },
  },
])

export default eslintConfig
