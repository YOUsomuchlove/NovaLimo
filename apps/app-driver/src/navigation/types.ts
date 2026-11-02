import type { NavigatorScreenParams } from '@react-navigation/native';
import type { DriverMyRunWithBookings } from '@limousine-workspace/shared-types/legacy';

export type TripsStackParamList = {
  Home: undefined;
  TripDetail: { run: DriverMyRunWithBookings };
  ActiveNav: { runId: string };
  Passengers: { runId: string };
  Sos: undefined;
  Notifications: undefined;
  Income: undefined;
  Profile: undefined;
};

export type CargoTabStackParamList = {
  CargoPick: undefined;
  Cargo: { runId: string; cargoId?: string };
  CargoScan: { runId?: string };
  CargoCod: undefined;
  CargoTransfer: { cargoId?: string };
};

export type MainTabParamList = {
  Trips: NavigatorScreenParams<TripsStackParamList>;
  Cargo: NavigatorScreenParams<CargoTabStackParamList>;
  Chat: undefined;
  Shift: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Permissions: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};
