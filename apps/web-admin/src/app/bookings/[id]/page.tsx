'use client';

import {
  BOOKING_TRANSITIONS,
  type BookingDto,
  type BookingStatus,
  type PaymentMethod,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DateTime,
  DescriptionList,
  DetailLayout,
  ErrorState,
  MapView,
  Money,
  Phone,
  Skeleton,
  StatusTag,
  Timeline,
  useConfirm,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Modal, Select } from 'antd';
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Printer,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi } from '../../../lib/api';

const STATUS_ACTION_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Xác nhận vé',
  PICKED_UP: 'Đánh dấu Đã đón khách',
  DROPPED_OFF: 'Đánh dấu Đã trả khách',
  NO_SHOW: 'Khách không đến (No-show)',
  CANCELLED: 'Hủy đơn vé',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const confirm = useConfirm();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [paySaving, setPaySaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const b = await adminApi.booking(id);
      setBooking(b);
      setPayMethod(b.payment_method);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleTransition = async (next: BookingStatus) => {
    if (!booking) return;
    const isCancel = next === 'CANCELLED' || next === 'NO_SHOW';
    if (
      isCancel &&
      !(await confirm({
        title: `${STATUS_ACTION_LABELS[next]} · ${booking.code}?`,
        content: 'Ghế sẽ được giải phóng trở lại cho hành khách khác.',
        okText: STATUS_ACTION_LABELS[next],
        danger: true,
      }))
    ) {
      return;
    }
    try {
      const updated = await adminApi.changeBookingStatus(booking.id, next);
      setBooking(updated);
      toast.success(`Đã chuyển trạng thái sang ${STATUS_ACTION_LABELS[next]}`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Không thể chuyển trạng thái',
      );
    }
  };

  const handleRecordPayment = async () => {
    if (!booking) return;
    setPaySaving(true);
    try {
      const updated = await adminApi.recordBookingPayment(
        booking.id,
        payMethod,
      );
      setBooking(updated);
      setPayModalOpen(false);
      toast.success('Đã xác nhận thanh toán vé');
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Không thể xác nhận thanh toán',
      );
    } finally {
      setPaySaving(false);
    }
  };

  const nextStatuses = booking ? BOOKING_TRANSITIONS[booking.status] : [];

  return (
    <AdminShell
      title="Chi tiết đơn vé hành khách"
      subtitle="Xem đầy đủ thông tin đặt vé, thanh toán và lịch sử trạng thái"
      breadcrumbs={[
        { label: 'Đơn hàng & Ký gửi', href: '/bookings' },
        { label: booking?.code ?? 'Chi tiết vé' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/bookings">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Danh sách
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="size-4" />}
            onClick={() => window.print()}
          >
            In phiếu
          </Button>
          {booking && (
            <Link href={`/bookings/${booking.id}/edit`}>
              <Button size="sm" leftIcon={<Edit className="size-4" />}>
                Sửa đơn
              </Button>
            </Link>
          )}
        </div>
      }
    >
      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading || !booking ? (
        <Card className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" rounded="card" />
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <DetailLayout
          main={
            <>
              {/* Hero Card (frame nvOrdP1Det) */}
              <Card className="print-sheet flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-mono text-2xl font-bold text-brand-fg">
                      {booking.code}
                    </h2>
                    <StatusTag domain="booking" status={booking.status} />
                    <StatusTag
                      domain="payment"
                      status={booking.payment_status}
                    />
                  </div>
                  <p className="mt-1 text-sm text-fg-secondary">
                    Tuyến {booking.trip.route.name} · Khởi hành{' '}
                    <DateTime value={booking.trip.departure_at} />
                  </p>
                </div>

                <div className="no-print flex flex-wrap items-center gap-2">
                  {booking.payment_status !== 'PAID' &&
                    booking.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        leftIcon={<CheckCircle2 className="size-4" />}
                        onClick={() => setPayModalOpen(true)}
                      >
                        Xác nhận thu tiền
                      </Button>
                    )}
                  {nextStatuses.map((st) => (
                    <Button
                      key={st}
                      size="sm"
                      variant={
                        st === 'CANCELLED' || st === 'NO_SHOW'
                          ? 'danger'
                          : 'secondary'
                      }
                      onClick={() => void handleTransition(st)}
                    >
                      {STATUS_ACTION_LABELS[st]}
                    </Button>
                  ))}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={load}
                    aria-label="Làm mới"
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
              </Card>

              {/* Main Info Card */}
              <Card className="print-sheet">
                <CardHeader title="Thông tin đơn vé" />
                <DescriptionList
                  columns={2}
                  items={[
                    { label: 'Mã đơn', value: booking.code },
                    {
                      label: 'Khách hàng liên hệ',
                      value: booking.contact_name,
                    },
                    {
                      label: 'Số điện thoại',
                      value: <Phone value={booking.contact_phone} link />,
                    },
                    { label: 'Email', value: booking.contact_email ?? '—' },
                    {
                      label: 'Số ghế & Danh sách hành khách',
                      value: (
                        <div className="flex flex-wrap gap-2">
                          {booking.seats.map((s) => (
                            <Badge key={s.seat_label} tone="brand">
                              Ghế {s.seat_label} ({s.tier}) — {s.passenger_name}
                            </Badge>
                          ))}
                        </div>
                      ),
                      full: true,
                    },
                    {
                      label: 'Địa chỉ đón (PostGIS)',
                      value: `${booking.pickup.address} (${booking.pickup.location.lat.toFixed(4)}, ${booking.pickup.location.lng.toFixed(4)})`,
                      full: true,
                    },
                    {
                      label: 'Địa chỉ trả (PostGIS)',
                      value: `${booking.dropoff.address} (${booking.dropoff.location.lat.toFixed(4)}, ${booking.dropoff.location.lng.toFixed(4)})`,
                      full: true,
                    },
                    {
                      label: 'Phương thức thanh toán',
                      value: booking.payment_method,
                    },
                    { label: 'Kênh đặt', value: booking.source },
                    {
                      label: 'Tổng tiền',
                      value: (
                        <Money
                          value={booking.total_vnd}
                          className="text-lg font-bold text-brand-fg"
                        />
                      ),
                    },
                    {
                      label: 'Chuyến xe đã xếp',
                      value: booking.trip_run_id ? (
                        <Link
                          href={`/trip-runs/${booking.trip_run_id}`}
                          className="font-semibold text-brand-fg hover:underline"
                        >
                          Xem chuyến chạy (Thứ tự đón #
                          {booking.pickup_order ?? '—'})
                        </Link>
                      ) : (
                        <Link
                          href={`/dispatch/${booking.trip.id}`}
                          className="text-brand-fg hover:underline"
                        >
                          Chưa xếp xe — Mở rổ điều phối →
                        </Link>
                      ),
                    },
                    {
                      label: 'Ghi chú',
                      value: booking.note ?? 'Không có ghi chú',
                      full: true,
                    },
                  ]}
                />
              </Card>

              {/* PostGIS Map */}
              <Card className="no-print">
                <CardHeader
                  title="Bản đồ điểm đón / trả PostGIS"
                  description="Vị trí đón (xanh) và trả (vàng) của hành khách"
                />
                <MapView
                  height={280}
                  markers={[
                    {
                      id: 'pickup',
                      lat: booking.pickup.location.lat,
                      lng: booking.pickup.location.lng,
                      label: 'Đ',
                      title: `Đón: ${booking.pickup.address}`,
                      tone: 'info',
                    },
                    {
                      id: 'dropoff',
                      lat: booking.dropoff.location.lat,
                      lng: booking.dropoff.location.lng,
                      label: 'T',
                      title: `Trả: ${booking.dropoff.address}`,
                      tone: 'brand',
                    },
                  ]}
                />
              </Card>
            </>
          }
          aside={
            <Card>
              <CardHeader
                title="Lịch sử trạng thái"
                description="Dấu thời gian xử lý vé"
              />
              <Timeline
                items={[
                  {
                    title: 'Khởi tạo đơn vé',
                    time: <DateTime value={booking.created_at} />,
                    description: `Kênh: ${booking.source} · ${booking.seats.length} ghế`,
                    tone: 'brand',
                  },
                  ...(booking.payment_status === 'PAID'
                    ? [
                        {
                          title: 'Đã thanh toán',
                          description: `Phương thức: ${booking.payment_method}`,
                          tone: 'success' as const,
                        },
                      ]
                    : []),
                  ...(booking.picked_up_at
                    ? [
                        {
                          title: 'Tài xế đã đón khách',
                          time: <DateTime value={booking.picked_up_at} />,
                          tone: 'info' as const,
                        },
                      ]
                    : []),
                  ...(booking.dropped_off_at
                    ? [
                        {
                          title: 'Đã trả khách hoàn tất',
                          time: <DateTime value={booking.dropped_off_at} />,
                          tone: 'success' as const,
                        },
                      ]
                    : []),
                  ...(booking.cancelled_at
                    ? [
                        {
                          title: 'Đã hủy vé',
                          time: <DateTime value={booking.cancelled_at} />,
                          description: booking.cancel_reason ?? undefined,
                          tone: 'danger' as const,
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
          }
        />
      )}

      <Modal
        open={payModalOpen}
        onCancel={() => setPayModalOpen(false)}
        title={`Ghi nhận thanh toán · ${booking?.code ?? ''}`}
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-fg-secondary">
            Số tiền cần thu:{' '}
            <Money
              value={booking?.total_vnd ?? 0}
              className="font-bold text-brand-fg"
            />
          </p>
          <Select
            className="w-full"
            value={payMethod}
            onChange={(v) => setPayMethod(v)}
            options={[
              { value: 'CASH', label: 'Tiền mặt' },
              { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
              { value: 'VNPAY', label: 'VNPay' },
              { value: 'MOMO', label: 'Ví MoMo' },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPayModalOpen(false)}>
              Hủy
            </Button>
            <Button loading={paySaving} onClick={handleRecordPayment}>
              Xác nhận đã thu tiền
            </Button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
