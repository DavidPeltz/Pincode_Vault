import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../AuthProvider';
import PropTypes from 'prop-types';

/**
 * Empty state component for when no grids are available
 * @param {Object} props
 * @param {Function} props.onCreateNew - Callback when create new grid is pressed
 */
export default function EmptyState({ onCreateNew }) {
  const { theme } = useTheme();
  const { biometricType, isAuthAvailable } = useAuth();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Welcome Section */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🔐 Welcome to PIN Vault v1.5</Text>
        <Text style={[styles.overviewText, { color: theme.textSecondary }]}>
          Securely store your bank and credit card PINs using a unique visual grid system. 
          Your PINs are hidden among random digits in colorful grids, protected by device authentication 
          and encrypted backups.
        </Text>
      </View>

      {/* Quick Start Instructions */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🚀 Quick Start</Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          1. Tap the <Text style={{ fontWeight: 'bold', color: theme.primary }}>+</Text> button below to create your first PIN grid
        </Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          2. Choose colored cells to enter your PIN digits (remember the pattern!)
        </Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          3. Fill remaining cells with random digits for security
        </Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          4. Save with a memorable name like "Chase Credit Card"
        </Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          5. Create encrypted backups using the backup button in the header
        </Text>
      </View>

      {/* Authentication Setup (if needed) */}
      {!isAuthAvailable && (
        <View style={[
          styles.section, 
          styles.authSetupSection,
          { 
            backgroundColor: theme.surface, 
            borderColor: theme.warning 
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: theme.warning }]}>⚠️ Authentication Setup Required</Text>
          <Text style={[styles.overviewText, { color: theme.textSecondary }]}>
            For enhanced security, please enable device authentication in your system settings.
          </Text>
          
          <Text style={[styles.overviewText, { color: theme.textSecondary, marginTop: 10 }]}>
            Supported methods:
          </Text>
          <View style={styles.authMethodsList}>
            <Text style={[styles.authMethod, { color: theme.textSecondary }]}>• Face ID / Face Recognition</Text>
            <Text style={[styles.authMethod, { color: theme.textSecondary }]}>• Touch ID / Fingerprint</Text>
            <Text style={[styles.authMethod, { color: theme.textSecondary }]}>• Iris Recognition</Text>
            <Text style={[styles.authMethod, { color: theme.textSecondary }]}>• Device PIN / Pattern / Password</Text>
          </View>
          
          <Text style={[styles.authSetupNote, { color: theme.textSecondary }]}>
            Authentication will be required for editing grids and creating backups.
          </Text>
        </View>
      )}

      {/* Security Info */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🛡️ Security Features</Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Visual Obfuscation:</Text> PINs hidden among decoy digits
        </Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Biometric Protection:</Text> {biometricType || 'Device'} authentication required
        </Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Encrypted Backups:</Text> Password-protected with strong encryption
        </Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          • <Text style={{ fontWeight: 'bold' }}>Offline Storage:</Text> No cloud servers, your data stays local
        </Text>
      </View>

      {/* Create First Grid Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.primary }]}
        onPress={onCreateNew}
      >
        <Text style={styles.createButtonText}>+ Create Your First PIN Grid</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * PropTypes for EmptyState component
 */
EmptyState.propTypes = {
  /** Callback function called when create new grid button is pressed */
  onCreateNew: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  overviewText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  authSetupSection: {
    borderWidth: 2,
  },
  authMethodsList: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  authMethod: {
    fontSize: 16,
    marginBottom: 5,
  },
  authSetupNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  createButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});