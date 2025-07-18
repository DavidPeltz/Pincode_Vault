import { Buffer } from 'buffer';
import * as Crypto from 'expo-crypto';

// Use a static salt for consistent key derivation across devices
const BACKUP_SALT = 'pinvault-backup-v1.2-cross-device-salt-2025';

// Derive encryption key using PBKDF2-like approach
const deriveKey = async (password, salt) => {
  try {
    // Create a strong key by hashing password + salt multiple times
    let key = password + salt;
    
    // Perform multiple rounds of hashing (simulating PBKDF2)
    for (let i = 0; i < 10000; i++) {
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

// Simple XOR-based encryption (for demo - in production use AES)
const xorEncryptDecrypt = (data, key) => {
  const dataBytes = Buffer.from(data, 'utf8');
  const keyBytes = Buffer.from(key, 'hex');
  const result = Buffer.alloc(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return result.toString('base64');
};

// Encrypt backup data with user password
export const encryptBackupData = async (data, userPassword) => {
  try {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Password is required for backup encryption');
    }

    const key = await deriveKey(userPassword, BACKUP_SALT);
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Add timestamp and version info
    const backupObject = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      data: jsonData,
      encryptionType: 'password-based',
      saltInfo: 'static-cross-device'
    };
    
    const backupString = JSON.stringify(backupObject);
    
    // Encrypt the entire backup
    const encrypted = xorEncryptDecrypt(backupString, key);
    
    // Add a header to identify this as a PIN Vault backup
    const finalBackup = `PINVAULT_BACKUP_V1.2:${encrypted}`;
    
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

// Decrypt backup data with user password
export const decryptBackupData = async (encryptedData, userPassword) => {
  try {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Password is required for backup decryption');
    }

    // Check if this is a valid PIN Vault backup
    if (!encryptedData.startsWith('PINVAULT_BACKUP_V1.2:')) {
      throw new Error('Invalid backup file format');
    }
    
    // Remove header
    const encrypted = encryptedData.replace('PINVAULT_BACKUP_V1.2:', '');
    
    // Use the same static salt for decryption
    const key = await deriveKey(userPassword, BACKUP_SALT);
    
    // Decrypt
    const decrypted = xorEncryptDecrypt(encrypted, key);
    const backupString = Buffer.from(decrypted, 'base64').toString('utf8');
    
    // Parse the backup object
    const backupObject = JSON.parse(backupString);
    
    // Validate backup structure
    if (!backupObject.version || !backupObject.data) {
      throw new Error('Invalid backup file structure');
    }
    
    // Parse the actual data
    const data = JSON.parse(backupObject.data);
    
    return {
      success: true,
      data: data,
      version: backupObject.version,
      timestamp: backupObject.timestamp,
      encryptionType: backupObject.encryptionType || 'legacy'
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
    
    if (!encryptedData.startsWith('PINVAULT_BACKUP_V1.2:')) {
      return { valid: false, error: 'Not a valid PIN Vault backup file' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};