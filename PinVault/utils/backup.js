import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getGrids, saveGrid } from './storage';
import { encryptBackupData, decryptBackupData, validateBackupFile } from './encryption';

// Create encrypted backup file
export const createBackup = async () => {
  try {
    // Get all grids from storage
    const grids = await getGrids();
    
    if (Object.keys(grids).length === 0) {
      return {
        success: false,
        error: 'No grids found to backup'
      };
    }
    
    // Encrypt the data
    const encryptionResult = await encryptBackupData(grids);
    
    if (!encryptionResult.success) {
      return encryptionResult;
    }
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pinvault-backup-${timestamp}.pvb`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    // Write encrypted data to file
    await FileSystem.writeAsStringAsync(fileUri, encryptionResult.encryptedData);
    
    return {
      success: true,
      fileUri: fileUri,
      filename: filename,
      timestamp: encryptionResult.timestamp,
      gridCount: Object.keys(grids).length
    };
  } catch (error) {
    console.error('Backup creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Share backup file
export const shareBackup = async (fileUri) => {
  try {
    const sharingAvailable = await Sharing.isAvailableAsync();
    
    if (!sharingAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device'
      };
    }
    
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Share PIN Vault Backup'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Sharing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Pick backup file for restoration
export const pickBackupFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true
    });
    
    if (result.canceled) {
      return {
        success: false,
        error: 'File selection cancelled'
      };
    }
    
    // Check if it's likely a backup file
    const file = result.assets[0];
    if (!file.name.includes('pinvault-backup') && !file.name.endsWith('.pvb')) {
      return {
        success: false,
        error: 'Selected file does not appear to be a PIN Vault backup'
      };
    }
    
    return {
      success: true,
      fileUri: file.uri,
      fileName: file.name,
      fileSize: file.size
    };
  } catch (error) {
    console.error('File picker error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Read and validate backup file
export const readBackupFile = async (fileUri) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    
    // Validate backup file format
    const validation = validateBackupFile(fileContent);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }
    
    return {
      success: true,
      data: fileContent
    };
  } catch (error) {
    console.error('File reading error:', error);
    return {
      success: false,
      error: 'Failed to read backup file'
    };
  }
};

// Restore grids from backup
export const restoreFromBackup = async (encryptedData, options = {}) => {
  try {
    // Decrypt the backup data
    const decryptionResult = await decryptBackupData(encryptedData);
    
    if (!decryptionResult.success) {
      return decryptionResult;
    }
    
    const { data: grids, version, timestamp } = decryptionResult;
    
    // Validate that we have grid data
    if (!grids || typeof grids !== 'object') {
      return {
        success: false,
        error: 'Invalid backup data structure'
      };
    }
    
    const gridKeys = Object.keys(grids);
    if (gridKeys.length === 0) {
      return {
        success: false,
        error: 'No grids found in backup'
      };
    }
    
    // If options.replaceAll is true, we'll replace all existing grids
    // Otherwise, we'll merge (keeping existing grids with same IDs)
    let restoredCount = 0;
    let skippedCount = 0;
    
    if (options.replaceAll) {
      // Clear existing data first (by saving each grid)
      for (const gridId of gridKeys) {
        const saveResult = await saveGrid(grids[gridId]);
        if (saveResult) {
          restoredCount++;
        }
      }
    } else {
      // Merge mode - check for conflicts
      const existingGrids = await getGrids();
      
      for (const gridId of gridKeys) {
        if (existingGrids[gridId] && !options.overwriteExisting) {
          skippedCount++;
          continue;
        }
        
        const saveResult = await saveGrid(grids[gridId]);
        if (saveResult) {
          restoredCount++;
        }
      }
    }
    
    return {
      success: true,
      restoredCount: restoredCount,
      skippedCount: skippedCount,
      totalInBackup: gridKeys.length,
      backupVersion: version,
      backupTimestamp: timestamp
    };
  } catch (error) {
    console.error('Restore error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get backup info without restoring
export const getBackupInfo = async (encryptedData) => {
  try {
    const decryptionResult = await decryptBackupData(encryptedData);
    
    if (!decryptionResult.success) {
      return decryptionResult;
    }
    
    const { data: grids, version, timestamp } = decryptionResult;
    const gridKeys = Object.keys(grids || {});
    
    return {
      success: true,
      gridCount: gridKeys.length,
      version: version,
      timestamp: timestamp,
      gridTitles: gridKeys.map(id => grids[id]?.title || `Grid ${id}`)
    };
  } catch (error) {
    console.error('Backup info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};