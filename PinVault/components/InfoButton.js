import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  ScrollView,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function InfoButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.icon}>i</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.modal.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/icon.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                PIN Vault Information
              </Text>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                  About PIN Vault
                </Text>
                <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                  PIN Vault is a secure mobile app designed to help you safely store and manage your bank and credit card PIN codes using a visual grid system. Your PINs are hidden among random digits and protected with biometric authentication.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                  Contact & Support
                </Text>
                <TouchableOpacity
                  style={[styles.linkButton, { backgroundColor: theme.surface }]}
                  onPress={() => openLink('mailto:davidpeltz@gmail.com')}
                >
                  <Text style={[styles.linkText, { color: theme.primary }]}>
                    📧 davidpeltz@gmail.com
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.linkButton, { backgroundColor: theme.surface }]}
                  onPress={() => openLink('https://github.com/DavidPeltz/Pincode_Vault')}
                >
                  <Text style={[styles.linkText, { color: theme.primary }]}>
                    🔗 GitHub Repository
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                  Support Development
                </Text>
                <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                  If you find PIN Vault useful, consider supporting its development:
                </Text>
                
                <TouchableOpacity
                  style={[styles.donateButton, { backgroundColor: theme.success }]}
                  onPress={() => openLink('https://paypal.me/DavidPeltz')}
                >
                  <Text style={styles.donateButtonText}>
                    💝 Donate via PayPal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.donateButton, { backgroundColor: theme.orange }]}
                  onPress={() => openLink('https://ko-fi.com/davidpeltz')}
                >
                  <Text style={styles.donateButtonText}>
                    ☕ Buy me a coffee
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                  Version & Privacy
                </Text>
                <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                  Version: 1.1.0-beta{'\n'}
                  Your PIN data is stored locally on your device and never transmitted to external servers. The app uses device biometric authentication for additional security.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3', // Blue circle
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    padding: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  linkButton: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  donateButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  donateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 15,
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});