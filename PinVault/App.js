import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import Gallery from './components/Gallery';
import GridEditor from './components/GridEditor';
import SecurityInfo from './components/SecurityInfo';
import { AuthProvider } from './components/AuthProvider';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "auto"} />
      <Stack.Navigator
        initialRouteName="Gallery"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
          <Stack.Screen
            name="Gallery"
            component={Gallery}
            options={{
              title: 'PIN Vault',
              headerStyle: {
                backgroundColor: theme.surface,
              },
              headerTintColor: theme.text,
              headerTitleStyle: {
                fontWeight: 'bold',
                color: theme.text,
              },
            }}
          />
          <Stack.Screen
            name="GridEditor"
            component={GridEditor}
            options={{
              title: 'PIN Grid Editor',
              headerStyle: {
                backgroundColor: theme.primary,
              },
            }}
          />
          <Stack.Screen
            name="SecurityInfo"
            component={SecurityInfo}
            options={{
              title: 'Security Information',
              headerStyle: {
                backgroundColor: theme.purple,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
