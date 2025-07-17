import { Buffer } from 'buffer';
import * as Crypto from 'expo-crypto';

// Generate a device-specific salt based on device characteristics
const generateDeviceSalt = async () => {
  try {
    // Use a combination of random bytes and a consistent device identifier
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const deviceIdentifier = 'pinvault-backup-key'; // Could use device ID if available
    
    // Combine them to create a unique salt
    const combined = deviceIdentifier + Buffer.from(randomBytes).toString('hex');
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    
    return hash.substring(0, 32); // 32 character salt
  } catch (error) {
    console.error('Error generating device salt:', error);
    throw error;
  }
};

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

// Encrypt backup data
export const encryptBackupData = async (data, userPassword = 'default-pin-vault-key') => {
  try {
    const salt = await generateDeviceSalt();
    const key = await deriveKey(userPassword, salt);
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Add timestamp and version info
    const backupObject = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      data: jsonData,
      salt: salt
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

// Decrypt backup data
export const decryptBackupData = async (encryptedData, userPassword = 'default-pin-vault-key') => {
  try {
    // Check if this is a valid PIN Vault backup
    if (!encryptedData.startsWith('PINVAULT_BACKUP_V1.2:')) {
      throw new Error('Invalid backup file format');
    }
    
    // Remove header
    const encrypted = encryptedData.replace('PINVAULT_BACKUP_V1.2:', '');
    
    // We need to try decryption with device salt
    // Since we don't know the original salt, we'll generate it the same way
    const salt = await generateDeviceSalt();
    const key = await deriveKey(userPassword, salt);
    
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
      timestamp: backupObject.timestamp
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