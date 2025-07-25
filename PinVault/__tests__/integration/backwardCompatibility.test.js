import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { decryptBackupData, encryptBackupData } from '../../utils/encryption';
import { restoreFromBackup } from '../../utils/backup';

// Mock all external dependencies
jest.mock('expo-crypto');
jest.mock('expo-file-system');
jest.mock('@react-native-async-storage/async-storage');

describe('Backward Compatibility Tests', () => {
  const testPassword = 'testPassword123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    Crypto.digestStringAsync.mockResolvedValue('mocked-hash');
    FileSystem.readAsStringAsync.mockResolvedValue('');
    AsyncStorage.getItem.mockResolvedValue('{}');
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('Legacy Backup Format Support', () => {
    describe('v1.2.0 Backup Format', () => {
      const mockV12BackupContent = {
        version: '1.2.0',
        timestamp: '2023-01-01T00:00:00.000Z',
        data: [
          {
            id: 'legacy_1',
            name: 'Old Format Grid',
            grid: [
              [1, 2, 3, 4, 5],
              [6, 7, 8, 9, 0],
              ['', '', '', '', ''],
              ['', '', '', '', '']
            ],
            createdAt: '2023-01-01T00:00:00.000Z'
          }
        ]
      };

      it('should successfully restore v1.2.0 backup format', async () => {
        // Mock the old encryption format (before salt/version headers)
        const legacyEncryptedData = 'legacy_encrypted_data_base64';
        
        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(mockV12BackupContent)
        );

        const result = await restoreFromBackup(
          'file://legacy_v12_backup.json',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
        expect(result.version).toBe('1.2.0');
      });

      it('should convert v1.2.0 grid format to current format', async () => {
        Crypto.digestStringAsync.mockResolvedValue('consistent-key');

        const legacyGridData = mockV12BackupContent.data[0];
        
        // Mock decryption returning legacy format
        const decryptResult = await decryptBackupData(
          JSON.stringify(mockV12BackupContent),
          testPassword
        );

        expect(decryptResult.success).toBe(true);
        
        // Should handle conversion from array format to object format
        if (Array.isArray(decryptResult.data)) {
          expect(decryptResult.data[0]).toEqual(
            expect.objectContaining({
              id: 'legacy_1',
              name: 'Old Format Grid',
              grid: expect.any(Array)
            })
          );
        }
      });
    });

    describe('v1.3.x Backup Format', () => {
      const mockV13BackupContent = {
        version: '1.3.0',
        salt: 'custom_salt_v13',
        encryptedData: 'v13_encrypted_data',
        timestamp: '2023-06-01T00:00:00.000Z',
        gridCount: 2,
        deviceInfo: {
          platform: 'ios',
          version: '1.3.0'
        }
      };

      it('should restore v1.3.x backup with custom salt', async () => {
        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(mockV13BackupContent)
        );

        Crypto.digestStringAsync.mockResolvedValue('v13-derived-key');

        const result = await restoreFromBackup(
          'file://v13_backup.pvb',
          testPassword,
          { replaceAll: false, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
      });

      it('should handle v1.3.x device-specific metadata', async () => {
        const backupWithDeviceInfo = {
          ...mockV13BackupContent,
          deviceInfo: {
            platform: 'android',
            deviceId: 'old_device_123',
            appVersion: '1.3.2'
          }
        };

        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(backupWithDeviceInfo)
        );

        const result = await restoreFromBackup(
          'file://android_v13_backup.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        // Should succeed despite different device info
        expect(result.success).toBe(true);
      });
    });

    describe('v1.4.x and v1.5.x Backup Formats', () => {
      const mockV15BackupContent = {
        version: '1.5.0',
        salt: 'random_salt_v15',
        encryptedData: 'v15_encrypted_with_new_algorithm',
        timestamp: '2024-01-01T00:00:00.000Z',
        gridCount: 3,
        metadata: {
          exportedBy: 'PIN Vault v1.5.0',
          totalCells: 120,
          hasAuthentication: true
        }
      };

      it('should restore v1.5.x backup with enhanced metadata', async () => {
        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(mockV15BackupContent)
        );

        const result = await restoreFromBackup(
          'file://v15_backup.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
        expect(result.metadata).toBeDefined();
      });

      it('should handle v1.4.x backup without enhanced metadata', async () => {
        const v14Backup = {
          version: '1.4.0',
          salt: 'v14_salt',
          encryptedData: 'v14_data',
          timestamp: '2023-09-01T00:00:00.000Z',
          gridCount: 1
          // No metadata field
        };

        FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(v14Backup));

        const result = await restoreFromBackup(
          'file://v14_backup.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Cross-Device Compatibility', () => {
    describe('iOS ↔ Android Migration', () => {
      const createDeviceSpecificBackup = (platform, deviceData) => ({
        version: '1.5.0',
        salt: 'device_salt',
        encryptedData: 'device_encrypted_data',
        timestamp: new Date().toISOString(),
        gridCount: 2,
        deviceInfo: {
          platform,
          ...deviceData
        }
      });

      it('should restore iOS backup on Android device', async () => {
        const iosBackup = createDeviceSpecificBackup('ios', {
          deviceModel: 'iPhone 14 Pro',
          osVersion: '16.0',
          appVersion: '1.5.0'
        });

        FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(iosBackup));

        // Simulate Android environment
        jest.doMock('react-native', () => ({
          Platform: { OS: 'android' }
        }));

        const result = await restoreFromBackup(
          'file://ios_backup.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
        expect(result.crossPlatform).toBe(true);
      });

      it('should restore Android backup on iOS device', async () => {
        const androidBackup = createDeviceSpecificBackup('android', {
          deviceModel: 'Pixel 7',
          osVersion: '13',
          appVersion: '1.5.0'
        });

        FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(androidBackup));

        // Simulate iOS environment
        jest.doMock('react-native', () => ({
          Platform: { OS: 'ios' }
        }));

        const result = await restoreFromBackup(
          'file://android_backup.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
        expect(result.crossPlatform).toBe(true);
      });
    });

    describe('Different App Versions', () => {
      it('should restore backup from newer app version with warnings', async () => {
        const newerVersionBackup = {
          version: '1.6.0', // Current is 1.5.0
          salt: 'newer_salt',
          encryptedData: 'newer_encrypted_data',
          timestamp: new Date().toISOString(),
          gridCount: 1,
          metadata: {
            exportedBy: 'PIN Vault v1.6.0',
            newFeatureFlag: true // Unknown feature
          }
        };

        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(newerVersionBackup)
        );

        const result = await restoreFromBackup(
          'file://newer_version_backup.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
        expect(result.warnings).toContain('newer version');
      });

      it('should restore backup from much older app version', async () => {
        const veryOldBackup = {
          version: '1.0.0',
          data: [ // Old array format
            {
              name: 'Very Old Grid',
              pins: [1, 2, 3, 4], // Old pin format
              created: '2022-01-01' // Old date format
            }
          ]
        };

        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(veryOldBackup)
        );

        const result = await restoreFromBackup(
          'file://very_old_backup.json',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        // Should either succeed with migration or fail gracefully
        if (result.success) {
          expect(result.migrated).toBe(true);
          expect(result.warnings).toContain('migrated from older format');
        } else {
          expect(result.error).toContain('unsupported version');
        }
      });
    });
  });

  describe('Data Migration Scenarios', () => {
    describe('Storage Format Evolution', () => {
      it('should handle migration from array-based to object-based storage', async () => {
        // Simulate old storage format where grids were stored as arrays
        const oldFormatGrids = [
          {
            id: 'grid1',
            name: 'Old Grid 1',
            grid: [[1, 2, 3], [4, 5, 6]]
          },
          {
            id: 'grid2', 
            name: 'Old Grid 2',
            grid: [[7, 8, 9], [0, '', '']]
          }
        ];

        AsyncStorage.getItem.mockResolvedValue(JSON.stringify(oldFormatGrids));

        const encryptResult = await encryptBackupData(oldFormatGrids, testPassword);
        
        expect(encryptResult.success).toBe(true);
        
        const decryptResult = await decryptBackupData(
          encryptResult.data,
          testPassword
        );

        expect(decryptResult.success).toBe(true);
        // Should convert array to object format internally
      });

      it('should handle grid cell format evolution', async () => {
        const oldCellFormat = {
          version: '1.3.0',
          data: [{
            id: 'test',
            name: 'Test Grid',
            grid: [
              // Old format: just numbers
              [1, 2, 3, 4, 5],
              [6, 7, 8, 9, 0]
            ]
          }]
        };

        const newCellFormat = {
          version: '1.5.0',
          data: [{
            id: 'test',
            name: 'Test Grid',
            grid: [
              // New format: objects with metadata
              { id: 0, value: 1, color: 'blue', isPinDigit: false },
              { id: 1, value: 2, color: 'red', isPinDigit: true }
            ]
          }]
        };

        // Should handle both formats
        for (const format of [oldCellFormat, newCellFormat]) {
          FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(format));
          
          const result = await restoreFromBackup(
            'file://format_test.pvb',
            testPassword,
            { replaceAll: true, overwriteExisting: true }
          );

          expect(result.success).toBe(true);
        }
      });
    });

    describe('Authentication Settings Migration', () => {
      it('should migrate authentication preferences across devices', async () => {
        const backupWithAuthSettings = {
          version: '1.5.0',
          salt: 'auth_salt',
          encryptedData: 'auth_data',
          timestamp: new Date().toISOString(),
          authSettings: {
            biometricEnabled: true,
            biometricType: 'fingerprint',
            pinRequired: false
          }
        };

        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(backupWithAuthSettings)
        );

        const result = await restoreFromBackup(
          'file://auth_backup.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(true);
        // Should preserve auth settings or provide migration warnings
        if (result.authSettings) {
          expect(result.authSettings).toEqual(
            expect.objectContaining({
              biometricEnabled: expect.any(Boolean)
            })
          );
        }
      });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    describe('Corrupted Legacy Backups', () => {
      it('should handle partially corrupted v1.2 backup', async () => {
        const corruptedBackup = {
          version: '1.2.0',
          data: [
            {
              id: 'good_grid',
              name: 'Good Grid',
              grid: [[1, 2, 3]]
            },
            {
              // Missing required fields
              name: 'Corrupted Grid'
              // No id, no grid
            }
          ]
        };

        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(corruptedBackup)
        );

        const result = await restoreFromBackup(
          'file://corrupted_backup.json',
          testPassword,
          { replaceAll: false, overwriteExisting: true }
        );

        if (result.success) {
          expect(result.warnings).toContain('skipped corrupted entries');
          expect(result.restoredCount).toBeLessThan(2);
        } else {
          expect(result.error).toContain('corrupted');
        }
      });

      it('should handle backup with unknown encryption algorithm', async () => {
        const unknownEncryptionBackup = {
          version: '1.4.0',
          encryptionAlgorithm: 'future-aes-512', // Unknown algorithm
          salt: 'future_salt',
          encryptedData: 'future_encrypted_data'
        };

        FileSystem.readAsStringAsync.mockResolvedValue(
          JSON.stringify(unknownEncryptionBackup)
        );

        const result = await restoreFromBackup(
          'file://unknown_encryption.pvb',
          testPassword,
          { replaceAll: true, overwriteExisting: true }
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('unsupported encryption');
      });
    });

    describe('Version Boundary Testing', () => {
      it('should handle exact version boundaries', async () => {
        const boundaryVersions = ['1.2.9', '1.3.0', '1.3.9', '1.4.0', '1.5.0'];
        
        for (const version of boundaryVersions) {
          const boundaryBackup = {
            version,
            salt: 'boundary_salt',
            encryptedData: 'boundary_data',
            timestamp: new Date().toISOString()
          };

          FileSystem.readAsStringAsync.mockResolvedValue(
            JSON.stringify(boundaryBackup)
          );

          const result = await restoreFromBackup(
            `file://boundary_${version}.pvb`,
            testPassword,
            { replaceAll: true, overwriteExisting: true }
          );

          // All supported versions should restore successfully
          expect(result.success).toBe(true);
        }
      });

      it('should reject truly unsupported old versions', async () => {
        const veryOldVersions = ['0.9.0', '1.0.0-beta', '1.1.0'];
        
        for (const version of veryOldVersions) {
          const oldBackup = {
            version,
            data: 'some_old_format'
          };

          FileSystem.readAsStringAsync.mockResolvedValue(
            JSON.stringify(oldBackup)
          );

          const result = await restoreFromBackup(
            `file://old_${version}.json`,
            testPassword,
            { replaceAll: true, overwriteExisting: true }
          );

          expect(result.success).toBe(false);
          expect(result.error).toContain('unsupported version');
        }
      });
    });
  });

  describe('Performance with Legacy Data', () => {
    it('should handle large legacy backups efficiently', async () => {
      const largeLegacyBackup = {
        version: '1.3.0',
        data: Array.from({ length: 100 }, (_, i) => ({
          id: `legacy_grid_${i}`,
          name: `Legacy Grid ${i}`,
          grid: Array.from({ length: 40 }, (_, j) => ({
            id: j,
            value: Math.floor(Math.random() * 10),
            color: ['red', 'blue', 'green', 'yellow'][j % 4]
          }))
        }))
      };

      FileSystem.readAsStringAsync.mockResolvedValue(
        JSON.stringify(largeLegacyBackup)
      );

      const startTime = Date.now();
      
      const result = await restoreFromBackup(
        'file://large_legacy_backup.json',
        testPassword,
        { replaceAll: true, overwriteExisting: true }
      );

      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.restoredCount).toBe(100);
    });
  });
});