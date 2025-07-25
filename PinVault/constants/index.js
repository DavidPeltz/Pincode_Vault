/**
 * @fileoverview Application constants and configuration values
 *
 * Centralizes magic numbers, configuration values, and commonly used constants
 * across the PIN Vault application for better maintainability and consistency.
 */

/**
 * Grid-related constants
 */
export const GRID_CONSTANTS = {
  /** Number of cells in the grid (8 columns × 5 rows) */
  TOTAL_CELLS: 40,

  /** Number of columns in the grid */
  COLUMNS: 8,

  /** Number of rows in the grid */
  ROWS: 5,

  /** Available grid cell colors */
  COLORS: ['red', 'blue', 'green', 'yellow'],

  /** Number of cells per color (evenly distributed) */
  CELLS_PER_COLOR: 10,

  /** Maximum grid width for responsive design */
  MAX_GRID_WIDTH: 320,

  /** Grid padding from screen edges */
  GRID_PADDING: 40,
};

/**
 * Authentication and security constants
 */
export const AUTH_CONSTANTS = {
  /** Default authentication prompt message */
  DEFAULT_AUTH_REASON: 'Please authenticate to access PIN editing',

  /** Authentication timeout in milliseconds */
  AUTH_TIMEOUT: 30000,

  /** Number of rounds for key derivation (PBKDF2-like) */
  KEY_DERIVATION_ROUNDS: 10000,
};

/**
 * UI timing and animation constants
 */
export const TIMING_CONSTANTS = {
  /** Auto-submit delay for digit selection (milliseconds) */
  AUTO_SUBMIT_DELAY: 300,

  /** Keyboard dismiss delay for Android (milliseconds) */
  KEYBOARD_DISMISS_DELAY_ANDROID: 50,

  /** Modal focus delay for Android (milliseconds) */
  MODAL_FOCUS_DELAY_ANDROID: 250,

  /** Modal focus delay for iOS (milliseconds) */
  MODAL_FOCUS_DELAY_IOS: 100,

  /** Scroll update debounce delay (milliseconds) */
  SCROLL_UPDATE_DEBOUNCE: 100,

  /** Swipe gesture timeout (milliseconds) */
  SWIPE_TIMEOUT: 300,
};

/**
 * File and storage constants
 */
export const STORAGE_CONSTANTS = {
  /** AsyncStorage key for PIN grids */
  GRIDS_STORAGE_KEY: 'PIN_GRIDS',

  /** AsyncStorage key for theme preference */
  THEME_STORAGE_KEY: 'theme_preference',

  /** Backup file extension */
  BACKUP_FILE_EXTENSION: '.pvb',

  /** Backup file header prefix */
  BACKUP_FILE_HEADER: 'PINVAULT_BACKUP_V',

  /** Maximum backup file size (bytes) */
  MAX_BACKUP_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

/**
 * UI dimension constants
 */
export const UI_CONSTANTS = {
  /** Standard button height */
  BUTTON_HEIGHT: 44,

  /** Standard button border radius */
  BUTTON_BORDER_RADIUS: 22,

  /** Modal border radius */
  MODAL_BORDER_RADIUS: 15,

  /** Card border radius */
  CARD_BORDER_RADIUS: 12,

  /** Standard padding size */
  STANDARD_PADDING: 20,

  /** Small padding size */
  SMALL_PADDING: 10,

  /** Large padding size */
  LARGE_PADDING: 25,

  /** Header icon size */
  HEADER_ICON_SIZE: 44,

  /** Standard elevation for Android */
  STANDARD_ELEVATION: 3,

  /** High elevation for modals */
  MODAL_ELEVATION: 10,
};

/**
 * Typography constants
 */
export const TYPOGRAPHY_CONSTANTS = {
  /** Large title font size */
  TITLE_LARGE: 24,

  /** Medium title font size */
  TITLE_MEDIUM: 20,

  /** Small title font size */
  TITLE_SMALL: 18,

  /** Body text font size */
  BODY: 16,

  /** Small text font size */
  SMALL: 14,

  /** Caption text font size */
  CAPTION: 12,

  /** PIN display font size */
  PIN_DISPLAY: 24,

  /** Grid cell font size */
  GRID_CELL: 18,

  /** PIN cell font size (highlighted) */
  PIN_CELL: 20,
};

/**
 * Animation and gesture constants
 */
export const GESTURE_CONSTANTS = {
  /** Minimum swipe distance for navigation */
  MIN_SWIPE_DISTANCE: 250,

  /** Minimum velocity for power gestures */
  MIN_POWER_SWIPE_VELOCITY: 4.0,

  /** Touch opacity for buttons */
  BUTTON_ACTIVE_OPACITY: 0.7,

  /** Ripple color opacity for Android */
  RIPPLE_OPACITY_LIGHT: 0.1,
  RIPPLE_OPACITY_DARK: 0.2,
};

/**
 * Validation constants
 */
export const VALIDATION_CONSTANTS = {
  /** Minimum grid name length */
  MIN_GRID_NAME_LENGTH: 1,

  /** Maximum grid name length */
  MAX_GRID_NAME_LENGTH: 50,

  /** Minimum password length for backups */
  MIN_BACKUP_PASSWORD_LENGTH: 1,

  /** Maximum password length for backups */
  MAX_BACKUP_PASSWORD_LENGTH: 128,

  /** Valid PIN digit range */
  MIN_PIN_DIGIT: 0,
  MAX_PIN_DIGIT: 9,
};

/**
 * Version and compatibility constants
 */
export const VERSION_CONSTANTS = {
  /** Current app version */
  CURRENT_VERSION: '1.6.0',

  /** Supported backup versions */
  SUPPORTED_BACKUP_VERSIONS: ['1.2.0', '1.3.0', '1.4.0', '1.5.0', '1.6.0'],

  /** Minimum supported backup version */
  MIN_BACKUP_VERSION: '1.2.0',

  /** Current backup format version */
  BACKUP_FORMAT_VERSION: '1.5',
};

/**
 * Error messages and user feedback
 */
export const MESSAGES = {
  /** Success messages */
  SUCCESS: {
    GRID_SAVED: 'Grid saved successfully!',
    BACKUP_CREATED: 'Backup created successfully!',
    BACKUP_RESTORED: 'Backup restored successfully!',
    GRID_DELETED: 'Grid deleted successfully!',
  },

  /** Error messages */
  ERRORS: {
    AUTH_REQUIRED: 'Authentication is required to proceed',
    AUTH_NOT_AVAILABLE: 'Device authentication is not available',
    INVALID_PASSWORD: 'Invalid password or corrupted backup file',
    NETWORK_ERROR: 'Network connection error',
    STORAGE_ERROR: 'Unable to save data',
    INVALID_INPUT: 'Please enter a valid value',
    FILE_TOO_LARGE: 'File is too large to process',
    UNSUPPORTED_VERSION: 'Unsupported backup version',
  },

  /** Warning messages */
  WARNINGS: {
    DELETE_CONFIRMATION: 'This action cannot be undone',
    REPLACE_ALL_GRIDS: 'This will permanently delete all your current grids',
    OVERWRITE_EXISTING: 'Existing grids with matching names will be replaced',
    AUTHENTICATION_SETUP: 'Please set up device authentication for enhanced security',
  },

  /** Info messages */
  INFO: {
    EMPTY_STATE: 'No grids found. Create your first PIN grid to get started.',
    BACKUP_COMPATIBILITY: 'Backups are compatible across devices with the same password',
    SECURITY_NOTICE: 'Your data is encrypted and stored locally on your device',
  },
};

/**
 * Development and debugging constants
 */
export const DEBUG_CONSTANTS = {
  /** Enable debug logging */
  ENABLE_DEBUG_LOGS: __DEV__,

  /** Enable performance monitoring */
  ENABLE_PERFORMANCE_MONITORING: __DEV__,

  /** Mock authentication in development */
  MOCK_AUTH_IN_DEV: false,

  /** Skip encryption in development (for testing only) */
  SKIP_ENCRYPTION_IN_DEV: false,
};

/**
 * Default configurations
 */
export const DEFAULT_CONFIG = {
  /** Default theme mode */
  DEFAULT_THEME_MODE: 'light',

  /** Default restore options */
  DEFAULT_RESTORE_OPTIONS: {
    replaceAll: false,
    overwriteExisting: false,
  },

  /** Default grid configuration */
  DEFAULT_GRID_CONFIG: {
    showValues: true,
    showPinHighlight: true,
    isEditable: true,
  },
};

/**
 * Platform-specific constants
 */
export const PLATFORM_CONSTANTS = {
  /** Android-specific configurations */
  ANDROID: {
    KEYBOARD_DISMISS_DELAY: TIMING_CONSTANTS.KEYBOARD_DISMISS_DELAY_ANDROID,
    MODAL_FOCUS_DELAY: TIMING_CONSTANTS.MODAL_FOCUS_DELAY_ANDROID,
    RIPPLE_COLOR_LIGHT: `rgba(0,0,0,${GESTURE_CONSTANTS.RIPPLE_OPACITY_LIGHT})`,
    RIPPLE_COLOR_DARK: `rgba(255,255,255,${GESTURE_CONSTANTS.RIPPLE_OPACITY_DARK})`,
  },

  /** iOS-specific configurations */
  IOS: {
    MODAL_FOCUS_DELAY: TIMING_CONSTANTS.MODAL_FOCUS_DELAY_IOS,
    NAVIGATION_BAR_HEIGHT: 44,
    TAB_BAR_HEIGHT: 49,
  },
};
