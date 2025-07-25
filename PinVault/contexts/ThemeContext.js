import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

/**
 * @fileoverview Theme management system for PIN Vault
 * 
 * Provides light and dark theme support with persistent user preferences.
 * Includes predefined color schemes optimized for accessibility and
 * visual clarity in both light and dark environments.
 */

/**
 * Color theme structure
 * @typedef {Object} Theme
 * @property {string} background - Primary background color
 * @property {string} surface - Surface/card background color
 * @property {string} primary - Primary accent color
 * @property {string} text - Primary text color
 * @property {string} textSecondary - Secondary text color
 * @property {string} border - Border color
 * @property {string} shadow - Shadow color
 * @property {string} error - Error state color
 * @property {string} success - Success state color
 * @property {string} warning - Warning state color
 * @property {string} danger - Danger/destructive action color
 * @property {string} purple - Purple accent color
 * @property {string} orange - Orange accent color
 * @property {string} green - Green accent color
 * @property {Object} gridColors - Grid cell colors
 * @property {string} gridColors.red - Red grid cell color
 * @property {string} gridColors.green - Green grid cell color
 * @property {string} gridColors.blue - Blue grid cell color
 * @property {string} gridColors.yellow - Yellow grid cell color
 * @property {Object} modal - Modal-specific colors
 * @property {string} modal.background - Modal background color
 * @property {string} modal.overlay - Modal overlay color
 */

/**
 * Theme context value structure
 * @typedef {Object} ThemeContextValue
 * @property {Theme} theme - Current theme object
 * @property {boolean} isDarkMode - Whether dark mode is active
 * @property {Function} toggleTheme - Function to toggle between light/dark themes
 */

/**
 * Theme context for sharing theme state across components
 * @type {React.Context<ThemeContextValue>}
 */
const ThemeContext = createContext();

/**
 * Custom hook to access theme context
 * 
 * @function useTheme
 * @returns {ThemeContextValue} Theme context value
 * @throws {Error} If used outside of ThemeProvider
 * 
 * @example
 * const { theme, isDarkMode, toggleTheme } = useTheme();
 * 
 * return (
 *   <View style={{ backgroundColor: theme.background }}>
 *     <Text style={{ color: theme.text }}>Hello World</Text>
 *     <Button onPress={toggleTheme} title="Toggle Theme" />
 *   </View>
 * );
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Light theme color configuration
 * Optimized for daylight viewing with high contrast and accessibility
 * @type {Theme}
 */
const lightTheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  primary: '#2196F3',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  shadow: '#000000',
  error: '#FF6B6B',
  success: '#4ECDC4',
  warning: '#FF9500',
  danger: '#E74C3C',
  purple: '#9B59B6',
  orange: '#F39C12',
  green: '#27AE60',
  gridColors: {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#6BB6FF',
    yellow: '#FFFF00'
  },
  modal: {
    background: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)'
  }
};

/**
 * Dark theme color configuration
 * Optimized for low-light viewing with reduced eye strain
 * @type {Theme}
 */
const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#BB86FC',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
  shadow: '#000000',
  error: '#CF6679',
  success: '#03DAC6',
  warning: '#FFB74D',
  danger: '#FF5252',
  purple: '#CE93D8',
  orange: '#FFB74D',
  green: '#81C784',
  gridColors: {
    red: '#FF6B6B',
    green: '#4ECDC4',
    blue: '#74B9FF',
    yellow: '#FDCB6E'
  },
  modal: {
    background: '#2C2C2C',
    overlay: 'rgba(0, 0, 0, 0.7)'
  }
};

/**
 * Theme Provider Component
 * 
 * Manages theme state and provides theme switching functionality.
 * Automatically loads user's theme preference from storage and
 * persists theme changes for future app launches.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with theme context
 * 
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Loads user's theme preference from AsyncStorage
   * 
   * @async
   * @function loadThemePreference
   * @returns {Promise<void>}
   * 
   * @example
   * await loadThemePreference();
   * console.log(isDarkMode); // true/false based on stored preference
   */
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  /**
   * Toggles between light and dark themes
   * 
   * Switches the current theme and saves the preference to AsyncStorage
   * for persistence across app launches.
   * 
   * @async
   * @function toggleTheme
   * @returns {Promise<void>}
   * 
   * @example
   * await toggleTheme(); // Switches from light to dark or vice versa
   */
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  /**
   * Current theme object based on isDarkMode state
   * @type {Theme}
   */
  const theme = isDarkMode ? darkTheme : lightTheme;

  /**
   * Context value provided to child components
   * @type {ThemeContextValue}
   */
  const contextValue = {
    theme,
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * PropTypes for ThemeProvider component
 */
ThemeProvider.propTypes = {
  /** Child components to wrap with theme context */
  children: PropTypes.node.isRequired,
};