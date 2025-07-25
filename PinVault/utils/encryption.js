import { Buffer } from 'buffer';
import * as Crypto from 'expo-crypto';

/**
 * @fileoverview Encryption utilities for PIN Vault backup system
 * 
 * This module provides password-based encryption and decryption for backup files.
 * It uses a PBKDF2-like key derivation with multiple rounds and XOR encryption.
 * 
 * ⚠️ SECURITY NOTE: This implementation uses XOR encryption for demonstration.
 * In a production environment, consider using AES encryption for stronger security.
 */

/**
 * Version-specific salt constants for cross-device key derivation consistency
 * These salts ensure that the same password generates the same encryption key
 * across different devices and app versions.
 */
const BACKUP_SALT_V12 = 'pinvault-backup-v1.2-cross-device-salt-2025';
const BACKUP_SALT_V13 = 'pinvault-backup-v1.3-cross-device-salt-2025';
const BACKUP_SALT_V14 = 'pinvault-backup-v1.4-cross-device-salt-2025';
const BACKUP_SALT_V15 = 'pinvault-backup-v1.5-cross-device-salt-2025';

/**
 * Number of rounds for key derivation (PBKDF2-like implementation)
 * @constant {number}
 */
const KEY_DERIVATION_ROUNDS = 10000;

/**
 * Backup data structure returned by encryption
 * @typedef {Object} EncryptionResult
 * @property {boolean} success - Whether encryption was successful
 * @property {string} [encryptedData] - Base64 encoded encrypted data (if success)
 * @property {string} [timestamp] - ISO timestamp when backup was created (if success)
 * @property {string} [error] - Error message (if not success)
 */

/**
 * Decryption result structure
 * @typedef {Object} DecryptionResult
 * @property {boolean} success - Whether decryption was successful
 * @property {Object} [data] - Decrypted backup data (if success)
 * @property {string} [version] - Backup version (if success)
 * @property {string} [timestamp] - Original backup timestamp (if success)
 * @property {string} [error] - Error message (if not success)
 */

/**
 * Derives an encryption key from password and salt using PBKDF2-like approach
 * 
 * This function performs multiple rounds of SHA-256 hashing to strengthen
 * the password against brute-force attacks. The same password and salt
 * will always produce the same key, enabling cross-device compatibility.
 * 
 * @async
 * @function deriveKey
 * @param {string} password - User-provided password
 * @param {string} salt - Version-specific salt string
 * @returns {Promise<string>} Hex-encoded encryption key
 * 
 * @example
 * const key = await deriveKey('myPassword', BACKUP_SALT_V15);
 * console.log(key.length); // 64 (SHA-256 hex string)
 * 
 * @throws {Error} If hashing fails
 */
const deriveKey = async (password, salt) => {
  try {
    // Create a strong key by hashing password + salt multiple times
    let key = password + salt;
    
    // Perform multiple rounds of hashing (simulating PBKDF2)
    for (let i = 0; i < KEY_DERIVATION_ROUNDS; i++) {
      key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        key
      );
    }
    
    return key;
  } catch (error) {
    console.error('Error deriving key:', error);
    throw error;
  }
};

/**
 * Encrypts data using XOR cipher with derived key
 * 
 * ⚠️ SECURITY NOTE: XOR encryption is used for simplicity. For production
 * applications, consider using AES encryption for stronger security.
 * 
 * @function xorEncrypt
 * @param {string} data - Plain text data to encrypt
 * @param {string} key - Hex-encoded encryption key
 * @returns {string} Base64 encoded encrypted data
 * 
 * @example
 * const encrypted = xorEncrypt('Hello World', 'abc123...');
 * console.log(typeof encrypted); // 'string'
 */
const xorEncrypt = (data, key) => {
  const dataBytes = Buffer.from(data, 'utf8');
  const keyBytes = Buffer.from(key, 'hex');
  const result = Buffer.alloc(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return result.toString('base64');
};

/**
 * Decrypts XOR-encrypted data using derived key
 * 
 * @function xorDecrypt
 * @param {string} encryptedBase64 - Base64 encoded encrypted data
 * @param {string} key - Hex-encoded encryption key (same as used for encryption)
 * @returns {string} Decrypted plain text data
 * 
 * @example
 * const decrypted = xorDecrypt(encryptedData, key);
 * console.log(decrypted); // 'Hello World'
 */
const xorDecrypt = (encryptedBase64, key) => {
  const dataBytes = Buffer.from(encryptedBase64, 'base64');
  const keyBytes = Buffer.from(key, 'hex');
  const result = Buffer.alloc(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return result.toString('utf8');
};

/**
 * Encrypts backup data with user password for secure storage
 * 
 * Creates an encrypted backup file that includes version information,
 * timestamp, and metadata along with the actual grid data. The resulting
 * backup can be restored on any device using the same password.
 * 
 * @async
 * @function encryptBackupData
 * @param {Object} data - Grid data to encrypt (typically from getGrids())
 * @param {string} userPassword - User-provided password for encryption
 * @returns {Promise<EncryptionResult>} Encryption result with encrypted data or error
 * 
 * @example
 * const grids = await getGrids();
 * const result = await encryptBackupData(grids, 'mySecurePassword');
 * 
 * if (result.success) {
 *   console.log('Backup created:', result.timestamp);
 *   // Save result.encryptedData to file
 * } else {
 *   console.error('Encryption failed:', result.error);
 * }
 */
export const encryptBackupData = async (data, userPassword) => {
  try {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Password is required for backup encryption');
    }

    const key = await deriveKey(userPassword, BACKUP_SALT_V14);
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Add timestamp and version info for backup metadata
    const backupObject = {
      version: '1.5.0',
      timestamp: new Date().toISOString(),
      data: jsonData,
      encryptionType: 'password-based',
      saltInfo: 'static-cross-device'
    };
    
    const backupString = JSON.stringify(backupObject);
    
    // Encrypt the entire backup
    const encrypted = xorEncrypt(backupString, key);
    
    // Add a header to identify this as a PIN Vault backup
    const finalBackup = `PINVAULT_BACKUP_V1.5:${encrypted}`;
    
    return {
      success: true,
      encryptedData: finalBackup,
      timestamp: backupObject.timestamp
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Decrypts backup data with user password
 * 
 * Attempts to decrypt a PIN Vault backup file using the provided password.
 * Supports multiple backup versions and validates the backup format.
 * 
 * @async
 * @function decryptBackupData
 * @param {string} encryptedData - Encrypted backup data (from backup file)
 * @param {string} userPassword - User-provided password for decryption
 * @returns {Promise<DecryptionResult>} Decryption result with data or error
 * 
 * @example
 * const fileContent = await readBackupFile('backup.pvb');
 * const result = await decryptBackupData(fileContent, 'mySecurePassword');
 * 
 * if (result.success) {
 *   console.log('Backup version:', result.version);
 *   console.log('Grid count:', Object.keys(result.data).length);
 *   // Use result.data to restore grids
 * } else {
 *   console.error('Decryption failed:', result.error);
 * }
 */
export const decryptBackupData = async (encryptedData, userPassword) => {
  try {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Password is required for backup decryption');
    }

    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Invalid backup data format');
    }

    // Check for PIN Vault backup header and extract version
    let version = '1.2.0'; // Default version
    let actualEncryptedData = encryptedData;
    
    if (encryptedData.startsWith('PINVAULT_BACKUP_')) {
      const headerMatch = encryptedData.match(/^PINVAULT_BACKUP_V(\d+\.\d+):(.+)$/);
      if (headerMatch) {
        version = headerMatch[1] + '.0';
        actualEncryptedData = headerMatch[2];
      }
    }

    // Select appropriate salt based on version
    let salt = BACKUP_SALT_V12;
    if (version.startsWith('1.3')) salt = BACKUP_SALT_V13;
    else if (version.startsWith('1.4')) salt = BACKUP_SALT_V14;
    else if (version.startsWith('1.5')) salt = BACKUP_SALT_V15;

    const key = await deriveKey(userPassword, salt);
    
    // Decrypt the backup
    const decryptedString = xorDecrypt(actualEncryptedData, key);
    
    // Parse the backup structure
    let backupData;
    try {
      backupData = JSON.parse(decryptedString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Decrypted string:', decryptedString);
      throw new Error('Invalid backup format or wrong password');
    }
    
    // Extract actual grid data
    let actualData;
    if (backupData.data) {
      // Newer format with metadata
      try {
        actualData = JSON.parse(backupData.data);
      } catch (dataParseError) {
        console.error('Data parse error:', dataParseError);
        throw new Error('Corrupted backup data');
      }
    } else {
      // Older format - direct data
      actualData = backupData;
    }

    return {
      success: true,
      data: actualData,
      version: backupData.version || version,
      timestamp: backupData.timestamp
    };
  } catch (error) {
    console.error('Decryption error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate backup file format
export const validateBackupFile = (encryptedData) => {
  try {
    if (typeof encryptedData !== 'string') {
      return { valid: false, error: 'Backup data must be a string' };
    }
    
    if (!encryptedData.startsWith('PINVAULT_BACKUP_V1.2:') && 
        !encryptedData.startsWith('PINVAULT_BACKUP_V1.3:') && 
        !encryptedData.startsWith('PINVAULT_BACKUP_V1.4:') &&
        !encryptedData.startsWith('PINVAULT_BACKUP_V1.5:')) {
      return { valid: false, error: 'Not a valid PIN Vault backup file' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};