import * as Crypto from 'expo-crypto';
import {
  deriveKey,
  xorEncrypt,
  xorDecrypt,
  encryptBackupData,
  decryptBackupData,
} from '../../utils/encryption';

// Mock expo-crypto
jest.mock('expo-crypto');

describe('Encryption Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deriveKey', () => {
    it('should derive a key from password and salt', async () => {
      const mockHash = 'mocked-hash-password';
      Crypto.digestStringAsync.mockResolvedValue(mockHash);

      const password = 'testpassword';
      const salt = 'testsalt';
      const rounds = 1000;

      const result = await deriveKey(password, salt, rounds);

      expect(result).toBe(mockHash);
      expect(Crypto.digestStringAsync).toHaveBeenCalledTimes(rounds);
    });

    it('should perform specified number of rounds', async () => {
      Crypto.digestStringAsync.mockResolvedValue('hash');

      await deriveKey('password', 'salt', 5);

      expect(Crypto.digestStringAsync).toHaveBeenCalledTimes(5);
    });

    it('should handle crypto errors', async () => {
      Crypto.digestStringAsync.mockRejectedValue(new Error('Crypto error'));

      await expect(deriveKey('password', 'salt', 1)).rejects.toThrow('Crypto error');
    });
  });

  describe('xorEncrypt', () => {
    it('should encrypt data using XOR', () => {
      const data = 'Hello, World!';
      const key = 'secretkey';

      const encrypted = xorEncrypt(data, key);

      expect(encrypted).not.toBe(data);
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different output for different inputs', () => {
      const key = 'key';
      const data1 = 'message1';
      const data2 = 'message2';

      const encrypted1 = xorEncrypt(data1, key);
      const encrypted2 = xorEncrypt(data2, key);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty data', () => {
      const result = xorEncrypt('', 'key');
      expect(result).toBe('');
    });

    it('should handle empty key', () => {
      const result = xorEncrypt('data', '');
      expect(result).toBe('data');
    });
  });

  describe('xorDecrypt', () => {
    it('should decrypt XOR encrypted data', () => {
      const originalData = 'Hello, World!';
      const key = 'secretkey';

      const encrypted = xorEncrypt(originalData, key);
      const decrypted = xorDecrypt(encrypted, key);

      expect(decrypted).toBe(originalData);
    });

    it('should be symmetric with xorEncrypt', () => {
      const testCases = [
        'Simple text',
        'Text with 123 numbers!',
        'Special chars: @#$%^&*()',
        'Multi\nline\ntext',
        'Unicode: 🔐 🔑 🛡️',
      ];

      const key = 'testkey123';

      testCases.forEach(originalText => {
        const encrypted = xorEncrypt(originalText, key);
        const decrypted = xorDecrypt(encrypted, key);
        expect(decrypted).toBe(originalText);
      });
    });
  });

  describe('encryptBackupData', () => {
    it('should encrypt backup data successfully', async () => {
      const mockKey = 'derived-key';
      Crypto.digestStringAsync.mockResolvedValue(mockKey);

      const grids = [
        { id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] },
      ];
      const password = 'testpassword';

      const result = await encryptBackupData(grids, password);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.version).toBe('1.0');
      expect(result.data.salt).toBeDefined();
      expect(result.data.encryptedData).toBeDefined();
      expect(result.data.timestamp).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle encryption errors', async () => {
      Crypto.digestStringAsync.mockRejectedValue(new Error('Encryption failed'));

      const grids = [{ id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] }];
      const password = 'testpassword';

      const result = await encryptBackupData(grids, password);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Encryption failed');
    });

    it('should include metadata in encrypted backup', async () => {
      Crypto.digestStringAsync.mockResolvedValue('mock-key');

      const grids = [
        { id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] },
        { id: '2', name: 'Grid 2', grid: [[5, 6], [7, 8]] },
      ];
      const password = 'testpassword';

      const result = await encryptBackupData(grids, password);

      expect(result.data.version).toBe('1.0');
      expect(result.data.gridCount).toBe(2);
      expect(result.data.timestamp).toBeDefined();
      expect(new Date(result.data.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('decryptBackupData', () => {
    it('should decrypt backup data successfully', async () => {
      const mockKey = 'derived-key';
      Crypto.digestStringAsync.mockResolvedValue(mockKey);

      const originalGrids = [
        { id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] },
      ];

      // First encrypt the data
      const encrypted = await encryptBackupData(originalGrids, 'testpassword');
      
      // Then decrypt it
      const decrypted = await decryptBackupData(encrypted.data, 'testpassword');

      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toEqual(originalGrids);
      expect(decrypted.error).toBeNull();
    });

    it('should fail with wrong password', async () => {
      let callCount = 0;
      Crypto.digestStringAsync.mockImplementation(() => {
        callCount++;
        return Promise.resolve(callCount === 1 ? 'key1' : 'key2');
      });

      const originalGrids = [{ id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] }];
      
      const encrypted = await encryptBackupData(originalGrids, 'correctpassword');
      const decrypted = await decryptBackupData(encrypted.data, 'wrongpassword');

      expect(decrypted.success).toBe(false);
      expect(decrypted.data).toBeNull();
      expect(decrypted.error).toContain('Invalid backup data format');
    });

    it('should handle invalid backup format', async () => {
      const invalidBackup = {
        version: '1.0',
        salt: 'testsalt',
        encryptedData: 'invalid-json',
        timestamp: new Date().toISOString(),
      };

      const result = await decryptBackupData(invalidBackup, 'password');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Failed to decrypt backup data');
    });

    it('should handle missing required fields', async () => {
      const incompleteBackup = {
        version: '1.0',
        // Missing salt, encryptedData, timestamp
      };

      const result = await decryptBackupData(incompleteBackup, 'password');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Failed to decrypt backup data');
    });

    it('should handle unsupported backup versions', async () => {
      const futureVersionBackup = {
        version: '2.0',
        salt: 'testsalt',
        encryptedData: 'data',
        timestamp: new Date().toISOString(),
      };

      const result = await decryptBackupData(futureVersionBackup, 'password');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Unsupported backup version: 2.0');
    });

    it('should handle decryption errors', async () => {
      Crypto.digestStringAsync.mockRejectedValue(new Error('Decryption failed'));

      const backupData = {
        version: '1.0',
        salt: 'testsalt',
        encryptedData: 'data',
        timestamp: new Date().toISOString(),
      };

      const result = await decryptBackupData(backupData, 'password');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Decryption failed');
    });
  });

  describe('End-to-end encryption/decryption', () => {
    it('should maintain data integrity through encryption cycle', async () => {
      Crypto.digestStringAsync.mockResolvedValue('consistent-key');

      const originalData = [
        {
          id: '1',
          name: 'Test Grid',
          grid: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Another Grid',
          grid: [['', 1, ''], [2, '', 3]],
          createdAt: '2023-01-02T00:00:00.000Z',
        },
      ];

      const password = 'securepassword123';

      // Encrypt
      const encrypted = await encryptBackupData(originalData, password);
      expect(encrypted.success).toBe(true);

      // Decrypt
      const decrypted = await decryptBackupData(encrypted.data, password);
      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toEqual(originalData);
    });
  });
});