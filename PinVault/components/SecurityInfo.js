import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal
} from 'react-native';
import { useAuth } from './AuthProvider';
import { useTheme } from '../contexts/ThemeContext';

const SecurityInfoModal = ({ visible, onClose }) => {
  const { biometricType, isAuthAvailable } = useAuth();
  const { theme } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.modal.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.modal.background }]}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>🔐 PIN Vault Security</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your PINs are protected by device authentication</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>🛡️ Authentication Protection</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                PIN Vault uses your device's built-in security to protect access to editing and creating PIN grids.
              </Text>
              
              {isAuthAvailable ? (
                <View style={[styles.authInfo, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.authType, { color: theme.success }]}>
                    ✅ Device Authentication Available
                  </Text>
                  <Text style={[styles.authDescription, { color: theme.textSecondary }]}>
                    Your device authentication (PIN, Pattern, Password, Face ID, or Fingerprint) will be used to verify your identity when accessing PIN grids.
                  </Text>
                </View>
              ) : (
                <View style={[styles.authWarning, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.warningText, { color: theme.warning }]}>
                    ⚠️ Device authentication is not set up
                  </Text>
                  <Text style={[styles.warningDescription, { color: theme.textSecondary }]}>
                    Please configure device authentication (PIN, Pattern, Password, Face ID, or Fingerprint) in your device settings to use PIN Vault securely.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>🎯 Grid Method Security</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                The PIN grid method provides additional security through:
              </Text>
              
              <View style={styles.securityPoints}>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>Visual Camouflage:</Text> Your real PIN digits are hidden among random numbers
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>Memory Pattern:</Text> Remember the position and color pattern, not just numbers
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>Unique Layout:</Text> Each grid has a unique arrangement of colors and positions
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>Theft Resistance:</Text> Even if someone sees your grid, they can't identify your PIN
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>📱 Data Protection</Text>
              <View style={styles.securityPoints}>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>Local Storage:</Text> All data is stored only on your device
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>No Cloud Sync:</Text> Your PINs never leave your device
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>Encrypted Storage:</Text> Data is protected by your device's encryption
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • <Text style={[styles.bold, { color: theme.text }]}>Authentication Required:</Text> Access requires biometric or device unlock
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>💡 Security Best Practices</Text>
              <View style={styles.securityPoints}>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • Use unique PINs for different cards
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • Keep your device locked with a strong password
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • Enable automatic device lock
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • Don't share your grid patterns with others
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • Regularly update your device's operating system
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>🚨 Emergency Access</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                If you lose access to your device authentication:
              </Text>
              <View style={styles.securityPoints}>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • You can still access using your device PIN/password
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • Your grids remain safe on your device
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • No data is lost during authentication changes
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>📋 Privacy Policy</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                PIN Vault is committed to protecting your privacy:
              </Text>
              <View style={styles.securityPoints}>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • No personal data collection
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • No analytics or tracking
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • No network communication
                </Text>
                <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
                  • Open source transparency
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Export the modal component
export default SecurityInfoModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  authInfo: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  authWarning: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  authType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  authDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  warningDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  securityPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});