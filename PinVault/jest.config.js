module.exports = {
  preset: 'react-native',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],
  
  // Test environment
  testEnvironment: 'node',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Module name mapping for assets and styles
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/jest/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '\\.snap$',
  ],
  
  // Coverage configuration
  collectCoverage: false, // Enable with npm run test:coverage
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'utils/**/*.{js,jsx}',
    'contexts/**/*.{js,jsx}',
    'hooks/**/*.{js,jsx}',
    'constants/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/*.test.{js,jsx}',
    '!**/*.spec.{js,jsx}',
    '!**/coverage/**',
    '!jest/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Global test timeout
  testTimeout: 10000,
  
  // Globals
  globals: {
    __DEV__: true,
  },
  
  // Transform ignore patterns for node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@unimodules|unimodules|react-navigation|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context)/)',
  ],
};