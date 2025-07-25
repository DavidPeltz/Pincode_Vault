module.exports = {
  // Print settings
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // Syntax preferences
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',

  // Bracket and spacing
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // JSX specific
  jsxSingleQuote: false,

  // Line endings (use LF for cross-platform compatibility)
  endOfLine: 'lf',

  // Range formatting (format entire file)
  rangeStart: 0,
  rangeEnd: Infinity,

  // Parser settings
  requirePragma: false,
  insertPragma: false,

  // Override settings for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
