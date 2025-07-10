import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useAuth } from './AuthProvider';

const SecurityInfo = ({ navigation }) => {
  const { biometricType, isAuthAvailable } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🔐 PIN Vault Security</Text>
          <Text style={styles.subtitle}>Your PINs are protected by device authentication</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Authentication Protection</Text>
          <Text style={styles.description}>
            PIN Vault uses your device's built-in security to protect access to editing and creating PIN grids.
          </Text>
          
          {isAuthAvailable ? (
            <View style={styles.authInfo}>
              <Text style={styles.authType}>
                ✅ Authentication Available: {biometricType}
              </Text>
              <Text style={styles.authDescription}>
                {biometricType === 'Face ID' && 'Your face will be scanned to verify your identity.'}
                {biometricType === 'Fingerprint' && 'Your fingerprint will be scanned to verify your identity.'}
                {biometricType === 'Iris' && 'Your iris will be scanned to verify your identity.'}
                {biometricType === 'Device Security' && 'Your device PIN, pattern, or password will be required.'}
                {biometricType === 'Biometric' && 'Your biometric authentication will be used.'}
              </Text>
            </View>
          ) : (
            <View style={styles.authWarning}>
              <Text style={styles.warningText}>
                ⚠️ Device authentication is not set up
              </Text>
              <Text style={styles.warningDescription}>
                Please configure biometric authentication or device lock (PIN/pattern/password) in your device settings to use PIN Vault securely.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 What's Protected</Text>
          <View style={styles.protectedList}>
            <Text style={styles.protectedItem}>• Creating new PIN grids</Text>
            <Text style={styles.protectedItem}>• Editing existing grids</Text>
            <Text style={styles.protectedItem}>• Modifying PIN digits</Text>
            <Text style={styles.protectedItem}>• Accessing grid creation tools</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ What's Always Visible</Text>
          <View style={styles.visibleList}>
            <Text style={styles.visibleItem}>• Gallery of saved grids (without PIN highlighting)</Text>
            <Text style={styles.visibleItem}>• Card names and dates</Text>
            <Text style={styles.visibleItem}>• Grid colors and random digits</Text>
            <Text style={styles.visibleItem}>• App navigation and settings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Security Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>
              <Text style={styles.featureBold}>Hidden PIN Display:</Text> Your actual PIN digits are not highlighted when viewing saved grids
            </Text>
            <Text style={styles.featureItem}>
              <Text style={styles.featureBold}>Device Authentication:</Text> Uses your phone's biometric or PIN/pattern security
            </Text>
            <Text style={styles.featureItem}>
              <Text style={styles.featureBold}>Local Storage:</Text> All data stays on your device - no cloud storage
            </Text>
            <Text style={styles.featureItem}>
              <Text style={styles.featureBold}>Visual Obfuscation:</Text> PINs are hidden among random digits in colored grids
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Security Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Always use the app in private to prevent shoulder surfing
            </Text>
            <Text style={styles.tipItem}>
              • Remember your color pattern for each PIN
            </Text>
            <Text style={styles.tipItem}>
              • Keep your device lock screen secure
            </Text>
            <Text style={styles.tipItem}>
              • Regularly backup your important PINs externally
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Gallery</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    marginBottom: 15,
  },
  authInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  authType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 8,
  },
  authDescription: {
    fontSize: 14,
    color: '#2D6A4F',
    lineHeight: 20,
  },
  authWarning: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 8,
  },
  warningDescription: {
    fontSize: 14,
    color: '#D68910',
    lineHeight: 20,
  },
  protectedList: {
    paddingLeft: 10,
  },
  protectedItem: {
    fontSize: 16,
    color: '#27AE60',
    marginBottom: 8,
    lineHeight: 22,
  },
  visibleList: {
    paddingLeft: 10,
  },
  visibleItem: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 22,
  },
  featureList: {
    paddingLeft: 10,
  },
  featureItem: {
    fontSize: 15,
    color: '#34495E',
    marginBottom: 12,
    lineHeight: 22,
  },
  featureBold: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  tipsList: {
    paddingLeft: 10,
  },
  tipItem: {
    fontSize: 15,
    color: '#34495E',
    marginBottom: 10,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SecurityInfo;