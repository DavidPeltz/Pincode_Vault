import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Password input modal component for backup operations
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {string} props.action - The action type ('backup-local', 'backup-share', 'restore')
 * @param {Function} props.onSubmit - Callback when password is submitted
 * @param {Function} props.onCancel - Callback when password input is cancelled
 * @param {string} props.error - Error message to display
 */
export default function PasswordInput({ visible, action, onSubmit, onCancel, error }) {
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter a password for backup encryption/decryption.');
      return;
    }
    onSubmit(password);
    setPassword('');
    setShowPassword(false);
  };

  const handleCancel = () => {
    setPassword('');
    setShowPassword(false);
    onCancel();
  };

  const getTitle = () => {
    switch (action) {
      case 'backup-local':
        return 'Create Local Backup';
      case 'backup-share':
        return 'Create Backup for Sharing';
      case 'restore':
        return 'Restore Backup';
      default:
        return 'Enter Password';
    }
  };

  const getDescription = () => {
    switch (action) {
      case 'backup-local':
        return "Enter a password to encrypt your backup file. You'll need this password to restore your data.";
      case 'backup-share':
        return 'Enter a password to encrypt your backup for sharing. The same password will be needed on the destination device.';
      case 'restore':
        return 'Enter the password that was used to create this backup.';
      default:
        return 'Please enter a password.';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.modal.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>{getTitle()}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {getDescription()}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: error ? theme.error : theme.border,
                  color: theme.text,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={[styles.eyeIcon, { color: theme.primary }]}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.textSecondary }]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {action === 'restore' ? 'Restore' : 'Create Backup'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * PropTypes for PasswordInput component
 */
PasswordInput.propTypes = {
  /** Whether the modal is visible */
  visible: PropTypes.bool.isRequired,

  /** The action type for the password input */
  action: PropTypes.oneOf(['backup-local', 'backup-share', 'restore']),

  /** Callback function called when password is submitted */
  onSubmit: PropTypes.func.isRequired,

  /** Callback function called when password input is cancelled */
  onCancel: PropTypes.func.isRequired,

  /** Error message to display */
  error: PropTypes.string,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 15,
    padding: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    opacity: 0.7,
  },
  submitButton: {},
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
