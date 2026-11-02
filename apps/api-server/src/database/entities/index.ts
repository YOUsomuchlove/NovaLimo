import {
  DriverProfileEntity,
  AuditLogEntity,
  OtpCodeEntity,
  PushTokenEntity,
  RefreshTokenEntity,
  RoleEntity,
  UserEntity,
  UserRoleEntity,
} from './identity.entities';
import {
  PriceRuleEntity,
  RouteEntity,
  StopEntity,
  TimeSlotEntity,
  VehicleEntity,
  VehicleTypeEntity,
} from './fleet.entities';
import {
  BookingEntity,
  BookingSeatEntity,
  CustomerEntity,
  PaymentEntity,
  SeatHoldEntity,
  TripBatchEntity,
  TripRunEntity,
} from './trip.entities';
import {
  CargoEntity,
  ChatMessageEntity,
  CodSettlementEntity,
  DriverLocationEntity,
  DriverShiftEntity,
  FinanceTransactionEntity,
  IncidentEntity,
  NotificationEntity,
  SettingEntity,
  SupportTicketEntity,
} from './ops.entities';

export * from './base';
export * from './identity.entities';
export * from './fleet.entities';
export * from './trip.entities';
export * from './ops.entities';

export const ENTITIES = [
  UserEntity,
  DriverProfileEntity,
  RefreshTokenEntity,
  RoleEntity,
  UserRoleEntity,
  AuditLogEntity,
  OtpCodeEntity,
  PushTokenEntity,
  VehicleTypeEntity,
  VehicleEntity,
  RouteEntity,
  StopEntity,
  TimeSlotEntity,
  PriceRuleEntity,
  TripBatchEntity,
  TripRunEntity,
  CustomerEntity,
  BookingEntity,
  BookingSeatEntity,
  SeatHoldEntity,
  PaymentEntity,
  CargoEntity,
  CodSettlementEntity,
  DriverShiftEntity,
  DriverLocationEntity,
  ChatMessageEntity,
  NotificationEntity,
  IncidentEntity,
  FinanceTransactionEntity,
  SupportTicketEntity,
  SettingEntity,
];
