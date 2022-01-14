//@ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  rules: {
    'node/shebang': 'off',
    'node/no-unsupported-features/es-syntax': 'off',

    'node/no-missing-import': [
      'error',
      {
        tryExtensions: ['.ts', '.js', '.d.ts']
      }
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
})
