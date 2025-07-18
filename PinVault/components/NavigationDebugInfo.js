import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigationBarHeight } from '../hooks/useNavigationBarHeight';
import { useTheme } from '../contexts/ThemeContext';

const NavigationDebugInfo = () => {
  const { 
    navigationBarHeight, 
    isGestureNavigation, 
    isButtonNavigation, 
    safeBottomPadding,
    safeAreaInsets 
  } = useNavigationBarHeight();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.primary }]}>Navigation Debug Info</Text>
      <Text style={[styles.info, { color: theme.text }]}>
        Navigation Bar Height: {navigationBarHeight}px
      </Text>
      <Text style={[styles.info, { color: theme.text }]}>
        Navigation Type: {isGestureNavigation ? 'Gesture' : 'Button'}
      </Text>
      <Text style={[styles.info, { color: theme.text }]}>
        Safe Bottom Padding: {safeBottomPadding}px
      </Text>
      <Text style={[styles.info, { color: theme.text }]}>
        Safe Area Bottom: {safeAreaInsets.bottom}px
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  info: {
    fontSize: 12,
    marginBottom: 2,
  },
});

export default NavigationDebugInfo;