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
      // Check if device has authentication hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      console.log('Has biometric hardware:', hasHardware);
      
      if (!hasHardware) {
        console.log('No biometric hardware available');
        setIsAuthAvailable(false);
        return;
      }

      // Check if device has biometric records enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log('Has biometric enrolled:', isEnrolled);
      
      if (!isEnrolled) {
        console.log('No biometric credentials enrolled');
        setIsAuthAvailable(false);
        return;
      }

      // Get available authentication types
      const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (authTypes.length > 0) {
        setIsAuthAvailable(true);
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
      } else {
        setIsAuthAvailable(true); // Device PIN/Pattern still available
        setBiometricType('Device Security');
      }
    } catch (error) {
      console.error('Error checking authentication availability:', error);
      setIsAuthAvailable(false);
    }
  };

  const authenticate = async (reason = 'Please authenticate to access PIN editing') => {
    if (authenticationInProgress) {
      return false;
    }

    if (!isAuthAvailable) {
      Alert.alert(
        'Authentication Not Available',
        'This device does not have biometric authentication or device lock configured. Please set up device security in your system settings.',
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      setAuthenticationInProgress(true);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Device PIN/Pattern',
        disableDeviceFallback: false, // Allow device PIN/pattern as fallback
        requireConfirmation: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
        return true;
      } else {
        // Handle different error types
        if (result.error === 'user_cancel') {
          // User cancelled - don't show error
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
          Alert.alert('Authentication Failed', 'Authentication was not successful. Please try again.');
        }
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Authentication Error', 'An error occurred during authentication. Please try again.');
      return false;
    } finally {
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