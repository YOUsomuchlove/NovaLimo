'use client';

import type {
  ChatMessageDto,
  DriverDto,
  PaymentMethod,
  RouteDto,
  SupportTicketDto,
  TicketKind,
  TicketStatus,
  TripBatchDto,
  TripSeatMapDto,
} from '@limousine-workspace/shared-types';
import {
  AddressAutocomplete,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  DateTime,
  EmptyState,
  Field,
  type GeoAddress,
  Input,
  Money,
  Phone,
  SeatMap,
  SegmentedControl,
  StatusTag,
  Stepper,
  Textarea,
  cn,
  useToast,
} from '@limousine-workspace/shared-ui';
import { RealtimeEvents } from '@limousine-workspace/utils-core';
import { Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircle2,
  Headphones,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  Send,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AdminShell } from '../../components/shell/AdminShell';
import {
  type ChatThreadRowDto,
  adminApi,
  resolveUploadUrl,
} from '../../lib/api';
import { getAdminSocket } from '../../lib/socket';

type CallCenterTab = 'create' | 'requests' | 'inbox';

function CallCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const initialTab = (searchParams.get('tab') as CallCenterTab) || 'create';
  const initialDriverId = searchParams.get('driver') || '';

  const [tab, setTab] = useState<CallCenterTab>(
    ['create', 'requests', 'inbox'].includes(initialTab)
      ? initialTab
      : 'create',
  );

  /* ---------- Tab 1: Wizard Tạo vé thủ công (nvCcCreateBooking) ---------- */
  const [step, setStep] = useState(0);
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [routeId, setRouteId] = useState('');
  const [batches, setBatches] = useState<TripBatchDto[]>([]);
  const [batchId, setBatchId] = useState('');
  const [seatMap, setSeatMap] = useState<TripSeatMapDto | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [pickup, setPickup] = useState<GeoAddress>({
    address: '12 Trần Phú, Ba Đình, Hà Nội',
    lat: 21.031,
    lng: 105.841,
  });
  const [dropoff, setDropoff] = useState<GeoAddress>({
    address: 'Bãi Cháy, Hạ Long, Quảng Ninh',
    lat: 20.9599,
    lng: 107.0425,
  });
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [note, setNote] = useState('');
  const [creatingBooking, setCreatingBooking] = useState(false);

  /* ---------- Tab 2: Yêu cầu / CS (nvCcRequests) ---------- */
  const [tickets, setTickets] = useState<SupportTicketDto[] | undefined>(
    undefined,
  );
  const [ticketKind, setTicketKind] = useState<TicketKind | ''>('');
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicketDto | null>(
    null,
  );
  const [ticketNote, setTicketNote] = useState('');
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('IN_PROGRESS');

  /* ---------- Tab 3: Hộp thư hỗ trợ & Chat tài xế (nvCcSupportInbox) ---------- */
  const [threads, setThreads] = useState<ChatThreadRowDto[]>([]);
  const [drivers, setDrivers] = useState<DriverDto[]>([]);
  const [activeDriverId, setActiveDriverId] = useState<string>(initialDriverId);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [chatBody, setChatBody] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    void adminApi
      .routes()
      .then((rts) => {
        setRoutes(rts);
        if (rts[0]) setRouteId(rts[0].id);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!routeId) return;
    void adminApi
      .tripBatches({ route_id: routeId, status: 'OPEN', limit: 20 })
      .then((res) => {
        setBatches(res.items);
        if (res.items[0]) setBatchId(res.items[0].id);
      })
      .catch(() => null);
  }, [routeId]);

  useEffect(() => {
    if (!batchId) return;
    void adminApi
      .tripBatchSeats(batchId)
      .then((sm) => {
        setSeatMap(sm);
        setSelectedSeats([]);
      })
      .catch(() => null);
  }, [batchId]);

  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await adminApi.supportTickets({
        limit: 50,
        kind: ticketKind || undefined,
      });
      setTickets(res.items);
    } catch {
      // ignore
    } finally {
      setTicketsLoading(false);
    }
  }, [ticketKind]);

  const loadInbox = useCallback(async () => {
    try {
      const [tList, dRes] = await Promise.all([
        adminApi.chatThreads(),
        adminApi.drivers({ limit: 50 }),
      ]);
      setThreads(tList);
      setDrivers(dRes.items);
      if (!activeDriverId) {
        const firstId = tList[0]?.driver_id ?? dRes.items[0]?.id ?? '';
        if (firstId) setActiveDriverId(firstId);
      }
    } catch {
      // ignore
    }
  }, [activeDriverId]);

  const loadHistory = useCallback(async (drvId: string) => {
    if (!drvId) return;
    try {
      const hist = await adminApi.chatHistory(drvId);
      setMessages(hist);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (tab === 'requests') void loadTickets();
    if (tab === 'inbox') void loadInbox();
  }, [tab, loadTickets, loadInbox]);

  useEffect(() => {
    if (tab === 'inbox' && activeDriverId) {
      void loadHistory(activeDriverId);
    }
  }, [tab, activeDriverId, loadHistory]);

  // Realtime chat listener
  useEffect(() => {
    const s = getAdminSocket();
    const onMsg = (msg: ChatMessageDto) => {
      if (msg.driver_id === activeDriverId) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
      }
      void loadInbox();
    };
    s.on(RealtimeEvents.chatMessage, onMsg);
    return () => {
      s.off(RealtimeEvents.chatMessage, onMsg);
    };
  }, [activeDriverId, loadInbox]);

  const totalPriceVnd = useMemo(() => {
    if (!seatMap) return 0;
    const priceByLabel = new Map(
      seatMap.seats.map((s) => [s.label, s.price_vnd]),
    );
    return selectedSeats.reduce(
      (s, lbl) => s + (priceByLabel.get(lbl) ?? 0),
      0,
    );
  }, [seatMap, selectedSeats]);

  const handleQuickCreateBooking = async () => {
    if (!batchId || !cName.trim() || !cPhone.trim()) {
      toast.error('Vui lòng nhập Họ tên, SĐT khách hàng và chọn chuyến');
      return;
    }
    const seatsToBook =
      selectedSeats.length > 0
        ? selectedSeats
        : (seatMap?.seats
            .filter((s) => s.remaining > 0)
            .slice(0, 1)
            .map((s) => s.label) ?? []);
    if (seatsToBook.length === 0) {
      toast.error('Chuyến này đã hết ghế trống');
      return;
    }
    setCreatingBooking(true);
    try {
      const created = await adminApi.createBooking({
        trip_batch_id: batchId,
        contact_name: cName.trim(),
        contact_phone: cPhone.trim(),
        pickup: {
          address: pickup.address.trim(),
          lat: pickup.lat ?? 21.0285,
          lng: pickup.lng ?? 105.8542,
        },
        dropoff: {
          address: dropoff.address.trim(),
          lat: dropoff.lat ?? 20.9599,
          lng: dropoff.lng ?? 107.0425,
        },
        passengers: seatsToBook.map((lbl) => ({
          seat_label: lbl,
          name: cName.trim(),
          phone: cPhone.trim(),
        })),
        payment_method: payMethod,
        source: 'CALL_CENTER',
        note: note.trim() || undefined,
      });
      toast.success(`Đã tạo vé tổng đài ${created.code}!`);
      router.push(`/bookings/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tạo vé');
    } finally {
      setCreatingBooking(false);
    }
  };

  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeDriverId || !chatBody.trim()) return;
    setSendingChat(true);
    try {
      const sent = await adminApi.sendChat(activeDriverId, chatBody.trim());
      setMessages((prev) =>
        prev.some((m) => m.id === sent.id) ? prev : [...prev, sent],
      );
      setChatBody('');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Không gửi được tin nhắn',
      );
    } finally {
      setSendingChat(false);
    }
  };

  const ticketColumns: ColumnsType<SupportTicketDto> = useMemo(
    () => [
      {
        title: 'Mã yêu cầu',
        dataIndex: 'code',
        key: 'code',
        render: (c: string, t) => (
          <div>
            <span className="font-mono text-xs font-bold text-brand-fg">
              {c}
            </span>
            <p className="text-xs text-fg-muted">
              <DateTime value={t.created_at} />
            </p>
          </div>
        ),
      },
      {
        title: 'Phân loại',
        dataIndex: 'kind',
        key: 'kind',
        render: (k: TicketKind) => (
          <Badge
            tone={
              k === 'CANCEL_REQUEST'
                ? 'danger'
                : k === 'CHANGE_REQUEST'
                  ? 'warning'
                  : 'info'
            }
          >
            {k === 'CANCEL_REQUEST'
              ? 'Hủy vé / Hoàn tiền'
              : k === 'CHANGE_REQUEST'
                ? 'Đổi giờ / Ghế'
                : k === 'COMPLAINT'
                  ? 'Khiếu nại'
                  : 'Liên hệ'}
          </Badge>
        ),
      },
      {
        title: 'Khách hàng',
        key: 'customer',
        render: (_, t) => (
          <div>
            <p className="text-sm font-semibold text-fg">{t.name}</p>
            <Phone value={t.phone} link className="text-xs text-fg-secondary" />
          </div>
        ),
      },
      {
        title: 'Nội dung yêu cầu',
        key: 'subject',
        render: (_, t) => (
          <div className="max-w-md">
            <p className="text-sm font-medium text-fg">{t.subject}</p>
            <p className="text-xs text-fg-secondary">{t.message}</p>
            {t.booking_id && (
              <Link
                href={`/bookings/${t.booking_id}`}
                className="mt-1 inline-block text-xs font-semibold text-brand-fg hover:underline"
              >
                Xem đơn vé liên quan →
              </Link>
            )}
          </div>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (s: TicketStatus) => <StatusTag domain="ticket" status={s} />,
      },
      {
        title: 'Tác nghiệp nhanh',
        key: 'actions',
        align: 'right',
        render: (_, t) => (
          <div className="flex items-center justify-end gap-1.5">
            {t.status !== 'RESOLVED' && (
              <Button
                size="sm"
                leftIcon={<CheckCircle2 className="size-3.5" />}
                onClick={async () => {
                  await adminApi.updateSupportTicket(t.id, {
                    status: 'RESOLVED',
                  });
                  toast.success(`Đã duyệt xử lý yêu cầu ${t.code}`);
                  void loadTickets();
                }}
              >
                Duyệt
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditingTicket(t);
                setTicketStatus(t.status);
                setTicketNote(t.internal_note ?? '');
              }}
            >
              Ghi chú
            </Button>
          </div>
        ),
      },
    ],
    [loadTickets, toast],
  );

  const activeDriver = useMemo(
    () => drivers.find((d) => d.id === activeDriverId) ?? null,
    [drivers, activeDriverId],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top 3-Tab Switcher matching frames nvCcCreateBooking / nvCcRequests / nvCcSupportInbox */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl<CallCenterTab>
          ariaLabel="Phân hệ Tổng đài CSKH"
          value={tab}
          onChange={(next) => {
            setTab(next);
            router.replace(`/call-center?tab=${next}`);
          }}
          options={[
            {
              value: 'create',
              label: 'Tạo vé thủ công (Wizard)',
              icon: <Ticket className="size-4" />,
            },
            {
              value: 'requests',
              label: 'Yêu cầu Đổi / Hủy / CS',
              icon: <Headphones className="size-4" />,
            },
            {
              value: 'inbox',
              label: 'Hộp thư & Chat Điều hành',
              icon: <MessageSquare className="size-4" />,
            },
          ]}
        />
      </div>

      {/* TAB 1: WIZARD TẠO VÉ THỦ CÔNG (nvCcCreateBooking) */}
      {tab === 'create' && (
        <div className="flex flex-col gap-6">
          <Card>
            <Stepper
              current={step}
              steps={[
                {
                  label: '1. Thông tin khách & Chuyến',
                  description: 'SĐT, tuyến, giờ đi',
                },
                {
                  label: '2. Điểm đón/trả & Chọn ghế',
                  description: 'PostGIS & sơ đồ ghế',
                },
                {
                  label: '3. Giá & Xác nhận',
                  description: 'Tạo vé tức thì',
                },
              ]}
            />
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card className="flex flex-col gap-5">
              <CardHeader
                title="Tạo vé thủ công (Call Center)"
                description="Luồng nhập nhanh cho điện thoại viên khi khách gọi hotline"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Họ tên hành khách" required>
                  {(p) => (
                    <Input
                      {...p}
                      value={cName}
                      onChange={(e) => {
                        setCName(e.target.value);
                        if (step === 0) setStep(1);
                      }}
                      placeholder="Trần Thị Mai"
                    />
                  )}
                </Field>
                <Field label="Số điện thoại khách gọi" required>
                  {(p) => (
                    <Input
                      {...p}
                      type="tel"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      placeholder="0903221xxx"
                    />
                  )}
                </Field>
                <Field label="Tuyến đường" required>
                  {() => (
                    <Select
                      className="w-full"
                      value={routeId}
                      onChange={(v) => setRouteId(v)}
                      options={routes.map((r) => ({
                        value: r.id,
                        label: r.name,
                      }))}
                    />
                  )}
                </Field>
                <Field label="Khung giờ xuất bến" required>
                  {() => (
                    <Select
                      className="w-full"
                      value={batchId}
                      onChange={(v) => setBatchId(v)}
                      options={batches.map((b) => ({
                        value: b.id,
                        label: `${new Date(b.departure_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })} — Còn ${b.seats_available} ghế`,
                      }))}
                    />
                  )}
                </Field>
                <Field
                  label="Điểm đón (PostGIS)"
                  required
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <AddressAutocomplete
                      id={p.id}
                      value={pickup}
                      onChange={(v) => {
                        setPickup(v);
                        setStep(2);
                      }}
                      search={(q) => adminApi.geocode(q)}
                    />
                  )}
                </Field>
                <Field
                  label="Điểm trả (PostGIS)"
                  required
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <AddressAutocomplete
                      id={p.id}
                      value={dropoff}
                      onChange={setDropoff}
                      search={(q) => adminApi.geocode(q)}
                    />
                  )}
                </Field>
                <Field label="Phương thức thanh toán">
                  {() => (
                    <Select
                      className="w-full"
                      value={payMethod}
                      onChange={(v) => setPayMethod(v)}
                      options={[
                        { value: 'CASH', label: 'Thu tiền mặt khi đón' },
                        {
                          value: 'BANK_TRANSFER',
                          label: 'Chuyển khoản VietQR',
                        },
                      ]}
                    />
                  )}
                </Field>
                <Field label="Ghi chú tổng đài">
                  {(p) => (
                    <Input
                      {...p}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="VD: Khách người cao tuổi, cần ghế giữa…"
                    />
                  )}
                </Field>
              </div>

              <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                <div>
                  <span className="text-xs text-fg-muted">
                    Báo giá tạm tính:{' '}
                  </span>
                  <Money
                    value={totalPriceVnd}
                    className="text-lg font-bold text-brand-fg"
                  />
                </div>
                <Button
                  size="lg"
                  loading={creatingBooking}
                  onClick={handleQuickCreateBooking}
                >
                  Tạo vé ngay
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <CardHeader
                title="Chọn ghế trên xe"
                description="Click chọn ghế cho khách (bỏ trống sẽ tự chọn ghế trống đầu tiên)"
              />
              {seatMap ? (
                <SeatMap
                  layout={{
                    id: seatMap.trip_batch_id,
                    name: 'Sơ đồ ghế',
                    rows: seatMap.layout,
                  }}
                  selected={selectedSeats}
                  taken={seatMap.seats
                    .filter((s) => s.remaining <= 0)
                    .map((s) => s.label)}
                  held={seatMap.seats
                    .filter((s) => s.remaining > 0 && s.held > 0)
                    .map((s) => s.label)}
                  onToggle={(label) => {
                    setSelectedSeats((prev) =>
                      prev.includes(label)
                        ? prev.filter((x) => x !== label)
                        : [...prev, label],
                    );
                    setStep(2);
                  }}
                />
              ) : (
                <p className="py-12 text-center text-sm text-fg-muted">
                  Đang tải sơ đồ ghế…
                </p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: YÊU CẦU ĐỔI / HỦY / CS (nvCcRequests) */}
      {tab === 'requests' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['', 'Tất cả'],
                  ['CHANGE_REQUEST', 'Đổi giờ'],
                  ['CANCEL_REQUEST', 'Hủy / Hoàn'],
                  ['CONTACT', 'Liên hệ'],
                  ['COMPLAINT', 'Khiếu nại'],
                ] as const
              ).map(([k, lbl]) => (
                <Button
                  key={k}
                  size="sm"
                  variant={ticketKind === k ? 'primary' : 'secondary'}
                  onClick={() => setTicketKind(k)}
                >
                  {lbl}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCw className="size-3.5" />}
              onClick={loadTickets}
            >
              Làm mới
            </Button>
          </div>

          <DataTable<SupportTicketDto>
            columns={ticketColumns}
            data={tickets}
            rowKey="id"
            loading={ticketsLoading}
            empty={{
              title: 'Không có yêu cầu hỗ trợ nào đang chờ',
              description:
                'Các yêu cầu hủy vé hoàn tiền hoặc form liên hệ từ Web Đặt Vé sẽ hiển thị tại đây.',
            }}
          />
        </div>
      )}

      {/* TAB 3: HỘP THƯ HỖ TRỢ & CHAT TÀI XẾ (nvCcSupportInbox) */}
      {tab === 'inbox' && (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Left Threads List */}
          <Card className="flex max-h-[560px] flex-col">
            <CardHeader
              title="Hộp thư điều hành"
              description="Trao đổi trực tiếp với tài xế trên đường"
            />
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {drivers.map((drv) => {
                const th = threads.find((x) => x.driver_id === drv.id);
                const active = drv.id === activeDriverId;
                return (
                  <button
                    key={drv.id}
                    type="button"
                    onClick={() => setActiveDriverId(drv.id)}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-control border p-3 text-left transition-colors',
                      active
                        ? 'border-brand-border bg-brand-subtle'
                        : 'border-border-subtle bg-surface-2 hover:border-border-strong',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar
                        name={drv.full_name}
                        src={resolveUploadUrl(drv.avatar_url)}
                        size={36}
                        status={drv.on_shift ? 'online' : 'offline'}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-fg">
                          {drv.full_name}
                        </p>
                        <p className="truncate text-xs text-fg-muted">
                          {th?.last_body ?? `SĐT: ${drv.phone}`}
                        </p>
                      </div>
                    </div>
                    {th && th.unread > 0 && (
                      <Badge tone="brand" variant="solid">
                        {th.unread}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Chat Window */}
          <Card className="flex h-[560px] flex-col">
            {activeDriver ? (
              <>
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={activeDriver.full_name}
                      src={resolveUploadUrl(activeDriver.avatar_url)}
                      size={40}
                      status={activeDriver.on_shift ? 'online' : 'offline'}
                    />
                    <div>
                      <p className="text-base font-semibold text-fg">
                        {activeDriver.full_name}
                      </p>
                      <p className="text-xs text-fg-muted">
                        Xe mặc định:{' '}
                        {activeDriver.profile.default_vehicle?.license_plate ??
                          '—'}{' '}
                        · <Phone value={activeDriver.phone} link />
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${activeDriver.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-control border border-border-subtle bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:border-brand-border hover:text-brand-fg"
                  >
                    <PhoneCall className="size-3.5" />
                    Gọi điện
                  </a>
                </div>

                <div className="my-4 flex flex-1 flex-col gap-3 overflow-y-auto pr-2">
                  {messages.length === 0 ? (
                    <EmptyState
                      compact
                      title="Chưa có tin nhắn nào"
                      description="Gửi tin nhắn điều hành xuống ứng dụng của tài xế."
                    />
                  ) : (
                    messages.map((m) => {
                      const isOps = m.sender_role === 'OPS';
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            'max-w-[75%] rounded-card px-4 py-2.5 text-sm',
                            isOps
                              ? 'self-end bg-brand text-on-brand'
                              : 'self-start border border-border-subtle bg-surface-2 text-fg',
                          )}
                        >
                          <p className="text-[11px] font-semibold opacity-75">
                            {isOps ? 'Điều hành' : m.sender_name || 'Tài xế'} ·{' '}
                            <DateTime value={m.created_at} mode="time" />
                          </p>
                          <p className="mt-0.5 break-words">{m.body}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handleSendChat}
                  className="flex items-center gap-2 border-t border-border-subtle pt-3"
                >
                  <Input
                    value={chatBody}
                    onChange={(e) => setChatBody(e.target.value)}
                    placeholder="Nhập tin nhắn gửi xuống App Tài xế…"
                  />
                  <Button
                    type="submit"
                    loading={sendingChat}
                    leftIcon={<Send className="size-4" />}
                  >
                    Gửi
                  </Button>
                </form>
              </>
            ) : (
              <EmptyState
                title="Chọn một tài xế để bắt đầu trò chuyện"
                description="Tin nhắn được đồng bộ thời gian thực qua Socket.io."
              />
            )}
          </Card>
        </div>
      )}

      <Modal
        open={Boolean(editingTicket)}
        onCancel={() => setEditingTicket(null)}
        title={`Cập nhật yêu cầu · ${editingTicket?.code ?? ''}`}
        footer={null}
      >
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Trạng thái xử lý">
            {() => (
              <Select
                className="w-full"
                value={ticketStatus}
                onChange={(v) => setTicketStatus(v)}
                options={[
                  { value: 'NEW', label: 'Mới tiếp nhận' },
                  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
                  { value: 'RESOLVED', label: 'Đã giải quyết' },
                  { value: 'CLOSED', label: 'Đã đóng' },
                ]}
              />
            )}
          </Field>
          <Field label="Ghi chú nội bộ CSKH">
            {(p) => (
              <Textarea
                {...p}
                rows={3}
                value={ticketNote}
                onChange={(e) => setTicketNote(e.target.value)}
              />
            )}
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingTicket(null)}>
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!editingTicket) return;
                await adminApi.updateSupportTicket(editingTicket.id, {
                  status: ticketStatus,
                  internal_note: ticketNote,
                });
                toast.success('Đã cập nhật yêu cầu hỗ trợ');
                setEditingTicket(null);
                void loadTickets();
              }}
            >
              Lưu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function CallCenterPage() {
  return (
    <AdminShell
      title="Tổng đài & Chăm sóc khách hàng"
      subtitle="Tạo vé thủ công (Wizard) · Yêu cầu Đổi/Hủy/Hoàn · Hộp thư & Chat Điều hành"
    >
      <Suspense fallback={null}>
        <CallCenterContent />
      </Suspense>
    </AdminShell>
  );
}
