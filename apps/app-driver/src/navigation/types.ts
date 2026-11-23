import type { NavigatorScreenParams } from '@react-navigation/native';
import type { TripRunDto } from '@limousine-workspace/shared-types';

export type TripsStackParamList = {
  Home: undefined;
  TripDetail: { runId: string; run?: TripRunDto };
  ActiveNav: { runId: string };
  Passengers: { runId: string };
  Sos: { runId?: string } | undefined;
  Notifications: undefined;
  Income: undefined;
  Profile: undefined;
};

export type CargoTabStackParamList = {
  CargoPick: undefined;
  Cargo: { runId?: string; cargoId: string };
  CargoScan: { runId?: string } | undefined;
  CargoCod: { cargoId?: string } | undefined;
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
