import { Buffer } from 'buffer';
import * as Crypto from 'expo-crypto';

// Use version-specific salts for consistent key derivation across devices
const BACKUP_SALT_V12 = 'pinvault-backup-v1.2-cross-device-salt-2025';
const BACKUP_SALT_V13 = 'pinvault-backup-v1.3-cross-device-salt-2025';
const BACKUP_SALT_V14 = 'pinvault-backup-v1.4-cross-device-salt-2025';
const BACKUP_SALT_V15 = 'pinvault-backup-v1.5-cross-device-salt-2025';

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
const xorEncrypt = (data, key) => {
  const dataBytes = Buffer.from(data, 'utf8');
  const keyBytes = Buffer.from(key, 'hex');
  const result = Buffer.alloc(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return result.toString('base64');
};

const xorDecrypt = (encryptedBase64, key) => {
  const dataBytes = Buffer.from(encryptedBase64, 'base64');
  const keyBytes = Buffer.from(key, 'hex');
  const result = Buffer.alloc(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return result.toString('utf8');
};

// Encrypt backup data with user password
export const encryptBackupData = async (data, userPassword) => {
  try {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Password is required for backup encryption');
    }

    const key = await deriveKey(userPassword, BACKUP_SALT_V14);
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Add timestamp and version info
    const backupObject = {
      version: '1.5.0-beta',
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

// Decrypt backup data with user password
export const decryptBackupData = async (encryptedData, userPassword) => {
  try {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Password is required for backup decryption');
    }

    // Check if this is a valid PIN Vault backup
    if (!encryptedData.startsWith('PINVAULT_BACKUP_V1.2:') && 
        !encryptedData.startsWith('PINVAULT_BACKUP_V1.3:') && 
        !encryptedData.startsWith('PINVAULT_BACKUP_V1.4:') &&
        !encryptedData.startsWith('PINVAULT_BACKUP_V1.5:')) {
      throw new Error('Invalid backup file format');
    }
    
    // Remove header and determine correct salt based on backup version
    let encrypted;
    let saltToUse;
    if (encryptedData.startsWith('PINVAULT_BACKUP_V1.5:')) {
      encrypted = encryptedData.replace('PINVAULT_BACKUP_V1.5:', '');
      saltToUse = BACKUP_SALT_V15;
    } else if (encryptedData.startsWith('PINVAULT_BACKUP_V1.4:')) {
      encrypted = encryptedData.replace('PINVAULT_BACKUP_V1.4:', '');
      saltToUse = BACKUP_SALT_V14;
    } else if (encryptedData.startsWith('PINVAULT_BACKUP_V1.3:')) {
      encrypted = encryptedData.replace('PINVAULT_BACKUP_V1.3:', '');
      saltToUse = BACKUP_SALT_V13;
    } else {
      encrypted = encryptedData.replace('PINVAULT_BACKUP_V1.2:', '');
      saltToUse = BACKUP_SALT_V12;
    }
    
    // Use the version-appropriate salt for decryption
    const key = await deriveKey(userPassword, saltToUse);
    
    // Decrypt
    const backupString = xorDecrypt(encrypted, key);
    
    // Parse the backup object
    let backupObject;
    try {
      backupObject = JSON.parse(backupString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Decrypted string:', backupString);
      throw new Error('Failed to parse backup data. This may indicate an incorrect password or corrupted backup file.');
    }
    
    // Validate backup structure
    if (!backupObject.version || !backupObject.data) {
      throw new Error('Invalid backup file structure');
    }
    
    // Parse the actual data
    let data;
    try {
      data = JSON.parse(backupObject.data);
    } catch (dataParseError) {
      console.error('Data parse error:', dataParseError);
      throw new Error('Failed to parse backup grid data. Backup may be corrupted.');
    }
    
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