import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

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
    blue: '#0000FF',
    yellow: '#FFFF00'
  },
  modal: {
    background: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)'
  }
};

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

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

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

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      theme,
      isDarkMode,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};