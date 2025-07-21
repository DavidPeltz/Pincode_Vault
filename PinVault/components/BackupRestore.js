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
  TextInput,
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

export default function BackupRestore({ visible, onClose, onGridsUpdated }) {
  const { theme } = useTheme();
  const { authenticate, authenticationInProgress, biometricType, isAuthAvailable } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState(null);
  const [selectedBackupData, setSelectedBackupData] = useState(null);
  const [restoreOptions, setRestoreOptions] = useState({
    replaceAll: false,
    overwriteExisting: false
  });
  
  // Password input states
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordAction, setPasswordAction] = useState(null); // 'backup-local', 'backup-share', or 'restore'
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      
      // Require authentication
      const authReason = `Please authenticate to create a backup of your PIN grids`;
      const authenticated = await authenticate(authReason);
      
      if (!authenticated) {
        return;
      }

      // Ask user where to save the backup
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
      
      // Determine backup type based on password action
      if (passwordAction === 'backup-local') {
        // Create backup in user-accessible location
        result = await createBackupForLocal(backupPassword);
      } else {
        // Create backup for sharing (private location)
        result = await createBackupForSharing(backupPassword);
      }
      
      if (!result.success) {
        Alert.alert('Backup Failed', result.error);
        return;
      }

      if (passwordAction === 'backup-local') {
        // Local backup success message
        const locationMsg = result.fallback 
          ? 'Saved to app directory (user location unavailable)'
          : 'Saved to your selected folder';
          
        Alert.alert(
          'Backup Saved Locally',
          `Created backup with ${result.gridCount} grids.\n\nFilename: ${result.filename}\n\n${locationMsg}\n\nYou can now navigate to this file in your file manager to restore on another device.`,
          [{ text: 'OK' }]
        );
      } else {
        // Share backup automatically
        await handleShareBackup(result.fileUri);
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareBackup = async (fileUri) => {
    try {
      const shareResult = await shareBackup(fileUri);
      
      if (!shareResult.success) {
        Alert.alert('Share Failed', shareResult.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share backup: ' + error.message);
    }
  };

  const handleSelectBackupFile = async () => {
    try {
      setLoading(true);
      
      const result = await pickBackupFile();
      
      if (!result.success) {
        if (result.error !== 'File selection cancelled') {
          Alert.alert('Selection Failed', result.error);
        }
        return;
      }

      // Read and validate the backup file
      const readResult = await readBackupFile(result.fileUri);
      
      if (!readResult.success) {
        Alert.alert('Invalid Backup File', readResult.error);
        return;
      }

      // Store backup data temporarily and prompt for password
      setSelectedBackupData(readResult.data);
      setPassword(''); // Clear any existing password for security
      setPasswordError(''); // Clear any existing error
      setPasswordAction('restore');
      setShowPasswordInput(true);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process backup file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBackupWithPassword = async (backupData, backupPassword, fileName, fileSize) => {
    try {
      // Get backup information with password
      const infoResult = await getBackupInfo(backupData, backupPassword);
      
      if (!infoResult.success) {
        return { success: false, error: infoResult.error };
      }

      setBackupInfo({
        ...infoResult,
        fileName: fileName,
        fileSize: fileSize
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setLoading(true);
      
      // Require authentication
      const authReason = `Please authenticate to restore PIN grids from backup`;
      const authenticated = await authenticate(authReason);
      
      if (!authenticated) {
        return;
      }

      if (!selectedBackupData || !backupInfo) {
        Alert.alert('Error', 'No backup file selected or analyzed');
        return;
      }

      // Confirm restoration
      const confirmMessage = restoreOptions.replaceAll 
        ? `This will REPLACE ALL existing grids with ${backupInfo.gridCount} grids from the backup. This action cannot be undone.`
        : `This will restore ${backupInfo.gridCount} grids from the backup. ${restoreOptions.overwriteExisting ? 'Existing grids with same IDs will be overwritten.' : 'Existing grids with same IDs will be kept.'}`;

      Alert.alert(
        'Confirm Restore',
        confirmMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Restore', 
            style: restoreOptions.replaceAll ? 'destructive' : 'default',
            onPress: () => performRestore()
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare restore: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const performRestore = async () => {
    try {
      setLoading(true);
      
      // Use the stored password for restoration
      const result = await restoreFromBackup(selectedBackupData, password, restoreOptions);
      
      if (!result.success) {
        Alert.alert('Restore Failed', result.error);
        return;
      }

      const message = `Successfully restored ${result.restoredCount} grids from backup.` +
        (result.skippedCount > 0 ? `\n${result.skippedCount} grids were skipped (already exist).` : '');

      Alert.alert(
        'Restore Complete',
        message,
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Clear selected backup and close modal
              clearSelection();
              onClose();
              // Notify parent to refresh grids
              if (onGridsUpdated) {
                onGridsUpdated();
              }
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to restore backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedBackupData(null);
    setBackupInfo(null);
    setPassword('');
    setPasswordError('');
    setShowPasswordInput(false);
    setPasswordAction(null);
    setShowPassword(false);
    setRestoreOptions({
      replaceAll: false,
      overwriteExisting: false
    });
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setPasswordError('');
    setLoading(true);

    try {
      if (passwordAction === 'backup-local' || passwordAction === 'backup-share') {
        setShowPasswordInput(false);
        await performBackup(password);
      } else if (passwordAction === 'restore') {
        // Analyze backup with provided password
        const tempFileInfo = { fileName: 'Selected File', fileSize: 0 }; // We'll improve this
        const analysisResult = await analyzeBackupWithPassword(selectedBackupData, password, tempFileInfo.fileName, tempFileInfo.fileSize);
        
        if (!analysisResult.success) {
          setPasswordError('Invalid password or corrupted backup file');
          return;
        }
        
        setShowPasswordInput(false);
      }
    } catch (error) {
      setPasswordError('Failed to process: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setPassword('');
    setPasswordError('');
    setShowPasswordInput(false);
    setPasswordAction(null);
    setShowPassword(false);
    setSelectedBackupData(null);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                Create Backup
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Export all your PIN grids to an encrypted backup file that you can save or share.
              </Text>
              
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.success }]}
                onPress={handleCreateBackup}
                disabled={loading}
              >
                <Text style={[styles.primaryButtonText, { color: 'white' }]}>
                  📤 Create Encrypted Backup
                </Text>
              </TouchableOpacity>
            </View>

            {/* Restore Backup Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                Restore from Backup
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Select a backup file to restore your PIN grids. Only valid PIN Vault backup files are accepted.
              </Text>
              
              {!backupInfo ? (
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.primary }]}
                  onPress={handleSelectBackupFile}
                  disabled={loading}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
                    📁 Select Backup File
                  </Text>
                </TouchableOpacity>
              ) : (
                <View>
                  {/* Backup File Info */}
                  <View style={[styles.backupInfo, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.backupInfoTitle, { color: theme.primary }]}>
                      Selected Backup File
                    </Text>
                    <Text style={[styles.backupInfoText, { color: theme.text }]}>
                      📄 {backupInfo.fileName}
                    </Text>
                    <Text style={[styles.backupInfoText, { color: theme.text }]}>
                      📊 {backupInfo.gridCount} grids
                    </Text>
                    <Text style={[styles.backupInfoText, { color: theme.text }]}>
                      📅 {formatDate(backupInfo.timestamp)}
                    </Text>
                    <Text style={[styles.backupInfoText, { color: theme.text }]}>
                      💾 {formatFileSize(backupInfo.fileSize)}
                    </Text>
                    <Text style={[styles.backupInfoText, { color: theme.text }]}>
                      🔖 Version {backupInfo.version}
                    </Text>
                  </View>

                  {/* Restore Options */}
                  <View style={styles.restoreOptions}>
                    <Text style={[styles.optionsTitle, { color: theme.primary }]}>
                      Restore Options
                    </Text>
                    
                    <TouchableOpacity
                      style={styles.checkboxOption}
                      onPress={() => setRestoreOptions(prev => ({ 
                        ...prev, 
                        replaceAll: !prev.replaceAll,
                        overwriteExisting: !prev.replaceAll ? prev.overwriteExisting : false
                      }))}
                    >
                      <Text style={[styles.checkbox, { color: theme.primary }]}>
                        {restoreOptions.replaceAll ? '☑️' : '☐'}
                      </Text>
                      <View style={styles.optionTextContainer}>
                        <Text style={[styles.optionText, { color: theme.text }]}>
                          Replace all existing grids
                        </Text>
                        <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                          Warning: This will delete all current grids
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {!restoreOptions.replaceAll && (
                      <TouchableOpacity
                        style={styles.checkboxOption}
                        onPress={() => setRestoreOptions(prev => ({ 
                          ...prev, 
                          overwriteExisting: !prev.overwriteExisting 
                        }))}
                      >
                        <Text style={[styles.checkbox, { color: theme.primary }]}>
                          {restoreOptions.overwriteExisting ? '☑️' : '☐'}
                        </Text>
                        <View style={styles.optionTextContainer}>
                          <Text style={[styles.optionText, { color: theme.text }]}>
                            Overwrite existing grids with same ID
                          </Text>
                          <Text style={[styles.optionSubtext, { color: theme.textSecondary }]}>
                            If unchecked, existing grids will be kept
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.textSecondary }]}
                      onPress={clearSelection}
                      disabled={loading}
                    >
                      <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.primaryButton, { 
                        backgroundColor: restoreOptions.replaceAll ? theme.error : theme.primary 
                      }]}
                      onPress={handleRestoreBackup}
                      disabled={loading}
                    >
                      <Text style={[styles.primaryButtonText, { color: 'white' }]}>
                        🔄 Restore Grids
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Password Input Modal */}
          {showPasswordInput && (
            <View style={[styles.passwordOverlay, { backgroundColor: theme.modal.overlay }]}>
              <View style={[styles.passwordModal, { backgroundColor: theme.modal.background }]}>
                <Text style={[styles.passwordTitle, { color: theme.primary }]}>
                  {(passwordAction === 'backup-local' || passwordAction === 'backup-share') ? 'Create Backup Password' : 'Enter Backup Password'}
                </Text>
                <Text style={[styles.passwordSubtitle, { color: theme.textSecondary }]}>
                  {(passwordAction === 'backup-local' || passwordAction === 'backup-share')
                    ? 'Create a password to encrypt your backup. You\'ll need this password to restore your grids.'
                    : 'Enter the password used when this backup was created.'
                  }
                </Text>
                
                <View style={[styles.passwordInputContainer, {
                  backgroundColor: theme.surface,
                  borderColor: passwordError ? theme.error : theme.primary
                }]}>
                  <TextInput
                    style={[styles.passwordTextInput, { color: theme.text }]}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Enter password"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!showPassword}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (password.trim()) {
                        handlePasswordConfirm();
                      }
                    }}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="default"
                    blurOnSubmit={true}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={[styles.eyeIcon, { color: theme.textSecondary }]}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {passwordError ? (
                  <Text style={[styles.passwordError, { color: theme.error }]}>
                    {passwordError}
                  </Text>
                ) : null}
                
                <View style={styles.passwordButtons}>
                  <TouchableOpacity
                    style={[styles.passwordButton, styles.cancelButton, { backgroundColor: theme.surface }]}
                    onPress={handlePasswordCancel}
                    disabled={loading}
                  >
                    <Text style={[styles.passwordButtonText, { color: theme.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.passwordButton, styles.confirmButton, { backgroundColor: theme.primary }]}
                    onPress={handlePasswordSubmit}
                    disabled={loading || !password.trim()}
                  >
                    <Text style={[styles.passwordButtonText, { color: 'white' }]}>
                      {(passwordAction === 'backup-local' || passwordAction === 'backup-share') ? 'Create Backup' : 'Analyze Backup'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Loading Overlay */}
          {loading && (
            <View style={[styles.loadingOverlay, { backgroundColor: theme.modal.overlay }]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                {authenticationInProgress ? 'Authenticating...' : 'Processing...'}
              </Text>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={[styles.closeButtonText, { color: 'white' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    maxHeight: 500,
  },
  securityNotice: {
    flexDirection: 'row',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  primaryButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backupInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  backupInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backupInfoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  restoreOptions: {
    marginBottom: 15,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  passwordOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  passwordModal: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  passwordTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  passwordSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  passwordInputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  passwordTextInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    paddingRight: 10,
  },
  eyeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 20,
  },
  passwordError: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  passwordButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  confirmButton: {
    // No additional styles needed
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  closeButton: {
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});