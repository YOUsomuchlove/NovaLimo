'use client';

import type {
  BookingDto,
  CargoDto,
  CustomerDto,
} from '@limousine-workspace/shared-types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DateTime,
  DescriptionList,
  DetailLayout,
  ErrorState,
  Money,
  Phone,
  Skeleton,
  StatusTag,
} from '@limousine-workspace/shared-ui';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi } from '../../../lib/api';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [cargos, setCargos] = useState<CargoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const c = await adminApi.customer(id);
      setCustomer(c);
      const [bRes, cRes] = await Promise.all([
        adminApi.bookings({ q: c.phone, limit: 15 }),
        adminApi.cargos({ q: c.phone, limit: 15 }),
      ]);
      setBookings(bRes.items);
      setCargos(cRes.items);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell
      title="Chi tiết Khách hàng"
      subtitle="Hồ sơ · Lịch sử vé & ký gửi · Ghi chú nội bộ"
      breadcrumbs={[
        { label: 'Khách hàng', href: '/customers' },
        { label: customer?.full_name ?? 'Chi tiết' },
      ]}
      headerExtra={
        <div className="flex items-center gap-2">
          <Link href="/customers">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Danh sách
            </Button>
          </Link>
          {customer && (
            <Link href={`/customers/${customer.id}/edit`}>
              <Button size="sm" leftIcon={<Edit className="size-4" />}>
                Sửa
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
      ) : loading || !customer ? (
        <Card>
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <DetailLayout
          main={
            <>
              {/* Profile Header Card (frame nvCustDetProfile) */}
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar name={customer.full_name} size={64} />
                  <div>
                    <h2 className="text-xl font-bold text-fg">
                      {customer.full_name}
                    </h2>
                    <p className="mt-0.5 text-sm text-fg-secondary">
                      <Phone value={customer.phone} link /> ·{' '}
                      {customer.email || 'Chưa có email'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {customer.tags.map((t) => (
                        <Badge
                          key={t}
                          tone={
                            t.toUpperCase() === 'VIP'
                              ? 'brand'
                              : t.toUpperCase() === 'BLACKLIST'
                                ? 'danger'
                                : 'info'
                          }
                        >
                          {t}
                        </Badge>
                      ))}
                      {customer.note && (
                        <Badge tone="neutral">{customer.note}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Link href={`/customers/${customer.id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="size-4" />}
                  >
                    Chỉnh sửa
                  </Button>
                </Link>
              </Card>

              {/* Recent History (frame nvCustDetHistory) */}
              <Card>
                <CardHeader
                  title="Lịch sử đặt vé & ký gửi gần đây"
                  description="Tự động tổng hợp theo số điện thoại của khách hàng"
                />
                {bookings.length === 0 && cargos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-fg-muted">
                    Khách hàng chưa có lịch sử đặt vé hay ký gửi hàng hóa.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-subtle bg-surface-2 p-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <Badge tone="brand">Vé</Badge>
                          <div>
                            <Link
                              href={`/bookings/${b.id}`}
                              className="font-mono text-sm font-semibold text-brand-fg hover:underline"
                            >
                              {b.code}
                            </Link>
                            <p className="text-xs text-fg-secondary">
                              {b.trip.route.name} ·{' '}
                              <DateTime value={b.trip.departure_at} /> · Ghế{' '}
                              {b.seats.map((s) => s.seat_label).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Money
                            value={b.total_vnd}
                            className="text-sm font-semibold text-fg"
                          />
                          <StatusTag domain="booking" status={b.status} />
                        </div>
                      </div>
                    ))}

                    {cargos.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border-subtle bg-surface-2 p-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <Badge tone="info">Hàng</Badge>
                          <div>
                            <Link
                              href={`/cargos/${c.id}`}
                              className="font-mono text-sm font-semibold text-brand-fg hover:underline"
                            >
                              {c.waybill_code}
                            </Link>
                            <p className="text-xs text-fg-secondary">
                              {c.route.name} · {c.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Money
                            value={c.fee_vnd}
                            className="text-sm font-semibold text-fg"
                          />
                          <StatusTag domain="cargo" status={c.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          }
          aside={
            <Card>
              <CardHeader title="Thống kê giá trị vòng đời (LTV)" />
              <DescriptionList
                columns={1}
                items={[
                  {
                    label: 'Tổng số đơn vé',
                    value: `${customer.booking_count} đơn`,
                  },
                  {
                    label: 'Tổng chi tiêu tích lũy',
                    value: (
                      <Money
                        value={customer.total_spent_vnd}
                        className="text-lg font-bold text-brand-fg"
                      />
                    ),
                  },
                  {
                    label: 'Chuyến đi gần nhất',
                    value: <DateTime value={customer.last_trip_at} />,
                  },
                  {
                    label: 'Ngày tham gia',
                    value: <DateTime value={customer.created_at} />,
                  },
                ]}
              />
            </Card>
          }
        />
      )}
    </AdminShell>
  );
}
