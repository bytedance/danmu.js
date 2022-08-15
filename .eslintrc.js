/* eslint-env node */
module.exports = {
  extends: ['plugin:@byted-lint/eslint-plugin-meta/javascript'],
  plugins: ['@byted-lint/eslint-plugin-meta'],
  env: {
    // Your environments (which contains several predefined global variables)
    //
    browser: true,
    // node: true,
    es6: true
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never']
  }
}
