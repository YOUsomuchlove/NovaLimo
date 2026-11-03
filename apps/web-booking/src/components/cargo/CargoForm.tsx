'use client';

import type {
  CargoQuoteDto,
  CargoSize,
  RouteDto,
} from '@limousine-workspace/shared-types';
import {
  AddressAutocomplete,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  Money,
  SegmentedControl,
  Skeleton,
  Textarea,
  type GeoAddress,
  useToast,
} from '@limousine-workspace/shared-ui';
import {
  isValidVnPhone,
  normalizeVnPhone,
} from '@limousine-workspace/utils-core';
import { Select } from 'antd';
import { PackageCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, publicApi } from '../../lib/api';
import { ticketPhones } from '../../lib/session';

const SIZES: { value: CargoSize; label: string; hint: string }[] = [
  { value: 'S', label: 'Nhỏ', hint: 'Giấy tờ, phụ kiện · ≤ 3 kg' },
  { value: 'M', label: 'Vừa', hint: 'Hộp giày, quà tặng · ≤ 10 kg' },
  { value: 'L', label: 'Lớn', hint: 'Thùng carton · ≤ 20 kg' },
  { value: 'XL', label: 'Rất lớn', hint: 'Vali, thùng lớn · ≤ 40 kg' },
];

interface Party {
  name: string;
  phone: string;
  place: GeoAddress;
}

const emptyParty = (): Party => ({
  name: '',
  phone: '',
  place: { address: '' },
});

function PartyFields({
  title,
  value,
  onChange,
  errors,
  prefix,
}: {
  title: string;
  value: Party;
  onChange: (p: Party) => void;
  errors: Record<string, string>;
  prefix: string;
}) {
  return (
    <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
      <legend className="mb-4 text-base font-semibold text-fg">{title}</legend>
      <Field label="Họ tên" required error={errors[`${prefix}.name`]}>
        {(p) => (
          <Input
            {...p}
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        )}
      </Field>
      <Field label="Số điện thoại" required error={errors[`${prefix}.phone`]}>
        {(p) => (
          <Input
            {...p}
            type="tel"
            inputMode="tel"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        )}
      </Field>
      <Field
        label="Địa chỉ"
        required
        error={errors[`${prefix}.place`]}
        className="sm:col-span-2"
        hint="Chọn một gợi ý để định vị chính xác"
      >
        {(p) => (
          <AddressAutocomplete
            id={p.id}
            value={value.place}
            onChange={(place) => onChange({ ...value, place })}
            search={publicApi.geocode}
            status={errors[`${prefix}.place`] ? 'error' : undefined}
          />
        )}
      </Field>
    </fieldset>
  );
}

export function CargoForm({ routes }: { routes: RouteDto[] }) {
  const router = useRouter();
  const toast = useToast();
  const [routeId, setRouteId] = useState<string | undefined>(routes[0]?.id);
  const [size, setSize] = useState<CargoSize>('S');
  const [weight, setWeight] = useState('1');
  const [fragile, setFragile] = useState(false);
  const [declared, setDeclared] = useState('');
  const [cod, setCod] = useState('');
  const [description, setDescription] = useState('');
  const [payer, setPayer] = useState<'SENDER' | 'RECEIVER'>('SENDER');
  const [sender, setSender] = useState<Party>(emptyParty);
  const [receiver, setReceiver] = useState<Party>(emptyParty);
  const [agree, setAgree] = useState(false);
  const [quote, setQuote] = useState<CargoQuoteDto | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const num = (s: string) => Number(s.replace(/\D/g, '')) || 0;
  const weightKg = Number(weight.replace(',', '.')) || 0;

  // Live quote (B3) — debounced.
  useEffect(() => {
    if (!routeId || weightKg <= 0) return;
    const t = setTimeout(() => {
      publicApi
        .cargoQuote({
          route_id: routeId,
          size,
          weight_kg: weightKg,
          is_fragile: fragile,
          declared_value_vnd: num(declared),
          cod_amount_vnd: num(cod),
        })
        .then(
          (q) => {
            setQuote(q);
            setQuoteError(null);
          },
          (e) =>
            setQuoteError(
              e instanceof ApiError ? e.message : 'Không tính được cước',
            ),
        );
    }, 350);
    return () => clearTimeout(t);
  }, [routeId, size, weightKg, fragile, declared, cod]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!routeId) e.route = 'Chọn tuyến';
    if (weightKg <= 0 || weightKg > 200) e.weight = 'Khối lượng 0.1 – 200 kg';
    if (description.trim().length < 3) e.description = 'Mô tả hàng hóa';
    for (const [k, p] of [
      ['sender', sender],
      ['receiver', receiver],
    ] as const) {
      if (p.name.trim().length < 2) e[`${k}.name`] = 'Nhập họ tên';
      if (!isValidVnPhone(p.phone))
        e[`${k}.phone`] = 'Số điện thoại không hợp lệ';
      if (p.place.lat === undefined) e[`${k}.place`] = 'Chọn địa chỉ từ gợi ý';
    }
    if (!agree) e.agree = 'Bạn cần xác nhận điều kiện gửi hàng';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || !routeId) {
      document
        .querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    try {
      const party = (p: Party) => ({
        name: p.name.trim(),
        phone: normalizeVnPhone(p.phone),
        address: p.place.address,
        lat: p.place.lat ?? 0,
        lng: p.place.lng ?? 0,
      });
      const c = await publicApi.cargoCreate({
        route_id: routeId,
        size,
        weight_kg: weightKg,
        is_fragile: fragile,
        declared_value_vnd: num(declared) || undefined,
        cod_amount_vnd: num(cod) || undefined,
        description: description.trim(),
        fee_payer: payer,
        sender: party(sender),
        receiver: party(receiver),
      });
      ticketPhones.set(c.waybill_code, normalizeVnPhone(sender.phone));
      router.push(`/cargo/success/${c.waybill_code}`);
    } catch (e) {
      toast.error(
        e instanceof ApiError
          ? e.message
          : 'Không tạo được đơn, vui lòng thử lại',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-6">
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-fg">Kiện hàng</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Tuyến" required error={errors.route}>
              {() => (
                <Select
                  size="large"
                  value={routeId}
                  onChange={setRouteId}
                  options={routes.map((r) => ({ value: r.id, label: r.name }))}
                  className="w-full"
                />
              )}
            </Field>
            <Field label="Khối lượng (kg)" required error={errors.weight}>
              {(p) => (
                <Input
                  {...p}
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              )}
            </Field>
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-ui font-medium text-fg-secondary">
                Kích thước
              </p>
              <SegmentedControl
                fullWidth
                value={size}
                onChange={setSize}
                options={SIZES.map((s) => ({
                  value: s.value,
                  label: (
                    <>
                      {s.value}
                      <span className="hidden sm:inline"> · {s.label}</span>
                    </>
                  ),
                }))}
                ariaLabel="Kích thước"
              />
              <p className="mt-1.5 text-xs text-fg-muted">
                {SIZES.find((s) => s.value === size)?.hint}
              </p>
            </div>
            <Field
              label="Mô tả hàng hóa"
              required
              error={errors.description}
              className="sm:col-span-2"
            >
              {(p) => (
                <Textarea
                  {...p}
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: 1 hộp quà, giấy tờ công ty"
                />
              )}
            </Field>
            <Field label="Giá trị khai báo (₫)" hint="Để tính bảo hiểm 0,5%">
              {(p) => (
                <Input
                  {...p}
                  inputMode="numeric"
                  value={declared}
                  onChange={(e) => setDeclared(e.target.value)}
                  placeholder="0"
                />
              )}
            </Field>
            <Field label="Thu hộ COD (₫)" hint="Tài xế thu của người nhận">
              {(p) => (
                <Input
                  {...p}
                  inputMode="numeric"
                  value={cod}
                  onChange={(e) => setCod(e.target.value)}
                  placeholder="0"
                />
              )}
            </Field>
            <Checkbox
              className="sm:col-span-2"
              checked={fragile}
              onChange={(e) => setFragile(e.target.checked)}
              label="Hàng dễ vỡ"
              description="Đóng gói chống sốc và xếp riêng trên xe (có phụ phí)"
            />
          </div>
        </Card>
        <Card padding="lg" className="flex flex-col gap-8">
          <PartyFields
            title="Người gửi"
            prefix="sender"
            value={sender}
            onChange={setSender}
            errors={errors}
          />
          <div className="h-px bg-border-subtle" />
          <PartyFields
            title="Người nhận"
            prefix="receiver"
            value={receiver}
            onChange={setReceiver}
            errors={errors}
          />
          <div>
            <p className="mb-1.5 text-ui font-medium text-fg-secondary">
              Người trả cước
            </p>
            <SegmentedControl
              value={payer}
              onChange={setPayer}
              options={[
                { value: 'SENDER', label: 'Người gửi' },
                { value: 'RECEIVER', label: 'Người nhận' },
              ]}
              ariaLabel="Người trả cước"
            />
          </div>
        </Card>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <Card variant="elevated" className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
            Báo giá
          </p>
          {quoteError ? (
            <p className="flex items-start gap-2 text-sm text-danger-fg">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {quoteError}
            </p>
          ) : !quote ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              <ul className="flex flex-col gap-2 text-sm">
                {quote.breakdown.map((l) => (
                  <li
                    key={l.label}
                    className="flex justify-between gap-3 text-fg-secondary"
                  >
                    <span>{l.label}</span>
                    <Money value={l.amount_vnd} />
                  </li>
                ))}
              </ul>
              <div className="flex items-end justify-between border-t border-border-subtle pt-4">
                <span className="text-sm text-fg-muted">Tổng cước</span>
                <Money
                  value={quote.fee_vnd}
                  className="text-2xl font-semibold text-brand-fg"
                />
              </div>
            </>
          )}
          <Checkbox
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            label={
              <>
                Hàng không thuộc danh mục cấm và tôi đồng ý{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-brand-fg underline underline-offset-4"
                >
                  điều khoản gửi hàng
                </Link>
              </>
            }
          />
          {errors.agree && (
            <p className="text-xs text-danger-fg">{errors.agree}</p>
          )}
          <Button
            size="lg"
            fullWidth
            loading={submitting}
            onClick={submit}
            leftIcon={<PackageCheck className="size-4" />}
          >
            Tạo đơn gửi hàng
          </Button>
          <p className="text-xs text-fg-muted">
            Thanh toán cước khi bàn giao hàng cho tài xế hoặc tại quầy.
          </p>
        </Card>
      </aside>
    </div>
  );
}
