// You can rename this file with name ".prettierrc.js" and
// place it into the root directory of your project.
// https://prettier.io/docs/en/options.html
module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  jsxSingleQuote: false,
  jsxBracketSameLine: false,
  arrowParens: 'always',
  rangeStart: 0,
  rangeEnd: Infinity,
  bracketSpacing: true,
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'auto',
  overrides: [
    {
      files: ['**/*.less'],
      options: {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false
      }
    },
    {
      files: ['**/*.yml'],
      options: {
        tabWidth: 2,
        useTabs: false,
        singleQuote: false
      }
    }
  ]
}
