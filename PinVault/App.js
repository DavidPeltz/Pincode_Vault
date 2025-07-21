import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Gallery from './components/Gallery';
import GridEditor from './components/GridEditor';
import SecurityInfoModal from './components/SecurityInfo';
import { AuthProvider } from './components/AuthProvider';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import InfoButton from './components/InfoButton';
import BackupButton from './components/BackupButton';
import GridRefreshContext from './contexts/GridRefreshContext';

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme, isDarkMode } = useTheme();
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [gridRefreshCallback, setGridRefreshCallback] = useState(null);
  
  const HeaderRight = ({ showSecurityButton = false, navigation }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 5 }}>
      {showSecurityButton && (
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.purple,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
          onPress={() => setSecurityModalVisible(true)}
        >
          <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>🔐</Text>
        </TouchableOpacity>
      )}
      <ThemeToggle />
    </View>
  );

  const HeaderLeft = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 5 }}>
      <InfoButton />
      <BackupButton onGridsUpdated={gridRefreshCallback} />
    </View>
  );
  
  return (
    <GridRefreshContext.Provider value={{ setGridRefreshCallback }}>
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
              title: 'PIN Vault v1.5',
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
              title: 'PIN Grid Editor v1.5',
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
    </GridRefreshContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
