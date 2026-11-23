'use client';

import type {
  CargoPayer,
  CargoQuoteDto,
  CargoSize,
  RouteDto,
  TripBatchDto,
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
  Switch,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { Select } from 'antd';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '../../../components/shell/AdminShell';
import { adminApi } from '../../../lib/api';

export default function CargoCreatePage() {
  const router = useRouter();
  const toast = useToast();

  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [routeId, setRouteId] = useState('');
  const [batches, setBatches] = useState<TripBatchDto[]>([]);
  const [tripBatchId, setTripBatchId] = useState('');

  const [size, setSize] = useState<CargoSize>('M');
  const [weightKg, setWeightKg] = useState('5');
  const [isFragile, setIsFragile] = useState(false);
  const [declaredValueVnd, setDeclaredValueVnd] = useState('0');
  const [codAmountVnd, setCodAmountVnd] = useState('0');
  const [feePayer, setFeePayer] = useState<CargoPayer>('SENDER');
  const [description, setDescription] = useState('Hành lý / đồ dùng cá nhân');
  const [note, setNote] = useState('');

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddr, setSenderAddr] = useState<GeoAddress>({
    address: 'Kho 1 — Hoàn Kiếm, Hà Nội',
    lat: 21.0285,
    lng: 105.8542,
  });

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddr, setReceiverAddr] = useState<GeoAddress>({
    address: 'Văn phòng Bãi Cháy — Hạ Long, Quảng Ninh',
    lat: 20.9599,
    lng: 107.0425,
  });

  const [quote, setQuote] = useState<CargoQuoteDto | null>(null);
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
      .tripBatches({ route_id: routeId, limit: 20 })
      .then((res) => setBatches(res.items))
      .catch(() => null);
  }, [routeId]);

  useEffect(() => {
    if (!routeId) return;
    const w = Number(weightKg) || 1;
    void adminApi
      .cargoQuote({
        route_id: routeId,
        size,
        weight_kg: Math.max(0.5, w),
        is_fragile: isFragile,
        declared_value_vnd: Number(declaredValueVnd) || 0,
        cod_amount_vnd: Number(codAmountVnd) || 0,
      })
      .then(setQuote)
      .catch(() => null);
  }, [routeId, size, weightKg, isFragile, declaredValueVnd, codAmountVnd]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!routeId) {
      toast.error('Vui lòng chọn tuyến vận chuyển');
      return;
    }
    if (
      !senderName.trim() ||
      !senderPhone.trim() ||
      !receiverName.trim() ||
      !receiverPhone.trim()
    ) {
      toast.error('Vui lòng nhập đầy đủ họ tên và SĐT người gửi & người nhận');
      return;
    }
    setSaving(true);
    try {
      const created = await adminApi.createCargo({
        route_id: routeId,
        size,
        weight_kg: Math.max(0.5, Number(weightKg) || 1),
        is_fragile: isFragile,
        declared_value_vnd: Number(declaredValueVnd) || 0,
        cod_amount_vnd: Number(codAmountVnd) || 0,
        fee_payer: feePayer,
        description: description.trim() || 'Hàng hóa ký gửi',
        trip_batch_id: tripBatchId || undefined,
        note: note.trim() || undefined,
        sender: {
          name: senderName.trim(),
          phone: senderPhone.trim(),
          address: senderAddr.address.trim(),
          lat: senderAddr.lat ?? 21.0285,
          lng: senderAddr.lng ?? 105.8542,
        },
        receiver: {
          name: receiverName.trim(),
          phone: receiverPhone.trim(),
          address: receiverAddr.address.trim(),
          lat: receiverAddr.lat ?? 20.9599,
          lng: receiverAddr.lng ?? 107.0425,
        },
      });
      toast.success(`Đã tạo vận đơn ${created.waybill_code}`);
      router.push(`/cargos/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tạo vận đơn');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Tạo đơn ký gửi hàng hóa"
      subtitle="Khởi tạo đơn ký gửi với tọa độ điểm nhận/giao PostGIS và báo giá tự động"
      breadcrumbs={[
        { label: 'Vận hành Hàng hóa', href: '/cargos' },
        { label: 'Tạo đơn ký gửi' },
      ]}
      headerExtra={
        <Link href="/cargos">
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
                title="1. Tuyến vận chuyển & Đặc tính kiện hàng (nvOrdP2Cre)"
                description="Chọn tuyến đường, kích thước, trọng lượng và khai giá / COD."
              >
                <Field label="Tuyến vận chuyển" required>
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

                <Field label="Gắn theo lô chuyến (tùy chọn)">
                  {() => (
                    <Select
                      className="w-full"
                      value={tripBatchId}
                      onChange={(v) => setTripBatchId(v)}
                      options={[
                        { value: '', label: 'Xếp chuyến sau tại bến' },
                        ...batches.map((b) => ({
                          value: b.id,
                          label: `${new Date(b.departure_at).toLocaleString('vi-VN')} (${b.code})`,
                        })),
                      ]}
                    />
                  )}
                </Field>

                <Field label="Kích thước kiện hàng">
                  {() => (
                    <Select
                      className="w-full"
                      value={size}
                      onChange={(v) => setSize(v)}
                      options={[
                        { value: 'S', label: 'Cỡ S — Nhỏ (Tài liệu / < 3kg)' },
                        {
                          value: 'M',
                          label: 'Cỡ M — Vừa (Thùng tiêu chuẩn / ≤ 10kg)',
                        },
                        { value: 'L', label: 'Cỡ L — Lớn (Thùng to / ≤ 20kg)' },
                        { value: 'XL', label: 'Cỡ XL — Cồng kềnh (≤ 40kg)' },
                      ]}
                    />
                  )}
                </Field>

                <Field label="Trọng lượng (kg)" required>
                  {(p) => (
                    <Input
                      {...p}
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                    />
                  )}
                </Field>

                <Field
                  label="Nội dung hàng hóa"
                  required
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <Input
                      {...p}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="VD: Hải sản đóng thùng xốp, linh kiện điện tử…"
                    />
                  )}
                </Field>

                <Field label="Thu hộ COD (VND)">
                  {(p) => (
                    <Input
                      {...p}
                      type="number"
                      min={0}
                      value={codAmountVnd}
                      onChange={(e) => setCodAmountVnd(e.target.value)}
                    />
                  )}
                </Field>

                <Field label="Giá trị khai báo bảo hiểm (VND)">
                  {(p) => (
                    <Input
                      {...p}
                      type="number"
                      min={0}
                      value={declaredValueVnd}
                      onChange={(e) => setDeclaredValueVnd(e.target.value)}
                    />
                  )}
                </Field>

                <Field label="Người trả cước">
                  {() => (
                    <Select
                      className="w-full"
                      value={feePayer}
                      onChange={(v) => setFeePayer(v)}
                      options={[
                        { value: 'SENDER', label: 'Người gửi thanh toán' },
                        { value: 'RECEIVER', label: 'Người nhận thanh toán' },
                      ]}
                    />
                  )}
                </Field>

                <div className="flex items-center pt-5">
                  <Switch
                    checked={isFragile}
                    onChange={setIsFragile}
                    label="Hàng dễ vỡ (cần xếp riêng)"
                  />
                </div>
              </FormSection>

              <FormSection title="2. Người gửi & Điểm nhận (PostGIS)">
                <Field label="Họ tên người gửi" required>
                  {(p) => (
                    <Input
                      {...p}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nguyễn Văn Gửi"
                    />
                  )}
                </Field>
                <Field label="SĐT người gửi" required>
                  {(p) => (
                    <Input
                      {...p}
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="0912345678"
                    />
                  )}
                </Field>
                <Field
                  label="Địa chỉ nhận hàng (PostGIS)"
                  required
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <AddressAutocomplete
                      id={p.id}
                      value={senderAddr}
                      onChange={setSenderAddr}
                      search={(q) => adminApi.geocode(q)}
                    />
                  )}
                </Field>
              </FormSection>

              <FormSection title="3. Người nhận & Điểm giao (PostGIS)">
                <Field label="Họ tên người nhận" required>
                  {(p) => (
                    <Input
                      {...p}
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Trần Thị Nhận"
                    />
                  )}
                </Field>
                <Field label="SĐT người nhận" required>
                  {(p) => (
                    <Input
                      {...p}
                      type="tel"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      placeholder="0988765432"
                    />
                  )}
                </Field>
                <Field
                  label="Địa chỉ giao hàng (PostGIS)"
                  required
                  className="sm:col-span-2"
                >
                  {(p) => (
                    <AddressAutocomplete
                      id={p.id}
                      value={receiverAddr}
                      onChange={setReceiverAddr}
                      search={(q) => adminApi.geocode(q)}
                    />
                  )}
                </Field>
                <Field label="Ghi chú vận đơn" className="sm:col-span-2">
                  {(p) => (
                    <Textarea
                      {...p}
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  )}
                </Field>
              </FormSection>

              <CardFooter>
                <Link href="/cargos">
                  <Button type="button" variant="ghost">
                    Hủy
                  </Button>
                </Link>
                <Button
                  type="submit"
                  loading={saving}
                  leftIcon={<Package className="size-4" />}
                >
                  Tạo đơn ký gửi
                </Button>
              </CardFooter>
            </Card>
          }
          aside={
            <Card className="flex flex-col gap-4">
              <CardHeader
                title="Báo giá cước tự động"
                description="Tính từ cấu hình bảng giá hàng hóa phía máy chủ"
              />
              {quote ? (
                <div className="space-y-2 rounded-control border border-border-subtle bg-surface-2 p-4">
                  {quote.breakdown.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs text-fg-secondary"
                    >
                      <span>{b.label}</span>
                      <Money value={b.amount_vnd} />
                    </div>
                  ))}
                  <div className="mt-3 flex items-baseline justify-between border-t border-border-subtle pt-3">
                    <span className="text-sm font-semibold text-fg">
                      Tổng cước vận chuyển
                    </span>
                    <Money
                      value={quote.fee_vnd}
                      className="text-xl font-bold text-brand-fg"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-fg-muted">Đang tính cước…</p>
              )}
            </Card>
          }
        />
      </form>
    </AdminShell>
  );
}
