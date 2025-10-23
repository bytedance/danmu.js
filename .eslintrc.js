/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended'],
  plugins: [],
  ignorePatterns: ['dist/**/*', 'browser/**/*'],
  env: {
    // Your environments (which contains several predefined global variables)
    //
    browser: true,
    // node: true,
    es6: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    __VERSION__: 'readonly'
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'prefer-const': 'off',
    eqeqeq: ['warn', 'smart'],
    'guard-for-in': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
}
