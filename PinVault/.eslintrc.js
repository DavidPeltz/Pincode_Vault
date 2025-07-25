module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier', 'import'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // React Native specific rules
    'react-native/no-unused-styles': 'warn', // Warn instead of error
    'react-native/no-inline-styles': 'off', // Allow inline styles for now
    'react-native/no-color-literals': 'off', // Allow color literals for now
    'react-native/no-raw-text': 'off', // Allow raw text for now

    // React rules
    'react/prop-types': 'warn', // Warn instead of error for now
    'react/display-name': 'warn',
    'react/no-unused-prop-types': 'warn',
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
    'react/react-in-jsx-scope': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-typos': 'error',
    'react/require-render-return': 'error',
    'react/no-unstable-nested-components': 'warn', // Warn instead of error

    // JSDoc rules for documentation
    'valid-jsdoc': [
      'warn',
      {
        requireReturn: false,
        requireReturnDescription: false,
        requireParamDescription: false, // Allow missing param descriptions for now
        prefer: {
          arg: 'param',
          argument: 'param',
          class: 'constructor',
          return: 'returns',
          virtual: 'abstract',
        },
        preferType: {
          Boolean: 'boolean',
          Number: 'number',
          String: 'string',
          object: 'Object',
          function: 'Function',
        },
      },
    ],
    'require-jsdoc': 'off', // Disable for now, we already have good documentation

    // Code quality rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'no-useless-catch': 'error',
    'no-useless-concat': 'error',
    'no-unreachable': 'error',
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-mixed-spaces-and-tabs': 'error',

    // Best practices
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'dot-notation': 'error',
    'no-alert': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
    radix: 'error',

    // Style consistency
    camelcase: ['error', { properties: 'never' }],
    'new-cap': ['error', { newIsCap: true, capIsNew: false }],
    'no-array-constructor': 'error',
    'no-new-object': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': [
      'warn',
      {
        array: false,
        object: true,
      },
    ],

    // Import/Export rules
    'import/no-unresolved': 'off', // React Native resolver issues
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never',
      },
    ],

    // Async/Promise rules
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',
    'prefer-async-await': 'off', // Allow both styles

    // Security rules
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-bitwise': 'off', // Allow bitwise operations for encryption

    // Performance rules
    'no-loop-func': 'warn',
    'no-inner-declarations': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    // Specific rules for test files
    {
      files: ['**/__tests__/**', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
        'require-jsdoc': 'off',
        'react/prop-types': 'off', // PropTypes not needed in tests
        'react/display-name': 'off', // Component names not needed in tests
        'no-unused-vars': 'warn', // Relax for test variables
      },
    },
    // Specific rules for utility files
    {
      files: ['utils/**/*.js', 'constants/**/*.js'],
      rules: {
        'no-console': 'warn', // Allow console for debugging in utils
        'no-await-in-loop': 'off', // Allow await in loops for utility functions
      },
    },
    // Specific rules for configuration files
    {
      files: ['*.config.js', '.eslintrc.js', 'babel.config.js', 'metro.config.js'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
        'require-jsdoc': 'off',
      },
    },
  ],
};
