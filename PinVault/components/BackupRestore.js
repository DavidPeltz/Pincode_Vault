import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from './AuthProvider';
import { 
  createBackupForSharing,
  createBackupForLocal, 
  shareBackup, 
  pickBackupFile, 
  readBackupFile, 
  restoreFromBackup, 
  getBackupInfo 
} from '../utils/backup';
import PasswordInput from './backup/PasswordInput';
import BackupInfo from './backup/BackupInfo';
import RestoreOptions from './backup/RestoreOptions';

/**
 * Main backup and restore modal component
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onGridsUpdated - Callback when grids are updated
 */
export default function BackupRestore({ visible, onClose, onGridsUpdated }) {
  const { theme } = useTheme();
  const { authenticate, authenticationInProgress } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState(null);
  const [selectedBackupData, setSelectedBackupData] = useState(null);
  const [restoreOptions, setRestoreOptions] = useState({
    replaceAll: false,
    overwriteExisting: false
  });
  
  // Password input states
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordAction, setPasswordAction] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      
      const authReason = `Please authenticate to create a backup of your PIN grids`;
      const authenticated = await authenticate(authReason);
      
      if (!authenticated) {
        return;
      }

      Alert.alert(
        'Backup Location',
        'Where would you like to save your backup?',
        [
          { 
            text: 'Keep Local',
            onPress: () => {
              setPasswordAction('backup-local');
              setShowPasswordInput(true);
            }
          },
          { 
            text: 'Share/Export',
            onPress: () => {
              setPasswordAction('backup-share');
              setShowPasswordInput(true);
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const performBackup = async (backupPassword) => {
    try {
      setLoading(true);

      let result;
      
      if (passwordAction === 'backup-local') {
        result = await createBackupForLocal(backupPassword);
      } else {
        result = await createBackupForSharing(backupPassword);
      }
      
      if (result.success) {
        if (passwordAction === 'backup-share') {
          await handleShareBackup(result.filePath);
        } else {
          Alert.alert(
            'Backup Created',
            `Your backup has been saved successfully!\n\nLocation: ${result.directory}\nFile: ${result.fileName}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Backup Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Error', 'Backup creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareBackup = async (fileUri) => {
    try {
      const shareResult = await shareBackup(fileUri);
      if (shareResult.success) {
        Alert.alert('Backup Shared', 'Your backup file has been shared successfully!');
      }
    } catch (error) {
      Alert.alert('Share Error', 'Failed to share backup: ' + error.message);
    }
  };

  const handleSelectBackupFile = async () => {
    try {
      setLoading(true);
      
      const authReason = `Please authenticate to restore PIN grids from backup`;
      const authenticated = await authenticate(authReason);
      
      if (!authenticated) {
        return;
      }

      const fileResult = await pickBackupFile();
      
      if (fileResult.success) {
        const fileData = await readBackupFile(fileResult.fileUri);
        
        if (fileData.success) {
          setSelectedBackupData({
            data: fileData.data,
            fileName: fileResult.fileName,
            fileSize: fileResult.fileSize
          });
          
          setPasswordAction('restore');
          setShowPasswordInput(true);
        } else {
          Alert.alert('File Error', fileData.error || 'Could not read backup file');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select backup file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBackupWithPassword = async (backupData, backupPassword, fileName, fileSize) => {
    try {
      const analysisResult = await getBackupInfo(backupData, backupPassword);
      
      if (analysisResult.success) {
        setBackupInfo({
          ...analysisResult.info,
          fileName: fileName,
          fileSize: fileSize
        });
        return { success: true };
      } else {
        setPasswordError('Invalid password or corrupted backup file');
        return { success: false, error: analysisResult.error };
      }
    } catch (error) {
      setPasswordError('Analysis failed: ' + error.message);
      return { success: false, error: error.message };
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackupData || !backupInfo) {
      Alert.alert('Error', 'No backup file selected or analyzed');
      return;
    }

    Alert.alert(
      'Confirm Restore',
      `Are you sure you want to restore ${backupInfo.gridCount} grid(s) from this backup?${
        restoreOptions.replaceAll ? '\n\n⚠️ WARNING: This will permanently delete all your current grids!' : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: restoreOptions.replaceAll ? 'destructive' : 'default',
          onPress: performRestore 
        }
      ]
    );
  };

  const performRestore = async () => {
    try {
      setLoading(true);

      const result = await restoreFromBackup(
        selectedBackupData.data,
        passwordAction === 'restore' ? 'temp-password' : '', // We need to pass the actual password here
        restoreOptions.replaceAll,
        restoreOptions.overwriteExisting
      );

      if (result.success) {
        Alert.alert(
          'Restore Complete',
          `Successfully restored ${result.restoredCount} grid(s)!${
            result.skippedCount > 0 ? `\n\nSkipped ${result.skippedCount} duplicate(s)` : ''
          }`,
          [{ 
            text: 'OK',
            onPress: () => {
              clearSelection();
              onGridsUpdated?.();
              onClose();
            }
          }]
        );
      } else {
        Alert.alert('Restore Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Error', 'Restore failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setBackupInfo(null);
    setSelectedBackupData(null);
    setRestoreOptions({
      replaceAll: false,
      overwriteExisting: false
    });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (password) => {
    try {
      setPasswordError('');
      setShowPasswordInput(false);
      
      if (passwordAction === 'restore') {
        const result = await analyzeBackupWithPassword(
          selectedBackupData.data, 
          password, 
          selectedBackupData.fileName, 
          selectedBackupData.fileSize
        );
        
        if (!result.success) {
          setShowPasswordInput(true); // Show password input again
        }
      } else {
        await performBackup(password);
      }
    } catch (error) {
      Alert.alert('Error', 'Operation failed: ' + error.message);
    } finally {
      setPasswordAction(passwordAction === 'restore' && passwordError ? passwordAction : null);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordError('');
    setShowPasswordInput(false);
    setPasswordAction(null);
    if (passwordAction === 'restore') {
      clearSelection();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.modal.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.modal.background }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>
              Backup & Restore
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Securely backup and restore your PIN grids
            </Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Security Notice */}
            <View style={[styles.securityNotice, { backgroundColor: theme.surface }]}>
              <Text style={[styles.securityIcon, { color: theme.primary }]}>🔐</Text>
              <Text style={[styles.securityText, { color: theme.text }]}>
                All backups are encrypted with your chosen password and protected by device authentication. 
                You can restore backup files on any device using the same password.
              </Text>
            </View>

            {/* Create Backup Section */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>💾 Create Backup</Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Export your PIN grids to an encrypted backup file
              </Text>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={handleCreateBackup}
                disabled={loading || authenticationInProgress}
              >
                {loading && passwordAction && passwordAction.startsWith('backup') ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.actionButtonText}>Create Backup</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Restore Backup Section */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>📁 Restore Backup</Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Import PIN grids from an encrypted backup file
              </Text>
              
              {!backupInfo ? (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.success }]}
                  onPress={handleSelectBackupFile}
                  disabled={loading || authenticationInProgress}
                >
                  {loading && passwordAction === 'restore' && !backupInfo ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.actionButtonText}>Select Backup File</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View>
                  <BackupInfo 
                    backupInfo={backupInfo} 
                    restoreOptions={restoreOptions}
                  />
                  
                  <RestoreOptions 
                    options={restoreOptions}
                    onOptionsChange={setRestoreOptions}
                  />
                  
                  <View style={styles.restoreActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.textSecondary, flex: 1, marginRight: 10 }]}
                      onPress={clearSelection}
                    >
                      <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.warning, flex: 1 }]}
                      onPress={handleRestoreBackup}
                      disabled={loading}
                    >
                      {loading && passwordAction === null ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.actionButtonText}>Restore Now</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.textSecondary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          {/* Loading Overlay */}
          {(loading || authenticationInProgress) && (
            <View style={[styles.loadingOverlay, { backgroundColor: theme.modal.overlay }]}>
              <View style={[styles.loadingContainer, { backgroundColor: theme.modal.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>
                  {authenticationInProgress ? 'Authenticating...' : 'Processing...'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Password Input Modal */}
      <PasswordInput
        visible={showPasswordInput}
        action={passwordAction}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        error={passwordError}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    padding: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restoreActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  closeButton: {
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingContainer: {
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
});