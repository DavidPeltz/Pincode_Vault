import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import Gallery from './components/Gallery';
import GridEditor from './components/GridEditor';
import SecurityInfoModal from './components/SecurityInfo';
import { AuthProvider } from './components/AuthProvider';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import InfoButton from './components/InfoButton';

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme, isDarkMode } = useTheme();
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  
  const HeaderRight = ({ showSecurityButton = false, navigation }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 5 }}>
      {showSecurityButton && (
        <TouchableOpacity
          style={{
            backgroundColor: theme.purple,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
          }}
          onPress={() => setSecurityModalVisible(true)}
        >
          <Text style={{ fontSize: 12, color: 'white' }}>🔐</Text>
        </TouchableOpacity>
      )}
      <ThemeToggle />
    </View>
  );

  const HeaderLeft = () => (
    <View style={{ marginLeft: 5 }}>
      <InfoButton />
    </View>
  );
  
  return (
    <>
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
            options={({ navigation }) => ({
              title: 'PIN Vault',
              headerTitleAlign: 'center',
              headerStyle: {
                backgroundColor: theme.surface,
              },
              headerTintColor: theme.text,
              headerTitleStyle: {
                fontWeight: 'bold',
                color: theme.text,
              },
              headerLeft: () => <HeaderLeft />,
              headerRight: () => <HeaderRight showSecurityButton={true} navigation={navigation} />,
            })}
          />
          <Stack.Screen
            name="GridEditor"
            component={GridEditor}
            options={({ navigation }) => ({
              title: 'PIN Grid Editor',
              headerTitleAlign: 'center',
              headerStyle: {
                backgroundColor: theme.primary,
              },
              headerLeft: () => <HeaderLeft />,
              headerRight: () => <HeaderRight showSecurityButton={true} navigation={navigation} />,
            })}
          />

        </Stack.Navigator>
        </NavigationContainer>
      
      <SecurityInfoModal
        visible={securityModalVisible}
        onClose={() => setSecurityModalVisible(false)}
      />
    </>
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
