// Note: @testing-library/react-native v12.4+ includes matchers by default

// Suppress React Native warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('React Native') || args[0].includes('Animated'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return Object.setPrototypeOf(
    {
      Platform: {
        OS: 'ios',
        select: jest.fn(),
      },
      Dimensions: {
        get: jest.fn(() => ({ width: 375, height: 812 })),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      Alert: {
        alert: jest.fn(),
      },
      BackHandler: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        exitApp: jest.fn(),
      },
    },
    RN
  );
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2])),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
  },
}));

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algorithm, data) => 
    Promise.resolve('mocked-hash-' + data.slice(0, 10))
  ),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256',
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mocked-document-directory/',
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('mocked-file-content')),
  deleteAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => 
    Promise.resolve({
      type: 'success',
      uri: 'file://mocked-document.json',
      name: 'backup.json',
      size: 1024,
    })
  ),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock Buffer for encryption tests
global.Buffer = require('buffer').Buffer;

// Mock console methods for cleaner test output  
const originalConsoleError = console.error;
const testOriginalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = testOriginalConsoleWarn;
});

// Global test utilities
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Mock timers setup
jest.useFakeTimers();

// Default timeout for async operations in tests
jest.setTimeout(10000);