import React, { useState, createContext, useContext } from 'react';
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
import BackupButton from './components/BackupButton';

const Stack = createStackNavigator();

// Create context for grid refresh functionality
const GridRefreshContext = createContext();

export const useGridRefresh = () => {
  const context = useContext(GridRefreshContext);
  if (!context) {
    throw new Error('useGridRefresh must be used within a GridRefreshProvider');
  }
  return context;
};

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
    </GridRefreshContext.Provider>
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
