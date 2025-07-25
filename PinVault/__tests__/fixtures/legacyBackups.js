/**
 * Test fixtures containing realistic legacy backup file formats
 * These represent actual backup structures from different PIN Vault versions
 */

// v1.2.0 backup format (early version, simple JSON structure)
export const v12Backup = {
  version: '1.2.0',
  exportDate: '2023-01-15T10:30:00.000Z',
  appVersion: '1.2.0',
  grids: [
    {
      id: 'chase_credit_2023',
      name: 'Chase Credit Card',
      dateCreated: '2023-01-10T14:20:00.000Z',
      gridData: [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
      ],
      pinSequence: [1, 2, 3, 4] // Stored as simple array
    },
    {
      id: 'bank_debit_2023',
      name: 'Bank Debit Card',
      dateCreated: '2023-01-12T09:15:00.000Z',
      gridData: [
        [9, 8, 7, 6, 5],
        [4, 3, 2, 1, 0],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
      ],
      pinSequence: [9, 8, 7, 6]
    }
  ]
};

// v1.3.0 backup format (introduced encryption and device info)
export const v13Backup = {
  version: '1.3.0',
  formatVersion: 2,
  created: '2023-06-20T16:45:00.000Z',
  deviceInfo: {
    platform: 'ios',
    osVersion: '16.0',
    deviceModel: 'iPhone 13',
    appVersion: '1.3.0'
  },
  encryption: {
    algorithm: 'XOR',
    saltLength: 16,
    iterations: 5000
  },
  metadata: {
    totalGrids: 3,
    totalCells: 120,
    hasCustomColors: false
  },
  // This would be encrypted in real backup
  encryptedData: 'eyJncmlkcyI6W3siaWQiOiJjaGFzZV9jcmVkaXRfdjEzIiwibmFtZSI6IkNoYXNlIENyZWRpdCBDYXJkIiwiY3JlYXRlZEF0IjoiMjAyMy0wNi0xNVQxMDowMDowMC4wMDBaIiwidXBkYXRlZEF0IjoiMjAyMy0wNi0xNVQxMDowMDowMC4wMDBaIiwiZ3JpZCI6W3siaWQiOjAsInZhbHVlIjoxLCJjb2xvciI6ImJsdWUiLCJpc1BpbkRpZ2l0IjpmYWxzZX0seyJpZCI6MSwidmFsdWUiOjIsImNvbG9yIjoicmVkIiwiaXNQaW5EaWdpdCI6ZmFsc2V9XX1dfQ==',
  salt: 'randomSalt16Byte',
  checksum: 'sha256hash'
};

// v1.4.0 backup format (added theme and auth settings)
export const v14Backup = {
  version: '1.4.0',
  schemaVersion: 3,
  createdAt: '2023-09-10T14:30:00.000Z',
  lastModified: '2023-09-10T14:30:00.000Z',
  source: {
    platform: 'android',
    osVersion: '13',
    deviceBrand: 'Google',
    deviceModel: 'Pixel 7',
    appVersion: '1.4.0',
    buildNumber: '140'
  },
  security: {
    encryptionVersion: 2,
    algorithm: 'XOR-PBKDF2',
    keyDerivation: {
      algorithm: 'PBKDF2',
      iterations: 10000,
      saltLength: 32
    }
  },
  settings: {
    theme: 'dark',
    authenticationEnabled: true,
    biometricType: 'fingerprint',
    requireAuthOnLaunch: true,
    autoLockTimeout: 300
  },
  data: {
    gridCount: 5,
    totalCells: 200,
    hasCustomNames: true,
    averageGridAge: 45 // days
  },
  payload: {
    salt: 'c29tZVJhbmRvbVNhbHQzMkJ5dGVzSGVyZQ==',
    encryptedData: 'ZXlKaGJHbGpaU0k2V3lKamFHRnpaVjlqY21Wa2FYUmZkalExSWl3aWJtRnRaU0k2SWtOb1lYTmxJRU55WldScGRDQkRZWEprSWl3aVkzSmxZWFJsWkVGMElqb2lNakF5TXkwd09TMHhNRlF4TkRvek1Eb3dNQzR3TURCYUlpd2lkWEJrWVhSbFpFRjBJam9pTWpBeU15MHdPUzB4TUZReE5Eb3pNRG93TUM0d01EQmFJaXdpWjNKcFpDSTZXM3NpYVdRaU9qQXNJblpoYkhWbElqb3hMQ0pqYjJ4dmNpSTZJbUpzZFdVaUxDSnBjMUJwYmtScFoybDBJam9tWm1Gc2MyVjldUT09',
    integrity: 'sha256:abcd1234567890abcdef'
  }
};

// v1.5.0 backup format (current format with full metadata)
export const v15Backup = {
  version: '1.5.0',
  format: 'PIN_VAULT_BACKUP_V4',
  timestamp: '2024-01-20T11:15:30.000Z',
  generator: {
    appName: 'PIN Vault',
    appVersion: '1.5.0',
    platform: 'ios',
    platformVersion: '17.0',
    device: {
      model: 'iPhone 15 Pro',
      identifier: 'iPhone16,1',
      systemName: 'iOS'
    }
  },
  encryption: {
    version: 3,
    algorithm: 'XOR-Enhanced',
    keyDerivation: {
      method: 'PBKDF2-SHA256',
      iterations: 15000,
      saltLength: 64
    },
    integrity: {
      algorithm: 'HMAC-SHA256',
      includesMetadata: true
    }
  },
  metadata: {
    statistics: {
      totalGrids: 8,
      totalActiveCells: 186,
      oldestGrid: '2023-01-15T10:30:00.000Z',
      newestGrid: '2024-01-19T16:20:00.000Z'
    },
    features: {
      hasCustomColors: true,
      hasBiometricAuth: true,
      hasCustomThemes: true,
      hasBackupEncryption: true
    },
    userPreferences: {
      defaultTheme: 'system',
      gridSize: '8x5',
      authRequired: true,
      biometricType: 'faceId'
    }
  },
  compatibility: {
    minimumAppVersion: '1.2.0',
    recommendedAppVersion: '1.5.0',
    supportedPlatforms: ['ios', 'android'],
    migrationRequired: false
  },
  content: {
    format: 'encrypted',
    compression: 'none',
    salt: 'YWJjZGVmZ2hpams…bGFzZGZqaGFza2xkZmpoa…Wxhc2RmanNrbGRmanNrbGRmanNrbGFzZGZqaGts',
    data: 'ZXlKbmNtbGtjeUk2VzNzaWFXUWlPaUpqYUdGelpWOWpjbVZrYVhSZmRqRTJJaXdpYm1GdFpTSTZJa05vWVhObElFTnlaV1JwZENCRFlYSmtJaXdpWTNKbFlYUmxaRUYwSWpvaU1qQXlOQzB3TVMweU1GUXhNVG94TlRvek1DNHdNREJhSWl3aWRYQmtZWFJsWkVGMElqb2lNakF5TkMwd01TMHlNRlF4TVRveE5Ub3pNQzR3TURCYUlpd2laM0pwWkNJNlczc2lhV1FpT2pBc0luWmhiSFZsSWpveExDSmpiMnh2Y2lJNklpST0=',
    checksum: 'sha256:1a2b3c4d5e6f7890abcdef1234567890abcdef12'
  }
};

// Cross-platform backup examples
export const iosBackup = {
  ...v15Backup,
  generator: {
    ...v15Backup.generator,
    platform: 'ios',
    platformVersion: '17.2',
    device: {
      model: 'iPhone 15 Pro Max',
      identifier: 'iPhone16,2',
      systemName: 'iOS',
      idiom: 'phone'
    }
  },
  metadata: {
    ...v15Backup.metadata,
    userPreferences: {
      ...v15Backup.metadata.userPreferences,
      biometricType: 'faceId',
      hapticFeedback: true,
      soundEffects: false
    }
  }
};

export const androidBackup = {
  ...v15Backup,
  generator: {
    ...v15Backup.generator,
    platform: 'android',
    platformVersion: '14',
    device: {
      model: 'Pixel 8 Pro',
      manufacturer: 'Google',
      brand: 'google',
      systemName: 'Android'
    }
  },
  metadata: {
    ...v15Backup.metadata,
    userPreferences: {
      ...v15Backup.metadata.userPreferences,
      biometricType: 'fingerprint',
      navigationGestures: true,
      statusBarStyle: 'dark'
    }
  }
};

// Corrupted backup examples for error testing
export const corruptedBackup = {
  version: '1.4.0',
  timestamp: '2023-09-15T12:00:00.000Z',
  // Missing required fields
  // data: ... (missing)
  salt: 'invalid-salt',
  encryptedData: null // Invalid data
};

export const incompatibleBackup = {
  version: '2.0.0', // Future version
  newFormatVersion: 10,
  timestamp: '2025-01-01T00:00:00.000Z',
  futureFeatures: {
    quantumEncryption: true,
    aiGenerated: true
  },
  data: 'future-encrypted-format-not-supported'
};

// Large backup for performance testing
export const largeLegacyBackup = {
  version: '1.3.0',
  created: '2023-06-01T00:00:00.000Z',
  deviceInfo: {
    platform: 'ios',
    appVersion: '1.3.0'
  },
  grids: Array.from({ length: 50 }, (_, i) => ({
    id: `performance_test_grid_${i}`,
    name: `Test Grid ${i + 1}`,
    createdAt: `2023-0${(i % 9) + 1}-${String(i % 28 + 1).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00.000Z`,
    grid: Array.from({ length: 40 }, (_, j) => ({
      id: j,
      value: (i + j) % 10,
      color: ['red', 'blue', 'green', 'yellow'][j % 4],
      isPinDigit: j < 4 && i % 3 === 0
    }))
  }))
};

// Migration test data - old format to new format
export const migrationTestData = {
  // Very old format (hypothetical v1.0)
  v1_0: {
    app: 'PIN Vault',
    version: '1.0.0',
    date: '2022-12-01',
    cards: [ // Old terminology
      {
        name: 'Credit Card',
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], // Simple array
        pin: '1234' // Plain text pin (insecure)
      }
    ]
  },
  
  // Intermediate format (v1.1)
  v1_1: {
    version: '1.1.0',
    exported: '2023-01-01T00:00:00Z',
    items: [
      {
        id: 'item_1',
        title: 'My Card',
        grid: [
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9, 0]
        ], // 2D array introduced
        metadata: {
          created: '2023-01-01T00:00:00Z'
        }
      }
    ]
  }
};

// Test data for specific migration scenarios
export const migrationScenarios = {
  // Array to object storage format
  arrayToObjectMigration: {
    before: [
      { id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] },
      { id: '2', name: 'Grid 2', grid: [[5, 6], [7, 8]] }
    ],
    after: {
      '1': { id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] },
      '2': { id: '2', name: 'Grid 2', grid: [[5, 6], [7, 8]] }
    }
  },

  // Simple numbers to object cells
  numbersToObjectCells: {
    before: {
      id: 'test',
      name: 'Test Grid',
      grid: [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 0]
      ]
    },
    after: {
      id: 'test',
      name: 'Test Grid',
      grid: [
        { id: 0, value: 1, color: 'blue', isPinDigit: false },
        { id: 1, value: 2, color: 'red', isPinDigit: false },
        { id: 2, value: 3, color: 'green', isPinDigit: false },
        { id: 3, value: 4, color: 'yellow', isPinDigit: false },
        { id: 4, value: 5, color: 'blue', isPinDigit: false },
        { id: 5, value: 6, color: 'red', isPinDigit: false },
        { id: 6, value: 7, color: 'green', isPinDigit: false },
        { id: 7, value: 8, color: 'yellow', isPinDigit: false },
        { id: 8, value: 9, color: 'blue', isPinDigit: false },
        { id: 9, value: 0, color: 'red', isPinDigit: false }
      ]
    }
  }
};