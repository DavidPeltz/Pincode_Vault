import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import Gallery from './components/Gallery';
import GridEditor from './components/GridEditor';
import SecurityInfo from './components/SecurityInfo';
import { AuthProvider } from './components/AuthProvider';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Gallery"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3498DB',
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
                backgroundColor: '#2C3E50',
              },
            }}
          />
          <Stack.Screen
            name="GridEditor"
            component={GridEditor}
            options={{
              title: 'PIN Grid Editor',
              headerStyle: {
                backgroundColor: '#3498DB',
              },
            }}
          />
          <Stack.Screen
            name="SecurityInfo"
            component={SecurityInfo}
            options={{
              title: 'Security Information',
              headerStyle: {
                backgroundColor: '#8E44AD',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
