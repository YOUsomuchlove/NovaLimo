'use client';

import {
  Button,
  Card,
  Field,
  Input,
  MapView,
  Textarea,
  type MapMarker,
} from '@limousine-workspace/shared-ui';
import {
  isValidVnPhone,
  normalizeVnPhone,
} from '@limousine-workspace/utils-core';
import { ArrowLeft, ArrowRight, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { PlaceDraft } from '../../lib/session';
import { useBooking } from './BookingContext';
import { PlacePicker } from './PlacePicker';

type Errors = Partial<Record<string, string>>;

const placeError = (p?: PlaceDraft) =>
  !p
    ? 'Vui lòng chọn điểm'
    : p.lat === undefined || p.lng === undefined
      ? 'Hãy chọn một gợi ý để xác định vị trí trên bản đồ'
      : undefined;

export function InfoStep() {
  const { trip, route, draft, ready, update } = useBooking();
  const router = useRouter();
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [passengers, setPassengers] = useState<
    Record<string, { name: string; phone?: string }>
  >({});
  const [pickup, setPickup] = useState<PlaceDraft | undefined>();
  const [dropoff, setDropoff] = useState<PlaceDraft | undefined>();
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  // Need a seat hold first; otherwise send the visitor back to the seat step.
  useEffect(() => {
    if (!ready) return;
    if (!draft.hold_token || !draft.seats.length) {
      router.replace(`/booking/${trip.id}`);
      return;
    }
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate form from the saved draft once */
    setContact({
      name: draft.contact?.name ?? '',
      phone: draft.contact?.phone ?? '',
      email: draft.contact?.email ?? '',
    });
    setPassengers(draft.passengers ?? {});
    setPickup(draft.pickup);
    setDropoff(draft.dropoff);
    setNote(draft.note ?? '');
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const stops = route?.stops ?? [];
  const pickupStops = stops.filter((s) => s.kind !== 'DROPOFF' && s.is_active);
  const dropoffStops = stops.filter((s) => s.kind !== 'PICKUP' && s.is_active);
  const seats = [...draft.seats].sort();

  const markers = useMemo<MapMarker[]>(
    () => [
      ...(pickup?.lat !== undefined && pickup.lng !== undefined
        ? [
            {
              id: 'p',
              lat: pickup.lat,
              lng: pickup.lng,
              label: 'Đ',
              kind: 'pickup' as const,
              title: 'Điểm đón',
            },
          ]
        : []),
      ...(dropoff?.lat !== undefined && dropoff.lng !== undefined
        ? [
            {
              id: 'd',
              lat: dropoff.lat,
              lng: dropoff.lng,
              label: 'T',
              kind: 'dropoff' as const,
              colorIndex: 1,
              title: 'Điểm trả',
            },
          ]
        : []),
    ],
    [pickup, dropoff],
  );

  const validate = (): boolean => {
    const e: Errors = {};
    if (contact.name.trim().length < 2) e.name = 'Vui lòng nhập họ tên';
    if (!isValidVnPhone(contact.phone))
      e.phone = 'Số điện thoại di động không hợp lệ';
    if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email))
      e.email = 'Email không hợp lệ';
    seats.forEach((l, i) => {
      const p = passengers[l];
      const name = i === 0 && !p?.name ? contact.name : p?.name;
      if (!name || name.trim().length < 2) e[`p.${l}`] = 'Nhập tên hành khách';
      if (p?.phone && !isValidVnPhone(p.phone))
        e[`pp.${l}`] = 'Số điện thoại không hợp lệ';
    });
    e.pickup = placeError(pickup);
    e.dropoff = placeError(dropoff);
    const clean = Object.fromEntries(Object.entries(e).filter(([, v]) => v));
    setErrors(clean);
    if (Object.keys(clean).length) {
      document
        .querySelector('[aria-invalid="true"], .text-danger-fg')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    const filled = Object.fromEntries(
      seats.map((l, i) => [
        l,
        {
          name: (passengers[l]?.name || (i === 0 ? contact.name : '')).trim(),
          phone: passengers[l]?.phone
            ? normalizeVnPhone(passengers[l].phone ?? '')
            : undefined,
        },
      ]),
    );
    update({
      contact: {
        name: contact.name.trim(),
        phone: normalizeVnPhone(contact.phone),
        email: contact.email.trim() || undefined,
      },
      passengers: filled,
      pickup,
      dropoff,
      note: note.trim() || undefined,
    });
    router.push(`/booking/${trip.id}/checkout`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card padding="lg">
        <h1 className="text-2xl font-semibold text-fg">Thông tin liên hệ</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Số điện thoại này dùng để nhận mã vé, tra cứu và để tài xế liên hệ khi
          đến đón.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Họ và tên" required error={errors.name}>
            {(p) => (
              <Input
                {...p}
                autoComplete="name"
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
                placeholder="Nguyễn Văn A"
              />
            )}
          </Field>
          <Field label="Số điện thoại" required error={errors.phone}>
            {(p) => (
              <Input
                {...p}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                placeholder="0912 345 678"
              />
            )}
          </Field>
          <Field
            label="Email (không bắt buộc)"
            error={errors.email}
            hint="Nhận vé điện tử qua email"
            className="sm:col-span-2"
          >
            {(p) => (
              <Input
                {...p}
                type="email"
                autoComplete="email"
                value={contact.email}
                onChange={(e) =>
                  setContact({ ...contact, email: e.target.value })
                }
                placeholder="ban@email.com"
              />
            )}
          </Field>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-fg">Hành khách</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Tên in trên danh sách đón khách của tài xế. Ghế đầu tiên mặc định là
          bạn.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {seats.map((l, i) => (
            <div
              key={l}
              className="grid gap-4 rounded-card border border-border-subtle bg-surface-2/60 p-4 sm:grid-cols-[auto_1fr_1fr] sm:items-start"
            >
              <span className="flex size-10 items-center justify-center rounded-control bg-brand-subtle text-sm font-semibold text-brand-fg">
                {l}
              </span>
              <Field label="Tên hành khách" required error={errors[`p.${l}`]}>
                {(p) => (
                  <Input
                    {...p}
                    leading={<UserRound className="size-4" />}
                    value={passengers[l]?.name ?? ''}
                    placeholder={
                      i === 0
                        ? contact.name || 'Giống người liên hệ'
                        : 'Họ và tên'
                    }
                    onChange={(e) =>
                      setPassengers({
                        ...passengers,
                        [l]: { ...passengers[l], name: e.target.value },
                      })
                    }
                  />
                )}
              </Field>
              <Field label="SĐT (không bắt buộc)" error={errors[`pp.${l}`]}>
                {(p) => (
                  <Input
                    {...p}
                    type="tel"
                    inputMode="tel"
                    value={passengers[l]?.phone ?? ''}
                    placeholder="Để tài xế gọi trực tiếp"
                    onChange={(e) =>
                      setPassengers({
                        ...passengers,
                        [l]: {
                          ...passengers[l],
                          name: passengers[l]?.name ?? '',
                          phone: e.target.value,
                        },
                      })
                    }
                  />
                )}
              </Field>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-fg">Điểm đón & trả</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Chọn điểm có sẵn hoặc nhập địa chỉ để được đón tận nơi. Thứ tự đón
          được tối ưu sau khi chốt danh sách.
        </p>
        <div className="mt-6 grid gap-8 xl:grid-cols-2">
          <div className="flex flex-col gap-8">
            <PlacePicker
              label={`Điểm đón tại ${trip.route.origin_name}`}
              stops={pickupStops}
              value={pickup}
              onChange={setPickup}
              error={errors.pickup}
            />
            <PlacePicker
              label={`Điểm trả tại ${trip.route.destination_name}`}
              stops={dropoffStops}
              value={dropoff}
              onChange={setDropoff}
              error={errors.dropoff}
            />
          </div>
          <MapView
            theme="light"
            markers={markers}
            className="h-72 xl:h-full xl:min-h-[420px]"
          />
        </div>
        <Field label="Ghi chú cho tài xế" className="mt-8">
          {(p) => (
            <Textarea
              {...p}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: đón ở cổng phụ, mang theo 2 vali lớn"
              maxLength={1000}
            />
          )}
        </Field>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/booking/${trip.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> Đổi ghế
        </Link>
        <Button
          size="lg"
          onClick={submit}
          rightIcon={<ArrowRight className="size-4" />}
        >
          Tiếp tục thanh toán
        </Button>
      </div>
    </div>
  );
}
