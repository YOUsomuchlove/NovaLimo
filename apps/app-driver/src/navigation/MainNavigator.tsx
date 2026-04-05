import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { DriverBottomBar } from '../components/DriverBottomBar';
import { ActiveNavigationScreen } from '../screens/ActiveNavigationScreen';
import { CargoCodScreen } from '../screens/CargoCodScreen';
import { CargoPickScreen } from '../screens/CargoPickScreen';
import { CargoScanScreen } from '../screens/CargoScanScreen';
import { CargoScreen } from '../screens/CargoScreen';
import { CargoTransferScreen } from '../screens/CargoTransferScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { EndShiftScreen } from '../screens/EndShiftScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { IncomeScreen } from '../screens/IncomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PassengersScreen } from '../screens/PassengersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SosScreen } from '../screens/SosScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { C, FONT } from '../theme/tokens';
import type {
  CargoTabStackParamList,
  MainTabParamList,
  TripsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TripsStack = createNativeStackNavigator<TripsStackParamList>();
const CargoStack = createNativeStackNavigator<CargoTabStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: C.card },
  headerTintColor: C.gold,
  headerTitleStyle: { fontFamily: FONT.semibold, color: C.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: C.bg },
};

function TripsStackNavigator() {
  return (
    <TripsStack.Navigator screenOptions={stackScreenOptions}>
      <TripsStack.Screen name="Home" component={HomeScreen} options={{ title: 'Chuyến' }} />
      <TripsStack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Phơi lệnh' }} />
      <TripsStack.Screen name="ActiveNav" component={ActiveNavigationScreen} options={{ title: 'Điều hướng' }} />
      <TripsStack.Screen name="Passengers" component={PassengersScreen} options={{ title: 'Khách' }} />
      <TripsStack.Screen name="Sos" component={SosScreen} options={{ title: 'SOS' }} />
      <TripsStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Thông báo' }} />
      <TripsStack.Screen name="Income" component={IncomeScreen} options={{ title: 'Thu nhập' }} />
      <TripsStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </TripsStack.Navigator>
  );
}

function CargoTabStackNavigator() {
  return (
    <CargoStack.Navigator screenOptions={stackScreenOptions}>
      <CargoStack.Screen name="CargoPick" component={CargoPickScreen} options={{ title: 'Hàng hóa' }} />
      <CargoStack.Screen name="Cargo" component={CargoScreen} options={{ title: 'Chi tiết hàng' }} />
      <CargoStack.Screen name="CargoScan" component={CargoScanScreen} options={{ title: 'Quét QR' }} />
      <CargoStack.Screen name="CargoCod" component={CargoCodScreen} options={{ title: 'COD' }} />
      <CargoStack.Screen name="CargoTransfer" component={CargoTransferScreen} options={{ title: 'Bàn giao' }} />
    </CargoStack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <DriverBottomBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Trips" component={TripsStackNavigator} options={{ title: 'Chuyến' }} />
      <Tab.Screen name="Cargo" component={CargoTabStackNavigator} options={{ title: 'Hàng' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Tab.Screen name="Shift" component={EndShiftScreen} options={{ title: 'Ca' }} />
    </Tab.Navigator>
  );
}
