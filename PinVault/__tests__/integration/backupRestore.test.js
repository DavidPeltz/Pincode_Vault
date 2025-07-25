import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { saveGrid, getGrids } from '../../utils/storage';
import { encryptBackupData, decryptBackupData } from '../../utils/encryption';
import {
  createLocalBackup,
  createShareableBackup,
  restoreFromBackup,
} from '../../utils/backup';

// Mock all external dependencies
jest.mock('expo-crypto');
jest.mock('expo-file-system');
jest.mock('expo-document-picker');
jest.mock('@react-native-async-storage/async-storage');

describe('Backup/Restore Integration Tests', () => {
  const mockGrids = [
    {
      id: '1',
      name: 'Test Grid 1',
      grid: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Test Grid 2',
      grid: [['', 1, ''], [2, '', 3], ['', 4, '']],
      createdAt: '2023-01-02T00:00:00.000Z',
    },
  ];

  const mockPassword = 'testpassword123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    Crypto.digestStringAsync.mockResolvedValue('mocked-hash');
    FileSystem.writeAsStringAsync.mockResolvedValue();
    FileSystem.readAsStringAsync.mockResolvedValue('');
    DocumentPicker.getDocumentAsync.mockResolvedValue({
      type: 'success',
      uri: 'file://backup.json',
      name: 'backup.json',
    });
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockGrids));
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('Complete Backup Workflow', () => {
    it('should create local backup successfully', async () => {
      // Mock encrypted data
      const mockEncryptedData = {
        version: '1.0',
        salt: 'test-salt',
        encryptedData: 'encrypted-grids-data',
        timestamp: new Date().toISOString(),
        gridCount: 2,
      };

      // Mock the encryption process
      Crypto.digestStringAsync.mockResolvedValue('derived-key');

      const result = await createLocalBackup(mockPassword);

      expect(result.success).toBe(true);
      expect(result.filePath).toBeDefined();
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('savedGrids');
    });

    it('should create shareable backup successfully', async () => {
      const result = await createShareableBackup(mockPassword);

      expect(result.success).toBe(true);
      expect(result.filePath).toBeDefined();
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
    });

    it('should handle backup creation errors', async () => {
      FileSystem.writeAsStringAsync.mockRejectedValue(new Error('File write error'));

      const result = await createLocalBackup(mockPassword);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File write error');
    });
  });

  describe('Complete Restore Workflow', () => {
    it('should restore from backup successfully', async () => {
      // Setup mock backup file content
      const mockBackupContent = JSON.stringify({
        version: '1.0',
        salt: 'test-salt',
        encryptedData: 'encrypted-data',
        timestamp: new Date().toISOString(),
        gridCount: 2,
      });

      FileSystem.readAsStringAsync.mockResolvedValue(mockBackupContent);
      Crypto.digestStringAsync.mockResolvedValue('derived-key');

      // Mock the document picker to return a valid file
      DocumentPicker.getDocumentAsync.mockResolvedValue({
        type: 'success',
        uri: 'file://backup.json',
        name: 'backup.json',
      });

      // Mock the decryption to return original grids
      const decryptedData = JSON.stringify(mockGrids);
      
      const restoreOptions = {
        replaceAll: false,
        overwriteExisting: true,
      };

      const result = await restoreFromBackup(
        'file://backup.json',
        mockPassword,
        restoreOptions
      );

      expect(result.success).toBe(true);
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file://backup.json');
    });

    it('should handle invalid backup file format', async () => {
      FileSystem.readAsStringAsync.mockResolvedValue('invalid json');

      const result = await restoreFromBackup(
        'file://backup.json',
        mockPassword,
        { replaceAll: false, overwriteExisting: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid backup file format');
    });

    it('should handle wrong password during restore', async () => {
      const mockBackupContent = JSON.stringify({
        version: '1.0',
        salt: 'test-salt',
        encryptedData: 'encrypted-data',
        timestamp: new Date().toISOString(),
      });

      FileSystem.readAsStringAsync.mockResolvedValue(mockBackupContent);
      
      // Mock different keys for encryption and decryption (wrong password scenario)
      let callCount = 0;
      Crypto.digestStringAsync.mockImplementation(() => {
        callCount++;
        return Promise.resolve(callCount === 1 ? 'key1' : 'key2');
      });

      const result = await restoreFromBackup(
        'file://backup.json',
        'wrongpassword',
        { replaceAll: false, overwriteExisting: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('backup data');
    });
  });

  describe('End-to-End Backup and Restore', () => {
    it('should maintain data integrity through complete backup/restore cycle', async () => {
      // Use consistent mocking for encryption/decryption
      Crypto.digestStringAsync.mockResolvedValue('consistent-key');
      
      // Step 1: Create backup
      const backupResult = await createLocalBackup(mockPassword);
      expect(backupResult.success).toBe(true);

      // Capture what was written to the backup file
      const writeCall = FileSystem.writeAsStringAsync.mock.calls[0];
      const backupContent = writeCall[1];

      // Step 2: Mock reading the backup file for restore
      FileSystem.readAsStringAsync.mockResolvedValue(backupContent);

      // Step 3: Restore from backup
      const restoreResult = await restoreFromBackup(
        backupResult.filePath,
        mockPassword,
        { replaceAll: true, overwriteExisting: true }
      );

      expect(restoreResult.success).toBe(true);
      expect(restoreResult.restoredCount).toBe(mockGrids.length);
    });

    it('should handle restore with different options correctly', async () => {
      // Setup existing grids in storage
      const existingGrids = [
        {
          id: '1',
          name: 'Existing Grid',
          grid: [[9, 8, 7], [6, 5, 4], [3, 2, 1]],
          createdAt: '2023-01-03T00:00:00.000Z',
        },
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingGrids));
      Crypto.digestStringAsync.mockResolvedValue('consistent-key');

      // Create backup
      const backupResult = await createLocalBackup(mockPassword);
      const writeCall = FileSystem.writeAsStringAsync.mock.calls[0];
      const backupContent = writeCall[1];

      FileSystem.readAsStringAsync.mockResolvedValue(backupContent);

      // Test restore with replaceAll: false, overwriteExisting: false
      const restoreResult = await restoreFromBackup(
        backupResult.filePath,
        mockPassword,
        { replaceAll: false, overwriteExisting: false }
      );

      expect(restoreResult.success).toBe(true);
      // Should skip grid with id '1' since it exists and overwrite is false
    });

    it('should handle partial restore failures gracefully', async () => {
      const backupContent = JSON.stringify({
        version: '1.0',
        salt: 'test-salt',
        encryptedData: 'encrypted-data',
        timestamp: new Date().toISOString(),
      });

      FileSystem.readAsStringAsync.mockResolvedValue(backupContent);
      Crypto.digestStringAsync.mockResolvedValue('key');

      // Mock storage failure during restore
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      const result = await restoreFromBackup(
        'file://backup.json',
        mockPassword,
        { replaceAll: true, overwriteExisting: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage full');
    });
  });

  describe('Backup Metadata and Validation', () => {
    it('should include correct metadata in backup', async () => {
      Crypto.digestStringAsync.mockResolvedValue('key');

      const result = await createLocalBackup(mockPassword);
      expect(result.success).toBe(true);

      const writeCall = FileSystem.writeAsStringAsync.mock.calls[0];
      const backupContent = JSON.parse(writeCall[1]);

      expect(backupContent.version).toBe('1.0');
      expect(backupContent.gridCount).toBe(mockGrids.length);
      expect(backupContent.timestamp).toBeDefined();
      expect(backupContent.salt).toBeDefined();
      expect(backupContent.encryptedData).toBeDefined();
    });

    it('should validate backup file structure during restore', async () => {
      const invalidBackupContent = JSON.stringify({
        version: '1.0',
        // Missing required fields
      });

      FileSystem.readAsStringAsync.mockResolvedValue(invalidBackupContent);

      const result = await restoreFromBackup(
        'file://backup.json',
        mockPassword,
        { replaceAll: false, overwriteExisting: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid backup file structure');
    });

    it('should reject unsupported backup versions', async () => {
      const futureVersionBackup = JSON.stringify({
        version: '2.0',
        salt: 'salt',
        encryptedData: 'data',
        timestamp: new Date().toISOString(),
      });

      FileSystem.readAsStringAsync.mockResolvedValue(futureVersionBackup);

      const result = await restoreFromBackup(
        'file://backup.json',
        mockPassword,
        { replaceAll: false, overwriteExisting: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported backup version');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty grids during backup', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const result = await createLocalBackup(mockPassword);

      expect(result.success).toBe(true);
      
      const writeCall = FileSystem.writeAsStringAsync.mock.calls[0];
      const backupContent = JSON.parse(writeCall[1]);
      expect(backupContent.gridCount).toBe(0);
    });

    it('should handle file system errors during backup', async () => {
      FileSystem.writeAsStringAsync.mockRejectedValue(
        new Error('No space left on device')
      );

      const result = await createLocalBackup(mockPassword);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No space left on device');
    });

    it('should handle file system errors during restore', async () => {
      FileSystem.readAsStringAsync.mockRejectedValue(
        new Error('File not found')
      );

      const result = await restoreFromBackup(
        'file://nonexistent.json',
        mockPassword,
        { replaceAll: false, overwriteExisting: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });

    it('should handle malformed encrypted data', async () => {
      const backupWithBadEncryption = JSON.stringify({
        version: '1.0',
        salt: 'salt',
        encryptedData: 'definitely-not-valid-encrypted-data',
        timestamp: new Date().toISOString(),
      });

      FileSystem.readAsStringAsync.mockResolvedValue(backupWithBadEncryption);
      Crypto.digestStringAsync.mockResolvedValue('key');

      const result = await restoreFromBackup(
        'file://backup.json',
        mockPassword,
        { replaceAll: false, overwriteExisting: true }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to decrypt');
    });
  });
});