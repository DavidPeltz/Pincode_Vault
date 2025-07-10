import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticationInProgress, setAuthenticationInProgress] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isAuthAvailable, setIsAuthAvailable] = useState(false);

  useEffect(() => {
    checkAuthenticationAvailability();
  }, []);

  const checkAuthenticationAvailability = async () => {
    try {
      console.log('Platform:', Platform.OS);
      console.log('Checking authentication availability...');
      
      // Check if device has authentication hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      console.log('Has biometric hardware:', hasHardware);
      
      if (!hasHardware) {
        console.log('No biometric hardware available');
        Alert.alert('Debug', `No biometric hardware on ${Platform.OS}`);
        setIsAuthAvailable(false);
        return;
      }

      // Check if device has biometric records enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log('Has biometric enrolled:', isEnrolled);
      
      if (!isEnrolled) {
        console.log('No biometric credentials enrolled');
        Alert.alert('Debug', `No biometric enrolled on ${Platform.OS}`);
        setIsAuthAvailable(false);
        return;
      }

      // Get available authentication types
      const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log('Supported auth types:', authTypes);
      
      if (authTypes.length > 0) {
        setIsAuthAvailable(true);
        console.log('Authentication is available');
        
        // Set biometric type for display purposes
        if (authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else if (authTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        } else {
          setBiometricType('Biometric');
        }
        
        Alert.alert('Debug', `Authentication available: ${biometricType || 'Biometric'}`);
      } else {
        setIsAuthAvailable(true); // Device PIN/Pattern still available
        setBiometricType('Device Security');
        console.log('No biometric types, but device security available');
        Alert.alert('Debug', 'Device security available (PIN/Pattern)');
      }
    } catch (error) {
      console.error('Error checking authentication availability:', error);
      Alert.alert('Debug Error', `Auth check failed: ${error.message}`);
      setIsAuthAvailable(false);
    }
  };

  const authenticate = async (reason = 'Please authenticate to access PIN editing') => {
    console.log('🔐 Authenticate called with reason:', reason);
    console.log('🔐 Auth available:', isAuthAvailable);
    console.log('🔐 Auth in progress:', authenticationInProgress);
    
    if (authenticationInProgress) {
      console.log('🔐 Authentication already in progress');
      return false;
    }

    if (!isAuthAvailable) {
      console.log('🔐 Authentication not available');
      Alert.alert(
        'Authentication Not Available',
        `This device does not have biometric authentication or device lock configured. Platform: ${Platform.OS}. Please set up device security in your system settings.`,
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      console.log('🔐 Starting authentication...');
      setAuthenticationInProgress(true);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Device PIN/Pattern',
        disableDeviceFallback: false, // Allow device PIN/pattern as fallback
        requireConfirmation: false,
      });

      console.log('🔐 Authentication result:', result);

      if (result.success) {
        console.log('🔐 Authentication successful');
        setIsAuthenticated(true);
        Alert.alert('Debug', 'Authentication successful!');
        return true;
      } else {
        console.log('🔐 Authentication failed:', result.error);
        // Handle different error types
        if (result.error === 'user_cancel') {
          console.log('🔐 User cancelled authentication');
          Alert.alert('Debug', 'User cancelled authentication');
          return false;
        } else if (result.error === 'system_cancel') {
          Alert.alert('Authentication Cancelled', 'Authentication was cancelled by the system.');
        } else if (result.error === 'lockout') {
          Alert.alert(
            'Too Many Attempts',
            'Authentication is temporarily disabled due to too many failed attempts. Please try again later.'
          );
        } else if (result.error === 'lockout_permanent') {
          Alert.alert(
            'Authentication Locked',
            'Authentication is permanently disabled. Please use device settings to re-enable it.'
          );
        } else {
          Alert.alert('Authentication Failed', `Authentication was not successful: ${result.error}. Please try again.`);
        }
        return false;
      }
    } catch (error) {
      console.error('🔐 Authentication error:', error);
      Alert.alert('Authentication Error', `An error occurred during authentication: ${error.message}. Please try again.`);
      return false;
    } finally {
      console.log('🔐 Authentication process finished');
      setAuthenticationInProgress(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Auto-logout after app goes to background (optional security feature)
  const resetAuthentication = () => {
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    authenticationInProgress,
    biometricType,
    isAuthAvailable,
    authenticate,
    logout,
    resetAuthentication,
    checkAuthenticationAvailability,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};