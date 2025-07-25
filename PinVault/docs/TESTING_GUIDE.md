# PIN Vault Testing Guide

This guide provides comprehensive instructions for testing the PIN Vault application, including running tests, writing new tests, and understanding the testing infrastructure.

## Table of Contents

- [Quick Start](#quick-start)
- [Testing Infrastructure](#testing-infrastructure)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Mocking](#mocking)
- [Best Practices](#best-practices)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js and npm installed
- All project dependencies installed (`npm install`)

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Testing Infrastructure

### Framework and Libraries

The project uses the following testing technologies:

- **Jest**: Test runner and testing framework
- **React Native Testing Library**: Component testing utilities
- **React Test Renderer**: React component rendering for tests

### Configuration

#### Jest Configuration (`jest.config.js`)

- **Preset**: `react-native` for React Native compatibility
- **Environment**: `node` for compatibility with React Native mocks
- **Setup**: Custom setup file with mocks for Expo and React Native modules
- **Coverage**: Configurable coverage thresholds (70% minimum)
- **Transform**: Babel transformation for ES6+ and JSX

#### Key Configuration Options

```javascript
{
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Mocks and Setup

#### Global Setup (`jest/setup.js`)

The setup file provides comprehensive mocks for:

- **React Native modules**: Platform, Dimensions, Alert, BackHandler
- **AsyncStorage**: Complete mock for storage operations
- **Expo modules**: Local Authentication, Crypto, File System, Document Picker, Sharing
- **React Navigation**: Navigation hooks and components
- **Buffer**: For encryption tests
- **Console methods**: Cleaner test output

#### Example Mock Usage

```javascript
// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Expo Crypto mock
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algorithm, data) => 
    Promise.resolve('mocked-hash-' + data.slice(0, 10))
  ),
}));
```

## Test Structure

### Directory Organization

```
PinVault/
├── __tests__/
│   ├── components/           # Component tests
│   │   └── backup/          # Backup component tests
│   ├── contexts/            # Context provider tests  
│   ├── utils/               # Utility function tests
│   └── integration/         # Integration tests
├── jest/
│   ├── setup.js            # Global test setup
│   └── __mocks__/          # Mock files
│       └── fileMock.js     # Asset file mock
└── jest.config.js          # Jest configuration
```

### Test Categories

#### 1. Unit Tests

**Location**: `__tests__/utils/`

Test individual functions and utilities in isolation.

```javascript
// Example: Storage utility test
import { saveGrid, getGrids } from '../../utils/storage';

describe('Storage Utils', () => {
  it('should save grid successfully', async () => {
    const gridData = { id: '1', name: 'Test', grid: [] };
    const result = await saveGrid(gridData);
    expect(result).toBe(true);
  });
});
```

#### 2. Component Tests

**Location**: `__tests__/components/`

Test React components in isolation with proper mocking.

```javascript
// Example: Component test
import { render, fireEvent } from '@testing-library/react-native';
import PasswordInput from '../../../components/backup/PasswordInput';

describe('PasswordInput Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <PasswordInput visible={true} onSubmit={jest.fn()} />
    );
    expect(getByText('Enter Password')).toBeTruthy();
  });
});
```

#### 3. Context Tests

**Location**: `__tests__/contexts/`

Test React context providers and custom hooks.

```javascript
// Example: Context test
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

describe('ThemeContext', () => {
  it('should provide theme functionality', () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      return <Button onPress={toggleTheme} title={theme.name} />;
    };
    
    const { getByText } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(getByText('light')).toBeTruthy();
  });
});
```

#### 4. Integration Tests

**Location**: `__tests__/integration/`

Test complete workflows and feature interactions.

```javascript
// Example: Integration test
describe('Backup/Restore Integration', () => {
  it('should maintain data integrity through backup/restore cycle', async () => {
    const originalData = [/* test data */];
    
    // Create backup
    const backupResult = await createLocalBackup('password');
    expect(backupResult.success).toBe(true);
    
    // Restore backup
    const restoreResult = await restoreFromBackup(
      backupResult.filePath, 
      'password'
    );
    expect(restoreResult.success).toBe(true);
  });
});
```

#### 5. Backward Compatibility Tests

**Location**: `__tests__/integration/backwardCompatibility.test.js`

Test compatibility with legacy backup formats and cross-device scenarios.

```javascript
// Example: Legacy format test
describe('Legacy Backup Support', () => {
  it('should restore v1.2.0 backup format', async () => {
    const legacyBackup = v12BackupFixture;
    
    const result = await restoreFromBackup(
      legacyBackup,
      'password',
      { replaceAll: true }
    );
    
    expect(result.success).toBe(true);
    expect(result.version).toBe('1.2.0');
    expect(result.migrated).toBe(true);
  });
  
  it('should handle iOS to Android migration', async () => {
    const iosBackup = createiOSBackup();
    
    // Simulate Android environment
    const result = await restoreOnAndroid(iosBackup, 'password');
    
    expect(result.success).toBe(true);
    expect(result.crossPlatform).toBe(true);
  });
});
```

## Running Tests

### Available Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Update test snapshots
npm run test:update-snapshots

# Clear Jest cache
npm run test:clear-cache
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test -- __tests__/utils/storage.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should save"

# Run tests for a specific directory
npm test -- __tests__/components/

# Run tests with verbose output
npm test -- --verbose
```

### Debugging Tests

```bash
# Run tests with debugging information
npm test -- --verbose --no-cache

# Run a single test file with maximum verbosity
npm test -- __tests__/utils/storage.test.js --verbose --no-coverage
```

## Writing Tests

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```javascript
describe('Feature or Component', () => {
  // Setup for all tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something specific', async () => {
    // Arrange: Set up test data and mocks
    const mockData = { id: '1', name: 'test' };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

    // Act: Execute the function being tested
    const result = await functionUnderTest(mockData);

    // Assert: Verify the results
    expect(result).toBe(expectedValue);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('expectedKey');
  });
});
```

### Testing Async Functions

```javascript
it('should handle async operations', async () => {
  const promise = asyncFunction();
  await expect(promise).resolves.toBe(expectedValue);
  
  // Or for errors
  await expect(promise).rejects.toThrow('Expected error message');
});
```

### Testing React Components

```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

it('should handle user interactions', async () => {
  const onPress = jest.fn();
  const { getByText, getByTestId } = render(
    <Button onPress={onPress} testID="submit-button" />
  );

  fireEvent.press(getByTestId('submit-button'));
  
  await waitFor(() => {
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Testing with Context

```javascript
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

it('should use theme context', () => {
  const { getByText } = renderWithTheme(
    <ComponentThatUsesTheme />
  );
  expect(getByText('themed content')).toBeTruthy();
});
```

## Mocking

### Mock External Dependencies

```javascript
// Mock the entire module
jest.mock('expo-file-system', () => ({
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('file content')),
  documentDirectory: 'file://mocked-directory/',
}));

// Mock specific functions
import * as FileSystem from 'expo-file-system';
FileSystem.writeAsStringAsync.mockResolvedValue();
```

### Mock React Native Components

```javascript
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
}));
```

### Mock Custom Modules

```javascript
// Mock utility functions
jest.mock('../../utils/storage', () => ({
  saveGrid: jest.fn(() => Promise.resolve(true)),
  getGrids: jest.fn(() => Promise.resolve([])),
}));
```

### Restore Mocks

```javascript
beforeEach(() => {
  jest.clearAllMocks(); // Clear call history
  jest.restoreAllMocks(); // Restore original implementations
});
```

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain what is being tested
- **Follow consistent naming patterns**

```javascript
describe('UserAuthentication', () => {
  describe('when user provides valid credentials', () => {
    it('should authenticate successfully', () => {
      // test implementation
    });
  });

  describe('when user provides invalid credentials', () => {
    it('should reject authentication', () => {
      // test implementation
    });
  });
});
```

### 2. Test Data

- **Use factories** for creating test data
- **Keep test data minimal** and focused
- **Avoid shared mutable state** between tests

```javascript
const createMockGrid = (overrides = {}) => ({
  id: '1',
  name: 'Test Grid',
  grid: [],
  createdAt: '2023-01-01T00:00:00.000Z',
  ...overrides,
});
```

### 3. Assertions

- **Be specific** with assertions
- **Test both positive and negative cases**
- **Verify side effects** (function calls, state changes)

```javascript
// Good: Specific assertion
expect(result.success).toBe(true);
expect(result.data).toHaveLength(2);

// Better: Multiple specific assertions
expect(result).toEqual({
  success: true,
  data: expect.arrayContaining([
    expect.objectContaining({ id: '1' })
  ])
});
```

### 4. Error Testing

- **Test error conditions** explicitly
- **Verify error messages** are meaningful
- **Test error recovery** mechanisms

```javascript
it('should handle network errors gracefully', async () => {
  AsyncStorage.getItem.mockRejectedValue(new Error('Network error'));
  
  const result = await saveGrid(mockData);
  
  expect(result).toBe(false);
  expect(console.error).toHaveBeenCalledWith(
    'Error saving grid:', 
    expect.any(Error)
  );
});
```

### 5. Component Testing

- **Test user interactions** not implementation details
- **Use semantic queries** (`getByRole`, `getByLabelText`)
- **Test accessibility** features

```javascript
it('should be accessible', () => {
  const { getByRole } = render(<Button title="Submit" />);
  
  const button = getByRole('button');
  expect(button).toHaveAccessibilityLabel('Submit');
});
```

## Coverage

### Coverage Reports

Generate coverage reports to identify untested code:

```bash
npm run test:coverage
```

This generates:
- **Terminal output**: Summary of coverage percentages
- **HTML report**: `coverage/lcov-report/index.html`
- **LCOV file**: `coverage/lcov.info` for CI integration

### Coverage Thresholds

The project maintains these minimum coverage requirements:

- **Branches**: 70%
- **Functions**: 70% 
- **Lines**: 70%
- **Statements**: 70%

### Interpreting Coverage

- **Lines**: Percentage of executable lines covered
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches taken
- **Statements**: Percentage of statements executed

### Improving Coverage

1. **Identify uncovered areas** in the HTML report
2. **Write tests** for missing scenarios
3. **Focus on critical paths** first
4. **Test error conditions** and edge cases

## Troubleshooting

### Common Issues

#### 1. Module Not Found Errors

```
Cannot find module '@expo/something'
```

**Solution**: Add mock to `jest/setup.js`:

```javascript
jest.mock('@expo/something', () => ({
  functionName: jest.fn(),
}));
```

#### 2. Async Test Timeout

```
Timeout - Async callback was not invoked within timeout
```

**Solution**: Increase timeout or fix async handling:

```javascript
// Increase timeout
jest.setTimeout(10000);

// Fix async handling
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 5000 });
```

#### 3. React Native Component Errors

```
TypeError: Cannot read property 'create' of undefined
```

**Solution**: Ensure React Native components are properly mocked:

```javascript
jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn(() => ({})),
  },
  View: 'View',
  Text: 'Text',
}));
```

#### 4. Context Provider Errors

```
useTheme must be used within a ThemeProvider
```

**Solution**: Wrap components with necessary providers:

```javascript
const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        {component}
      </AuthProvider>
    </ThemeProvider>
  );
};
```

### Debug Mode

Run tests in debug mode for detailed information:

```bash
# Node.js debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose --no-cache
```

### Performance Issues

If tests are slow:

1. **Use `--runInBand`** for sequential execution
2. **Clear Jest cache**: `npm run test:clear-cache`
3. **Reduce mock complexity**
4. **Split large test files**

### File Watch Issues

If watch mode doesn't work:

```bash
# Force polling
npm test -- --watch --watchman=false

# Clear cache and restart
npm run test:clear-cache && npm run test:watch
```

## Continuous Integration

### Running Tests in CI

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test -- --coverage --watchAll=false
      - uses: codecov/codecov-action@v1
        with:
          file: ./coverage/lcov.info
```

### Coverage Reporting

Integrate with coverage services like Codecov or Coveralls for tracking coverage over time.

## Backward Compatibility Testing

### Why Backward Compatibility Matters

PIN Vault users rely on being able to restore their data across:
- **App updates** (v1.2 → v1.6)
- **Device changes** (iPhone → Android)
- **Platform migrations** (iOS 15 → iOS 17)
- **Emergency recovery** (old backup files)

### What We Test

#### 1. Legacy Backup Formats

- **v1.2.0**: Simple JSON structure with basic grid arrays
- **v1.3.0**: Introduction of encryption and device metadata
- **v1.4.0**: Enhanced security with auth settings
- **v1.5.0**: Full metadata and compatibility info
- **Future versions**: Forward compatibility with warnings

#### 2. Cross-Platform Scenarios

- **iOS → Android**: Device-specific settings migration
- **Android → iOS**: Platform feature compatibility
- **Different OS versions**: API compatibility
- **Hardware differences**: Biometric availability

#### 3. Data Format Evolution

- **Array to object migration**: Storage format changes
- **Cell format evolution**: Simple numbers to rich objects
- **Authentication migration**: Biometric preferences
- **Theme and UI preferences**: Cross-device settings

### Test Fixtures

The test suite includes realistic backup examples:

```javascript
import { 
  v12Backup,
  v13Backup, 
  v14Backup,
  v15Backup,
  iosBackup,
  androidBackup,
  corruptedBackup
} from '../fixtures/legacyBackups';

// Test with real legacy data
it('should restore v1.3 iOS backup on Android', async () => {
  const result = await restoreFromBackup(
    JSON.stringify(v13Backup),
    'testPassword',
    { replaceAll: true }
  );
  
  expect(result.success).toBe(true);
  expect(result.warnings).toContain('cross-platform');
});
```

### Migration Testing Strategy

1. **Version Boundaries**: Test exact version transitions
2. **Data Integrity**: Verify no data loss during migration
3. **Error Handling**: Graceful degradation for incompatible features
4. **Performance**: Large legacy backups should restore efficiently
5. **User Experience**: Clear warnings and migration feedback

### Running Backward Compatibility Tests

```bash
# Run all backward compatibility tests
npm test -- __tests__/integration/backwardCompatibility.test.js

# Test specific legacy version
npm test -- --testNamePattern="v1.2.0"

# Test cross-platform scenarios
npm test -- --testNamePattern="iOS.*Android"

# Performance test with large legacy backup
npm test -- --testNamePattern="large legacy"
```

---

## Summary

The PIN Vault testing infrastructure provides:

- **Comprehensive mocking** for React Native and Expo modules
- **Multiple test types** (unit, component, context, integration)
- **Coverage reporting** with configurable thresholds
- **Developer-friendly** tooling with watch mode and debugging
- **CI/CD integration** support

Follow the patterns and practices outlined in this guide to maintain high-quality, reliable tests that support confident development and refactoring.

---

*For questions about testing, refer to this guide or check the test files for examples of specific patterns.*