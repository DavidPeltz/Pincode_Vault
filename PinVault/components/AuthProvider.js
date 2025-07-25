import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';
import PropTypes from 'prop-types';

/**
 * @fileoverview Authentication provider for PIN Vault
 * 
 * This module provides biometric and device authentication capabilities using
 * Expo Local Authentication. It supports Face ID, Touch ID, fingerprint,
 * iris recognition, and device PIN/pattern/password authentication.
 */

/**
 * Authentication context value structure
 * @typedef {Object} AuthContextValue
 * @property {boolean} isAuthenticated - Current authentication state
 * @property {boolean} authenticationInProgress - Whether authentication is in progress
 * @property {string|null} biometricType - Type of biometric authentication available
 * @property {boolean} isAuthAvailable - Whether any authentication method is available
 * @property {Function} authenticate - Function to trigger authentication
 * @property {Function} logout - Function to clear authentication state
 * @property {Function} resetAuthentication - Function to reset authentication state
 * @property {Function} checkAuthenticationAvailability - Function to check auth availability
 */

/**
 * Authentication context for sharing auth state across components
 * @type {React.Context<AuthContextValue>}
 */
const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * 
 * @function useAuth
 * @returns {AuthContextValue} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * const { authenticate, isAuthenticated, biometricType } = useAuth();
 * 
 * const handleSecureAction = async () => {
 *   const success = await authenticate('Access secure feature');
 *   if (success) {
 *     // Perform secure action
 *   }
 * };
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * 
 * Provides biometric and device authentication capabilities to child components.
 * Automatically detects available authentication methods and manages auth state.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with auth context
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticationInProgress, setAuthenticationInProgress] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isAuthAvailable, setIsAuthAvailable] = useState(false);

  useEffect(() => {
    checkAuthenticationAvailability();
  }, []);

  /**
   * Checks device authentication capabilities and updates state
   * 
   * Determines what authentication methods are available on the device
   * and sets appropriate state variables for UI display and functionality.
   * 
   * @async
   * @function checkAuthenticationAvailability
   * @returns {Promise<void>}
   * 
   * @example
   * await checkAuthenticationAvailability();
   * console.log(biometricType); // 'Face ID', 'Fingerprint', etc.
   */
  const checkAuthenticationAvailability = async () => {
    try {
      // Check if device has authentication hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setIsAuthAvailable(false);
        return;
      }

      // Check if device has biometric records enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
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

  /**
   * Triggers device authentication with customizable prompt
   * 
   * Initiates biometric or device authentication flow. Handles various
   * authentication states and provides appropriate user feedback.
   * 
   * @async
   * @function authenticate
   * @param {string} [reason='Please authenticate to access PIN editing'] - Reason shown to user
   * @returns {Promise<boolean>} True if authentication successful, false otherwise
   * 
   * @example
   * const success = await authenticate('Authenticate to delete grid');
   * if (success) {
   *   deleteGrid(gridId);
   * } else {
   *   console.log('Authentication failed or cancelled');
   * }
   */
  const authenticate = async (reason = 'Please authenticate to access PIN editing') => {
    if (authenticationInProgress) {
      return false;
    }

    if (!isAuthAvailable) {
      Alert.alert(
        'Authentication Not Available',
        'This device does not have device authentication configured. Please set up device security (PIN, Pattern, Password, Face ID, or Fingerprint) in your system settings.',
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

  /**
   * Clears authentication state (logout)
   * 
   * @function logout
   * @returns {void}
   * 
   * @example
   * logout(); // User will need to authenticate again
   */
  const logout = () => {
    setIsAuthenticated(false);
  };

  /**
   * Resets authentication state (used when app goes to background)
   * 
   * @function resetAuthentication
   * @returns {void}
   * 
   * @example
   * // Called when app loses focus for security
   * resetAuthentication();
   */
  const resetAuthentication = () => {
    setIsAuthenticated(false);
  };

  /**
   * Context value provided to child components
   * @type {AuthContextValue}
   */
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

/**
 * PropTypes for AuthProvider component
 */
AuthProvider.propTypes = {
  /** Child components to wrap with authentication context */
  children: PropTypes.node.isRequired,
};