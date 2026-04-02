import type { DriverMyRunWithBookings } from '@limousine-workspace/shared-types';

export type RootStackParamList = {
  Login: undefined;
  Permissions: undefined;
  Home: undefined;
  TripDetail: { run: DriverMyRunWithBookings };
  ActiveNav: { runId: string };
  Cargo: { runId: string };
  Chat: undefined;
  EndShift: undefined;
};
