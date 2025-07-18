import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useNavigationBarHeight = () => {
  const insets = useSafeAreaInsets();
  const [screenData, setScreenData] = useState(Dimensions.get('screen'));
  const [windowData, setWindowData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen, window }) => {
      setScreenData(screen);
      setWindowData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Calculate navigation bar height
  const navigationBarHeight = Platform.OS === 'android' 
    ? Math.max(0, screenData.height - windowData.height)
    : 0;

  // Determine if device is using gesture navigation
  // On Android, gesture navigation typically has navigationBarHeight < 20
  // Button navigation typically has navigationBarHeight >= 48
  const isGestureNavigation = Platform.OS === 'ios' || navigationBarHeight < 20;
  const isButtonNavigation = Platform.OS === 'android' && navigationBarHeight >= 20;

  return {
    navigationBarHeight,
    isGestureNavigation,
    isButtonNavigation,
    safeAreaInsets: insets,
    // Provide safe bottom padding that accounts for navigation type
    safeBottomPadding: isButtonNavigation ? navigationBarHeight : insets.bottom
  };
};