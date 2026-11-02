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
    PENDING_PAYMENT: { label: 'Chờ thanh toán', tone: 'warning' },
    CONFIRMED: { label: 'Đã xác nhận', tone: 'info' },
    PICKED_UP: { label: 'Đã lên xe', tone: 'brand', pulse: true },
    DROPPED_OFF: { label: 'Đã trả khách', tone: 'success' },
    NO_SHOW: { label: 'Vắng mặt', tone: 'danger' },
    CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
  } satisfies Record<BookingStatus, StatusMeta>,
  payment: {
    UNPAID: { label: 'Chưa thanh toán', tone: 'neutral' },
    PENDING: { label: 'Chờ chuyển khoản', tone: 'warning' },
    PAID: { label: 'Đã thanh toán', tone: 'success' },
    REFUNDED: { label: 'Đã hoàn tiền', tone: 'info' },
    FAILED: { label: 'Thanh toán lỗi', tone: 'danger' },
  } satisfies Record<PaymentStatus, StatusMeta>,
  tripBatch: {
    OPEN: { label: 'Đang bán vé', tone: 'info' },
    CLOSED: { label: 'Ngừng bán', tone: 'neutral' },
    CLUSTERED: { label: 'Đã xếp xe', tone: 'brand' },
    DISPATCHED: { label: 'Đã xuất lệnh', tone: 'brand', pulse: true },
    COMPLETED: { label: 'Hoàn thành', tone: 'success' },
    CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
  } satisfies Record<TripBatchStatus, StatusMeta>,
  tripRun: {
    PENDING: { label: 'Chờ xuất lệnh', tone: 'warning' },
    DISPATCHED: { label: 'Đã xuất lệnh', tone: 'info' },
    IN_PROGRESS: { label: 'Đang chạy', tone: 'brand', pulse: true },
    FINISHED: { label: 'Hoàn thành', tone: 'success' },
    CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
  } satisfies Record<TripRunStatus, StatusMeta>,
  vehicle: {
    AVAILABLE: { label: 'Sẵn sàng', tone: 'success' },
    IN_USE: { label: 'Đang chạy', tone: 'brand', pulse: true },
    MAINTENANCE: { label: 'Bảo dưỡng', tone: 'warning' },
    INACTIVE: { label: 'Ngừng hoạt động', tone: 'neutral' },
  } satisfies Record<VehicleStatus, StatusMeta>,
  cargo: {
    CREATED: { label: 'Chờ lấy hàng', tone: 'warning' },
    PICKED_UP: { label: 'Đã lấy hàng', tone: 'info' },
    IN_TRANSIT: { label: 'Đang vận chuyển', tone: 'brand', pulse: true },
    DELIVERED: { label: 'Đã giao', tone: 'success' },
    RETURNED: { label: 'Hoàn trả', tone: 'danger' },
    CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
  } satisfies Record<CargoStatus, StatusMeta>,
  user: {
    ACTIVE: { label: 'Hoạt động', tone: 'success' },
    INACTIVE: { label: 'Ngừng hoạt động', tone: 'neutral' },
    LOCKED: { label: 'Đã khóa', tone: 'danger' },
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
