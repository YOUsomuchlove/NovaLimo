import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActiveNavigationScreen } from '../screens/ActiveNavigationScreen';
import { CargoScreen } from '../screens/CargoScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { EndShiftScreen } from '../screens/EndShiftScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: true }}
        initialRouteName="Login"
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Đăng nhập' }}
        />
        <Stack.Screen
          name="Permissions"
          component={PermissionsScreen}
          options={{ title: 'Quyền' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Chuyến của tôi' }}
        />
        <Stack.Screen
          name="TripDetail"
          component={TripDetailScreen}
          options={{ title: 'Phơi lệnh' }}
        />
        <Stack.Screen
          name="ActiveNav"
          component={ActiveNavigationScreen}
          options={{ title: 'Điều hướng' }}
        />
        <Stack.Screen
          name="Cargo"
          component={CargoScreen}
          options={{ title: 'Hàng hóa' }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'Chat' }}
        />
        <Stack.Screen
          name="EndShift"
          component={EndShiftScreen}
          options={{ title: 'Kết thúc ca' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
