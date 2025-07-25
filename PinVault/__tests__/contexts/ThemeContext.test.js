import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <>
      <Text testID="theme-mode">{isDarkMode ? 'dark' : 'light'}</Text>
      <Text testID="background-color">{theme.colors.background}</Text>
      <TouchableOpacity testID="toggle-button" onPress={toggleTheme}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
    </>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
  });

  it('should provide default light theme', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
      expect(getByTestId('background-color').children[0]).toBe('#FFFFFF');
    });
  });

  it('should load saved theme preference from storage', async () => {
    AsyncStorage.getItem.mockResolvedValue('dark');

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('dark');
      expect(getByTestId('background-color').children[0]).toBe('#121212');
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith('themePreference');
  });

  it('should toggle between light and dark themes', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially light
    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
    });

    // Toggle to dark
    fireEvent.press(getByTestId('toggle-button'));

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('dark');
      expect(getByTestId('background-color').children[0]).toBe('#121212');
    });

    // Toggle back to light
    fireEvent.press(getByTestId('toggle-button'));

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
      expect(getByTestId('background-color').children[0]).toBe('#FFFFFF');
    });
  });

  it('should save theme preference to storage when toggled', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
    });

    fireEvent.press(getByTestId('toggle-button'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('themePreference', 'dark');
    });

    fireEvent.press(getByTestId('toggle-button'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('themePreference', 'light');
    });
  });

  it('should handle storage errors gracefully', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should fall back to light theme
    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
    });
  });

  it('should handle invalid theme preference from storage', async () => {
    AsyncStorage.getItem.mockResolvedValue('invalid-theme');

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should fall back to light theme
    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
    });
  });

  it('should provide correct light theme colors', async () => {
    const TestColorsComponent = () => {
      const { theme } = useTheme();
      return (
        <>
          <Text testID="background">{theme.colors.background}</Text>
          <Text testID="surface">{theme.colors.surface}</Text>
          <Text testID="text">{theme.colors.text}</Text>
          <Text testID="primary">{theme.colors.primary}</Text>
          <Text testID="secondary">{theme.colors.secondary}</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <TestColorsComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('background').children[0]).toBe('#FFFFFF');
      expect(getByTestId('surface').children[0]).toBe('#F5F5F5');
      expect(getByTestId('text').children[0]).toBe('#000000');
      expect(getByTestId('primary').children[0]).toBe('#2196F3');
      expect(getByTestId('secondary').children[0]).toBe('#03DAC6');
    });
  });

  it('should provide correct dark theme colors', async () => {
    AsyncStorage.getItem.mockResolvedValue('dark');

    const TestColorsComponent = () => {
      const { theme } = useTheme();
      return (
        <>
          <Text testID="background">{theme.colors.background}</Text>
          <Text testID="surface">{theme.colors.surface}</Text>
          <Text testID="text">{theme.colors.text}</Text>
          <Text testID="primary">{theme.colors.primary}</Text>
          <Text testID="secondary">{theme.colors.secondary}</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <ThemeProvider>
        <TestColorsComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('background').children[0]).toBe('#121212');
      expect(getByTestId('surface').children[0]).toBe('#1E1E1E');
      expect(getByTestId('text').children[0]).toBe('#FFFFFF');
      expect(getByTestId('primary').children[0]).toBe('#BB86FC');
      expect(getByTestId('secondary').children[0]).toBe('#03DAC6');
    });
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    const TestComponentWithoutProvider = () => {
      useTheme();
      return <Text>Test</Text>;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    console.error = originalError;
  });

  it('should persist theme changes across component unmounts', async () => {
    AsyncStorage.getItem.mockResolvedValue('light');

    const { getByTestId, rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
    });

    // Toggle to dark
    fireEvent.press(getByTestId('toggle-button'));

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('dark');
    });

    // Unmount and remount
    rerender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('dark');
    });
  });

  it('should handle storage save errors gracefully', async () => {
    AsyncStorage.setItem.mockRejectedValue(new Error('Save error'));

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('light');
    });

    // Toggle theme - should work even if save fails
    fireEvent.press(getByTestId('toggle-button'));

    await waitFor(() => {
      expect(getByTestId('theme-mode').children[0]).toBe('dark');
    });
  });
});