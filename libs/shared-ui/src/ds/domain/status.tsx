import type {
  BookingStatus,
  CargoStatus,
  PaymentStatus,
  TripBatchStatus,
  TripRunStatus,
  UserStatus,
  VehicleStatus,
} from '@limousine-workspace/shared-types';
import { Badge, type Tone } from '../primitives/Badge';

type StatusMeta = { label: string; tone: Tone; pulse?: boolean };

/** One place for every status → Vietnamese label + colour, used by admin, booking and driver. */
export const STATUS_META = {
  booking: {
    WAITING: { label: 'Chờ đón', tone: 'info' },
    PICKED_UP: { label: 'Đã lên xe', tone: 'brand', pulse: true },
    DROPPED_OFF: { label: 'Đã trả khách', tone: 'success' },
    CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
  } satisfies Record<BookingStatus, StatusMeta>,
  payment: {
    PENDING: { label: 'Chờ thanh toán', tone: 'warning' },
    PAID: { label: 'Đã thanh toán', tone: 'success' },
    FAILED: { label: 'Thanh toán lỗi', tone: 'danger' },
  } satisfies Record<PaymentStatus, StatusMeta>,
  tripBatch: {
    OPEN: { label: 'Đang nhận khách', tone: 'info' },
    CLUSTERED: { label: 'Đã xếp xe', tone: 'brand' },
    COMPLETED: { label: 'Hoàn thành', tone: 'success' },
  } satisfies Record<TripBatchStatus, StatusMeta>,
  tripRun: {
    PENDING: { label: 'Chờ chạy', tone: 'warning' },
    IN_PROGRESS: { label: 'Đang chạy', tone: 'brand', pulse: true },
    FINISHED: { label: 'Hoàn thành', tone: 'success' },
  } satisfies Record<TripRunStatus, StatusMeta>,
  vehicle: {
    AVAILABLE: { label: 'Sẵn sàng', tone: 'success' },
    IN_USE: { label: 'Đang chạy', tone: 'brand', pulse: true },
    MAINTENANCE: { label: 'Bảo dưỡng', tone: 'warning' },
  } satisfies Record<VehicleStatus, StatusMeta>,
  cargo: {
    PENDING: { label: 'Chờ lấy hàng', tone: 'warning' },
    PICKED_UP: { label: 'Đang vận chuyển', tone: 'brand', pulse: true },
    DELIVERED: { label: 'Đã giao', tone: 'success' },
  } satisfies Record<CargoStatus, StatusMeta>,
  user: {
    ACTIVE: { label: 'Hoạt động', tone: 'success' },
    INACTIVE: { label: 'Ngừng hoạt động', tone: 'neutral' },
  } satisfies Record<UserStatus, StatusMeta>,
} as const;

type Domain = keyof typeof STATUS_META;

export function StatusTag<D extends Domain>({
  domain,
  status,
  size,
  className,
}: {
  domain: D;
  status: keyof (typeof STATUS_META)[D];
  size?: 'sm' | 'md';
  className?: string;
}) {
  const meta = (STATUS_META[domain] as Record<string, StatusMeta>)[
    status as string
  ] ?? {
    label: String(status),
    tone: 'neutral' as Tone,
  };
  return (
    <Badge
      tone={meta.tone}
      dot
      pulse={meta.pulse}
      size={size}
      className={className}
    >
      {meta.label}
    </Badge>
  );
}
