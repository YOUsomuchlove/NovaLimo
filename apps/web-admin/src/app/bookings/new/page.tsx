'use client';

import type {
  PaymentMethod,
  RouteDto,
  TripBatchDto,
  TripSeatMapDto,
} from '@limousine-workspace/shared-types';
import {
  AddressAutocomplete,
  Button,
  Card,
  CardFooter,
  CardHeader,
  DetailLayout,
  Field,
  FormSection,
  type GeoAddress,
  Input,
  Money,
  SeatLegend,
  SeatMap,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Select } from 'antd';
import { ArrowLeft, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi } from '../../../lib/api';

export default function BookingCreatePage() {
  const router = useRouter();
  const toast = useToast();

  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [routeId, setRouteId] = useState('');
  const [batches, setBatches] = useState<TripBatchDto[]>([]);
  const [batchId, setBatchId] = useState('');
  const [seatMap, setSeatMap] = useState<TripSeatMapDto | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [pickupStopId, setPickupStopId] = useState<string>('');
  const [pickupAddr, setPickupAddr] = useState<GeoAddress>({
    address: '',
    lat: 21.0285,
    lng: 105.8542,
  });

  const [dropoffStopId, setDropoffStopId] = useState<string>('');
  const [dropoffAddr, setDropoffAddr] = useState<GeoAddress>({
    address: '',
    lat: 20.9599,
    lng: 107.0425,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [source, setSource] = useState<'ADMIN' | 'CALL_CENTER'>('CALL_CENTER');
  const [discountVnd, setDiscountVnd] = useState('0');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminApi
      .routes()
      .then((rts) => {
        setRoutes(rts);
        if (rts.length > 0) setRouteId(rts[0].id);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!routeId) return;
    void adminApi
      .tripBatches({ route_id: routeId, status: 'OPEN', limit: 30 })
      .then((res) => {
        setBatches(res.items);
        if (res.items.length > 0) {
          setBatchId(res.items[0].id);
        } else {
          setBatchId('');
          setSeatMap(null);
        }
      })
      .catch(() => null);
  }, [routeId]);

  const loadSeats = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const sm = await adminApi.tripBatchSeats(id);
      setSeatMap(sm);
      setSelectedSeats([]);
    } catch {
      setSeatMap(null);
    }
  }, []);

  useEffect(() => {
    if (batchId) void loadSeats(batchId);
  }, [batchId, loadSeats]);

  const currentRoute = useMemo(
    () => routes.find((r) => r.id === routeId) ?? null,
    [routes, routeId],
  );

  // Pre-fill default stops when route changes
  useEffect(() => {
    if (!currentRoute?.stops?.length) return;
    const pickups = currentRoute.stops.filter(
      (s) => s.kind === 'PICKUP' || s.kind === 'BOTH',
    );
    const dropoffs = currentRoute.stops.filter(
      (s) => s.kind === 'DROPOFF' || s.kind === 'BOTH',
    );
    if (pickups[0]) {
      setPickupStopId(pickups[0].id);
      setPickupAddr({
        address: `${pickups[0].name} — ${pickups[0].address}`,
        lat: pickups[0].location.lat,
        lng: pickups[0].location.lng,
      });
    }
    const lastDrop = dropoffs[dropoffs.length - 1];
    if (lastDrop) {
      setDropoffStopId(lastDrop.id);
      setDropoffAddr({
        address: `${lastDrop.name} — ${lastDrop.address}`,
        lat: lastDrop.location.lat,
        lng: lastDrop.location.lng,
      });
    }
  }, [currentRoute]);

  const seatPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of seatMap?.seats ?? []) {
      map.set(s.label, s.price_vnd);
    }
    return map;
  }, [seatMap]);

  const subtotalVnd = useMemo(
    () =>
      selectedSeats.reduce((sum, lbl) => sum + (seatPriceMap.get(lbl) ?? 0), 0),
    [selectedSeats, seatPriceMap],
  );
  const totalVnd = Math.max(0, subtotalVnd - (Number(discountVnd) || 0));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!batchId) {
      toast.error('Vui lòng chọn lô chuyến khởi hành');
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ghế trên sơ đồ');
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error('Vui lòng nhập Họ tên và Số điện thoại khách hàng');
      return;
    }
    if (!pickupAddr.address.trim() || !dropoffAddr.address.trim()) {
      toast.error('Vui lòng nhập đầy đủ địa chỉ đón và trả');
      return;
    }

    setSaving(true);
    try {
      const created = await adminApi.createBooking({
        trip_batch_id: batchId,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
        pickup: {
          stop_id: pickupStopId || undefined,
          address: pickupAddr.address.trim(),
          lat: pickupAddr.lat ?? 21.0285,
          lng: pickupAddr.lng ?? 105.8542,
        },
        dropoff: {
          stop_id: dropoffStopId || undefined,
          address: dropoffAddr.address.trim(),
          lat: dropoffAddr.lat ?? 20.9599,
          lng: dropoffAddr.lng ?? 107.0425,
        },
        passengers: selectedSeats.map((lbl) => ({
          seat_label: lbl,
          name: contactName.trim(),
          phone: contactPhone.trim(),
        })),
        payment_method: paymentMethod,
        source,
        discount_vnd: Number(discountVnd) || 0,
        note: note.trim() || undefined,
      });
      toast.success(`Đã tạo đơn vé ${created.code}`);
      router.push(`/bookings/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tạo vé');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Tạo đơn vé hành khách"
      subtitle="Khởi tạo đơn đặt vé nhanh cho khách gọi tổng đài hoặc tại quầy"
      breadcrumbs={[
        { label: 'Đơn hàng & Ký gửi', href: '/bookings' },
        { label: 'Tạo đơn vé hành khách' },
      ]}
      headerExtra={
        <Link href="/bookings">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Quay lại
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit}>
        <DetailLayout
          main={
            <Card>
              <FormSection
                title="1. Chọn tuyến & Lô chuyến (Trip_Batch)"
                description="Chọn tuyến đường và khung giờ xuất bến còn ghế trống."
              >
                <Field label="Tuyến đường" required>
                  {() => (
                    <Select
                      className="w-full"
                      value={routeId}
                      onChange={(v) => setRouteId(v)}
                      options={routes.map((r) => ({
                        value: r.id,
                        label: `${r.name} (${r.code})`,
                      }))}
                    />
                  )}
                </Field>

                <Field label="Chuyến khởi hành" required>
                  {() => (
                    <Select
                      className="w-full"
                      value={batchId}
                      onChange={(v) => setBatchId(v)}
                      placeholder="Chọn khung giờ…"
                      options={batches.map((b) => ({
                        value: b.id,
                        label: `${new Date(b.departure_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })} — Còn ${b.seats_available}/${b.seats_total} ghế (${b.code})`,
                      }))}
                    />
                  )}
                </Field>
              </FormSection>

              <FormSection
                title="2. Thông tin khách hàng"
                description="Họ tên và số điện thoại nhận tin nhắn mã vé."
              >
                <Field label="Họ và tên khách" required>
                  {(p) => (
                    <Input
                      {...p}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                    />
                  )}
                </Field>

                <Field label="Số điện thoại" required>
                  {(p) => (
                    <Input
                      {...p}
                      type="tel"
                      inputMode="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0912345678"
                    />
                  )}
                </Field>

                <Field label="Email (tùy chọn)" className="sm:col-span-2">
                  {(p) => (
                    <Input
                      {...p}
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="khachhang@email.com"
                    />
                  )}
                </Field>
              </FormSection>

              <FormSection
                title="3. Địa chỉ đón / trả (PostGIS)"
                description="Chọn từ điểm dừng chuẩn hoặc nhập địa chỉ đón trả tận nơi."
              >
                {currentRoute?.stops && currentRoute.stops.length > 0 && (
                  <>
                    <Field label="Điểm đón chuẩn trên tuyến">
                      {() => (
                        <Select
                          className="w-full"
                          value={pickupStopId}
                          onChange={(id) => {
                            setPickupStopId(id);
                            const st = currentRoute.stops?.find(
                              (s) => s.id === id,
                            );
                            if (st) {
                              setPickupAddr({
                                address: `${st.name} — ${st.address}`,
                                lat: st.location.lat,
                                lng: st.location.lng,
                              });
                            }
                          }}
                          options={[
                            { value: '', label: 'Nhập địa chỉ đón tận nơi…' },
                            ...currentRoute.stops
                              .filter(
                                (s) => s.kind === 'PICKUP' || s.kind === 'BOTH',
                              )
                              .map((s) => ({
                                value: s.id,
                                label: `${s.name} (${s.address})`,
                              })),
                          ]}
                        />
                      )}
                    </Field>

                    <Field label="Điểm trả chuẩn trên tuyến">
                      {() => (
                        <Select
                          className="w-full"
                          value={dropoffStopId}
                          onChange={(id) => {
                            setDropoffStopId(id);
                            const st = currentRoute.stops?.find(
                              (s) => s.id === id,
                            );
                            if (st) {
                              setDropoffAddr({
                                address: `${st.name} — ${st.address}`,
                                lat: st.location.lat,
                                lng: st.location.lng,
                              });
                            }
                          }}
                          options={[
                            { value: '', label: 'Nhập địa chỉ trả tận nơi…' },
                            ...currentRoute.stops
                              .filter(
                                (s) =>
                                  s.kind === 'DROPOFF' || s.kind === 'BOTH',
                              )
                              .map((s) => ({
                                value: s.id,
                                label: `${s.name} (${s.address})`,
                              })),
                          ]}
                        />
                      )}
                    </Field>
                  </>
                )}

                <Field
                  label="Địa chỉ đón chi tiết"
                  required
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <AddressAutocomplete
                      id={p.id}
                      value={pickupAddr}
                      onChange={(val) => {
                        setPickupStopId('');
                        setPickupAddr(val);
                      }}
                      search={(q) => adminApi.geocode(q)}
                    />
                  )}
                </Field>

                <Field
                  label="Địa chỉ trả chi tiết"
                  required
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <AddressAutocomplete
                      id={p.id}
                      value={dropoffAddr}
                      onChange={(val) => {
                        setDropoffStopId('');
                        setDropoffAddr(val);
                      }}
                      search={(q) => adminApi.geocode(q)}
                    />
                  )}
                </Field>
              </FormSection>

              <FormSection
                title="4. Thanh toán & Kênh đặt"
                description="Chọn phương thức thanh toán và giảm giá (nếu có)."
              >
                <Field label="Phương thức thanh toán">
                  {() => (
                    <Select
                      className="w-full"
                      value={paymentMethod}
                      onChange={(v) => setPaymentMethod(v)}
                      options={[
                        { value: 'CASH', label: 'Tiền mặt (Thu khi lên xe)' },
                        {
                          value: 'BANK_TRANSFER',
                          label: 'Chuyển khoản VietQR',
                        },
                        { value: 'VNPAY', label: 'VNPay' },
                        { value: 'MOMO', label: 'Ví MoMo' },
                      ]}
                    />
                  )}
                </Field>

                <Field label="Kênh tiếp nhận">
                  {() => (
                    <Select
                      className="w-full"
                      value={source}
                      onChange={(v) => setSource(v)}
                      options={[
                        { value: 'CALL_CENTER', label: 'Tổng đài CSKH' },
                        { value: 'ADMIN', label: 'Quản trị / Quầy vé' },
                      ]}
                    />
                  )}
                </Field>

                <Field label="Giảm giá trực tiếp (VND)">
                  {(p) => (
                    <Input
                      {...p}
                      type="number"
                      min={0}
                      value={discountVnd}
                      onChange={(e) => setDiscountVnd(e.target.value)}
                    />
                  )}
                </Field>

                <Field label="Ghi chú cho tài xế" className="sm:col-span-2">
                  {(p) => (
                    <Textarea
                      {...p}
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="VD: Khách có 2 vali lớn, gọi trước 15 phút…"
                    />
                  )}
                </Field>
              </FormSection>

              <CardFooter>
                <Link href="/bookings">
                  <Button type="button" variant="ghost">
                    Hủy
                  </Button>
                </Link>
                <Button
                  type="submit"
                  loading={saving}
                  leftIcon={<Ticket className="size-4" />}
                >
                  Tạo vé ({selectedSeats.length} ghế)
                </Button>
              </CardFooter>
            </Card>
          }
          aside={
            <Card className="flex flex-col gap-5">
              <CardHeader
                title="Sơ đồ ghế trực tuyến"
                description="Chọn vị trí ghế cho hành khách"
              />
              {seatMap ? (
                <>
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
                    priceOf={(cell) => seatPriceMap.get(cell.label)}
                    onToggle={(label) =>
                      setSelectedSeats((prev) =>
                        prev.includes(label)
                          ? prev.filter((x) => x !== label)
                          : [...prev, label],
                      )
                    }
                  />
                  <SeatLegend />
                </>
              ) : (
                <p className="py-8 text-center text-sm text-fg-muted">
                  Chọn lô chuyến để hiển thị sơ đồ ghế
                </p>
              )}

              <div className="rounded-control border border-border-subtle bg-surface-2 p-4">
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span>Ghế đã chọn</span>
                  <span className="font-mono font-semibold text-brand-fg">
                    {selectedSeats.length > 0
                      ? selectedSeats.join(', ')
                      : 'Chưa chọn'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-fg-muted">
                  <span>Tạm tính</span>
                  <Money value={subtotalVnd} className="text-fg" />
                </div>
                {Number(discountVnd) > 0 && (
                  <div className="mt-1 flex items-center justify-between text-xs text-fg-muted">
                    <span>Giảm giá</span>
                    <Money
                      value={-Number(discountVnd)}
                      signed
                      className="text-success-fg"
                    />
                  </div>
                )}
                <div className="mt-3 flex items-baseline justify-between border-t border-border-subtle pt-3">
                  <span className="text-sm font-semibold text-fg">
                    Tổng thanh toán
                  </span>
                  <Money
                    value={totalVnd}
                    className="text-xl font-bold text-brand-fg"
                  />
                </div>
              </div>
            </Card>
          }
        />
      </form>
    </AdminShell>
  );
}
