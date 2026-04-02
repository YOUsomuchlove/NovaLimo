import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { RootNavigator } from '../navigation/RootNavigator';

export const App = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  </SafeAreaProvider>
);

export default App;
