import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation/RootNavigator';
import { rootNavigationRef } from './navigation/rootNavigation';
import { C } from './theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: C.bg,
    card: C.card,
    primary: C.gold,
    text: C.text,
    border: C.stroke,
    notification: C.gold,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    void onLayout();
  }, [onLayout]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <NavigationContainer ref={rootNavigationRef} theme={navTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
