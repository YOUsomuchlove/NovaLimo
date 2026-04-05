import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { LoginScreen } from '../screens/LoginScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { C, FONT } from '../theme/tokens';
import { MainNavigator } from './MainNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const stackOpts = {
  headerStyle: { backgroundColor: C.card },
  headerTintColor: C.gold,
  headerTitleStyle: { fontFamily: FONT.semibold, color: C.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: C.bg },
};

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Permissions"
        component={PermissionsScreen}
        options={{ title: 'Quyền truy cập' }}
      />
      <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
