'use client';

import type {
  BookingDto,
  BookingSource,
  BookingStatus,
  CargoDto,
  CargoStatus,
  PaymentStatus,
} from '@limousine-workspace/shared-types';
import {
  Badge,
  Button,
  DataTable,
  DateTime,
  FilterBar,
  Money,
  Phone,
  SegmentedControl,
  StatusTag,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircle2,
  Edit,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import { adminApi, exportToCsv } from '../../lib/api';

type OrdersTab = 'bookings' | 'cargos';

export default function BookingsPage() {
  const router = useRouter();
  const toast = useToast();

  const [tab, setTab] = useState<OrdersTab>('bookings');

  // Bookings state
  const [bookings, setBookings] = useState<BookingDto[] | undefined>(undefined);
  const [bTotal, setBTotal] = useState(0);
  const [bPage, setBPage] = useState(1);
  const [bLimit, setBLimit] = useState(15);
  const [bQuery, setBQuery] = useState('');
  const [bStatus, setBStatus] = useState<BookingStatus | ''>('');
  const [bPayment, setBPayment] = useState<PaymentStatus | ''>('');
  const [bSource, setBSource] = useState<BookingSource | ''>('');
  const [bUnassigned, setBUnassigned] = useState<boolean>(false);
  const [bLoading, setBLoading] = useState(false);
  const [bError, setBError] = useState<unknown>(null);

  // Cargos state (nvOrdPanel2)
  const [cargos, setCargos] = useState<CargoDto[] | undefined>(undefined);
  const [cTotal, setCTotal] = useState(0);
  const [cPage, setCPage] = useState(1);
  const [cLimit, setCLimit] = useState(15);
  const [cQuery, setCQuery] = useState('');
  const [cStatus, setCStatus] = useState<CargoStatus | ''>('');
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError] = useState<unknown>(null);

  const loadBookings = useCallback(async () => {
    setBLoading(true);
    setBError(null);
    try {
      const res = await adminApi.bookings({
        page: bPage,
        limit: bLimit,
        q: bQuery.trim() || undefined,
        status: bStatus || undefined,
        payment_status: bPayment || undefined,
        source: bSource || undefined,
        unassigned: bUnassigned ? 1 : undefined,
      });
      setBookings(res.items);
      setBTotal(res.total);
    } catch (e) {
      setBError(e);
    } finally {
      setBLoading(false);
    }
  }, [bPage, bLimit, bQuery, bStatus, bPayment, bSource, bUnassigned]);

  const loadCargos = useCallback(async () => {
    setCLoading(true);
    setCError(null);
    try {
      const res = await adminApi.cargos({
        page: cPage,
        limit: cLimit,
        q: cQuery.trim() || undefined,
        status: cStatus || undefined,
      });
      setCargos(res.items);
      setCTotal(res.total);
    } catch (e) {
      setCError(e);
    } finally {
      setCLoading(false);
    }
  }, [cPage, cLimit, cQuery, cStatus]);

  useEffect(() => {
    if (tab === 'bookings') void loadBookings();
    else void loadCargos();
  }, [tab, loadBookings, loadCargos]);

  const bookingColumns: ColumnsType<BookingDto> = useMemo(
    () => [
      {
        title: 'Mã vé & Kênh',
        key: 'code',
        render: (_, b) => (
          <div>
            <Link
              href={`/bookings/${b.id}`}
              className="font-mono text-sm font-semibold text-brand-fg hover:underline"
            >
              {b.code}
            </Link>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted">
              <span>
                {b.source === 'CALL_CENTER'
                  ? 'Tổng đài'
                  : b.source === 'ADMIN'
                    ? 'Admin'
                    : 'Web đặt vé'}
              </span>
              <span>·</span>
              <DateTime value={b.created_at} mode="datetime" />
            </div>
          </div>
        ),
      },
      {
        title: 'Hành khách & SĐT',
        key: 'contact',
        render: (_, b) => (
          <div>
            <p className="text-sm font-semibold text-fg">{b.contact_name}</p>
            <Phone
              value={b.contact_phone}
              link
              className="text-xs text-fg-secondary"
            />
          </div>
        ),
      },
      {
        title: 'Chuyến & Ghế',
        key: 'trip',
        render: (_, b) => (
          <div>
            <p className="text-ui font-medium text-fg">{b.trip.route.name}</p>
            <p className="text-xs text-fg-muted">
              <DateTime value={b.trip.departure_at} /> · Ghế:{' '}
              <span className="font-mono font-semibold text-brand-fg">
                {b.seats.map((s) => s.seat_label).join(', ')}
              </span>
            </p>
          </div>
        ),
      },
      {
        title: 'Địa chỉ đón / trả (PostGIS)',
        key: 'places',
        render: (_, b) => (
          <div className="max-w-xs text-xs">
            <p className="truncate text-fg">
              <span className="text-fg-muted">Đón:</span> {b.pickup.address}
            </p>
            <p className="mt-0.5 truncate text-fg-secondary">
              <span className="text-fg-muted">Trả:</span> {b.dropoff.address}
            </p>
          </div>
        ),
      },
      {
        title: 'Tổng tiền & TT',
        key: 'payment',
        render: (_, b) => (
          <div>
            <Money
              value={b.total_vnd}
              className="text-sm font-semibold text-fg"
            />
            <div className="mt-1">
              <StatusTag domain="payment" status={b.payment_status} />
            </div>
          </div>
        ),
      },
      {
        title: 'Trạng thái vé',
        dataIndex: 'status',
        key: 'status',
        render: (s: BookingStatus) => <StatusTag domain="booking" status={s} />,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, b) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {b.payment_status !== 'PAID' && b.status !== 'CANCELLED' && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<CheckCircle2 className="size-3.5" />}
                onClick={async () => {
                  try {
                    await adminApi.recordBookingPayment(b.id, b.payment_method);
                    toast.success(`Đã xác nhận thu tiền vé ${b.code}`);
                    void loadBookings();
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : 'Không thể ghi nhận thanh toán',
                    );
                  }
                }}
              >
                Thu tiền
              </Button>
            )}
            <Link href={`/bookings/${b.id}`}>
              <Button size="icon-sm" variant="ghost" aria-label="Xem vé">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/bookings/${b.id}/edit`}>
              <Button size="icon-sm" variant="ghost" aria-label="Sửa vé">
                <Edit className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [loadBookings, toast],
  );

  const cargoColumns: ColumnsType<CargoDto> = useMemo(
    () => [
      {
        title: 'Mã vận đơn',
        key: 'waybill',
        render: (_, c) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/cargos/${c.id}`}
                className="font-mono text-sm font-semibold text-brand-fg hover:underline"
              >
                {c.waybill_code}
              </Link>
              <Badge tone="info">Hành khách ảo</Badge>
            </div>
            <p className="text-xs text-fg-muted">
              {c.route.name} · Cỡ {c.size} ({c.weight_kg} kg)
            </p>
          </div>
        ),
      },
      {
        title: 'Điểm nhận (Người gửi)',
        key: 'sender',
        render: (_, c) => (
          <div className="max-w-xs text-xs">
            <p className="font-semibold text-fg">
              {c.sender.name} · <Phone value={c.sender.phone} />
            </p>
            <p className="truncate text-fg-muted">{c.sender.address}</p>
          </div>
        ),
      },
      {
        title: 'Điểm giao (Người nhận)',
        key: 'receiver',
        render: (_, c) => (
          <div className="max-w-xs text-xs">
            <p className="font-semibold text-fg">
              {c.receiver.name} · <Phone value={c.receiver.phone} />
            </p>
            <p className="truncate text-fg-muted">{c.receiver.address}</p>
          </div>
        ),
      },
      {
        title: 'Phí & COD',
        key: 'fee',
        render: (_, c) => (
          <div className="text-xs">
            <div>
              Cước:{' '}
              <Money value={c.fee_vnd} className="font-semibold text-fg" />
            </div>
            <div className="text-fg-muted">
              COD:{' '}
              {c.cod_amount_vnd > 0 ? (
                <Money value={c.cod_amount_vnd} className="text-brand-fg" />
              ) : (
                'Không'
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: CargoStatus) => <StatusTag domain="cargo" status={s} />,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'right',
        render: (_, c) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/cargos/${c.id}`}>
              <Button size="icon-sm" variant="ghost" aria-label="Xem vận đơn">
                <Eye className="size-4" />
              </Button>
            </Link>
            <Link href={`/cargos/${c.id}/edit`}>
              <Button size="icon-sm" variant="ghost" aria-label="Sửa vận đơn">
                <Edit className="size-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell
      title="Quản lý Đơn hàng & Ký gửi Hàng hóa"
      subtitle="Tra cứu tập trung vé hành khách & vận đơn ký gửi · Hỗ trợ tổng đài"
      breadcrumbs={[{ label: 'Điều phối' }, { label: 'Đơn hàng & Ký gửi' }]}
    >
      <div className="flex flex-col gap-6">
        {/* Top Tabs & Primary Actions (frame nvOrdPage + nvOrdPanel2) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SegmentedControl<OrdersTab>
            ariaLabel="Chọn Vé Hành Khách hoặc Ký Gửi Hàng Hóa"
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'bookings',
                label: `Vé Hành Khách (${bTotal || bookings?.length || 0})`,
                icon: <Ticket className="size-4" />,
              },
              {
                value: 'cargos',
                label: `Ký Gửi Hàng Hóa (${cTotal || cargos?.length || 0})`,
                icon: <Package className="size-4" />,
              },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            {tab === 'bookings' ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!bookings?.length) return;
                    exportToCsv('novalimo-bookings.csv', bookings, [
                      { header: 'Mã vé', value: (r) => r.code },
                      { header: 'Khách hàng', value: (r) => r.contact_name },
                      { header: 'SĐT', value: (r) => r.contact_phone },
                      { header: 'Tuyến', value: (r) => r.trip.route.name },
                      {
                        header: 'Khởi hành',
                        value: (r) => r.trip.departure_at,
                      },
                      {
                        header: 'Ghế',
                        value: (r) =>
                          r.seats.map((s) => s.seat_label).join(' '),
                      },
                      { header: 'Tổng tiền', value: (r) => r.total_vnd },
                      { header: 'Trạng thái', value: (r) => r.status },
                    ]);
                  }}
                >
                  Xuất CSV
                </Button>
                <Link href="/bookings/new">
                  <Button leftIcon={<Plus className="size-4" />}>
                    Tạo vé thủ công (tổng đài)
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/cargos/new">
                <Button leftIcon={<Plus className="size-4" />}>
                  Tạo đơn ký gửi thủ công
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Panel 1: Passenger Bookings */}
        {tab === 'bookings' ? (
          <DataTable<BookingDto>
            columns={bookingColumns}
            data={bookings}
            rowKey="id"
            loading={bLoading}
            error={bError}
            onRetry={loadBookings}
            onRowClick={(row) => router.push(`/bookings/${row.id}`)}
            pagination={{
              page: bPage,
              pageSize: bLimit,
              total: bTotal,
              onChange: (p, ps) => {
                setBPage(p);
                setBLimit(ps);
              },
            }}
            toolbar={
              <FilterBar
                search={{
                  value: bQuery,
                  onChange: (v) => {
                    setBQuery(v);
                    setBPage(1);
                  },
                  placeholder: 'Tìm theo mã vé, họ tên, SĐT hành khách…',
                }}
                onReset={
                  bQuery || bStatus || bPayment || bSource || bUnassigned
                    ? () => {
                        setBQuery('');
                        setBStatus('');
                        setBPayment('');
                        setBSource('');
                        setBUnassigned(false);
                        setBPage(1);
                      }
                    : undefined
                }
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="size-3.5" />}
                    onClick={loadBookings}
                  >
                    Làm mới
                  </Button>
                }
              >
                <Select
                  className="w-full sm:w-44"
                  value={bStatus}
                  onChange={(v) => {
                    setBStatus(v);
                    setBPage(1);
                  }}
                  options={[
                    { value: '', label: 'Trạng thái: Tất cả' },
                    { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
                    { value: 'CONFIRMED', label: 'Đã xác nhận' },
                    { value: 'PICKED_UP', label: 'Đã đón' },
                    { value: 'DROPPED_OFF', label: 'Đã trả' },
                    { value: 'NO_SHOW', label: 'Không đến' },
                    { value: 'CANCELLED', label: 'Đã hủy' },
                  ]}
                />
                <Select
                  className="w-full sm:w-44"
                  value={bPayment}
                  onChange={(v) => {
                    setBPayment(v);
                    setBPage(1);
                  }}
                  options={[
                    { value: '', label: 'Thanh toán: Tất cả' },
                    { value: 'UNPAID', label: 'Chưa thanh toán' },
                    { value: 'PENDING', label: 'Chờ CK' },
                    { value: 'PAID', label: 'Đã thanh toán' },
                    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
                  ]}
                />
                <Select
                  className="w-full sm:w-40"
                  value={bSource}
                  onChange={(v) => {
                    setBSource(v);
                    setBPage(1);
                  }}
                  options={[
                    { value: '', label: 'Kênh: Tất cả' },
                    { value: 'WEB', label: 'Web đặt vé' },
                    { value: 'CALL_CENTER', label: 'Tổng đài' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                />
                <Button
                  size="sm"
                  variant={bUnassigned ? 'primary' : 'secondary'}
                  onClick={() => {
                    setBUnassigned((v) => !v);
                    setBPage(1);
                  }}
                >
                  Chưa xếp xe
                </Button>
              </FilterBar>
            }
            empty={{
              title: 'Chưa có đơn vé hành khách nào',
              description: 'Tạo vé thủ công hoặc đổi bộ lọc để tra cứu.',
              action: (
                <Link href="/bookings/new">
                  <Button size="sm" leftIcon={<Plus className="size-4" />}>
                    Tạo vé thủ công
                  </Button>
                </Link>
              ),
            }}
          />
        ) : (
          /* Panel 2: Cargo Orders (nvOrdPanel2) */
          <DataTable<CargoDto>
            columns={cargoColumns}
            data={cargos}
            rowKey="id"
            loading={cLoading}
            error={cError}
            onRetry={loadCargos}
            onRowClick={(row) => router.push(`/cargos/${row.id}`)}
            pagination={{
              page: cPage,
              pageSize: cLimit,
              total: cTotal,
              onChange: (p, ps) => {
                setCPage(p);
                setCLimit(ps);
              },
            }}
            toolbar={
              <FilterBar
                search={{
                  value: cQuery,
                  onChange: (v) => {
                    setCQuery(v);
                    setCPage(1);
                  },
                  placeholder: 'Tìm theo mã vận đơn, SĐT người gửi/nhận…',
                }}
                onReset={
                  cQuery || cStatus
                    ? () => {
                        setCQuery('');
                        setCStatus('');
                        setCPage(1);
                      }
                    : undefined
                }
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="size-3.5" />}
                    onClick={loadCargos}
                  >
                    Làm mới
                  </Button>
                }
              >
                <Select
                  className="w-full sm:w-44"
                  value={cStatus}
                  onChange={(v) => {
                    setCStatus(v);
                    setCPage(1);
                  }}
                  options={[
                    { value: '', label: 'Trạng thái: Tất cả' },
                    { value: 'CREATED', label: 'Chờ nhận' },
                    { value: 'PICKED_UP', label: 'Đã nhận' },
                    { value: 'IN_TRANSIT', label: 'Đang vận chuyển' },
                    { value: 'DELIVERED', label: 'Đã giao' },
                    { value: 'RETURNED', label: 'Hoàn trả' },
                    { value: 'CANCELLED', label: 'Đã hủy' },
                  ]}
                />
              </FilterBar>
            }
            empty={{
              title: 'Chưa có vận đơn ký gửi nào',
              description: 'Khởi tạo vận đơn ký gửi hàng hóa mới.',
              action: (
                <Link href="/cargos/new">
                  <Button size="sm" leftIcon={<Plus className="size-4" />}>
                    Tạo đơn ký gửi
                  </Button>
                </Link>
              ),
            }}
          />
        )}
      </div>
    </AdminShell>
  );
}
