'use client';

import type { BookingDto } from '@limousine-workspace/shared-types';
import {
  AddressAutocomplete,
  Button,
  Card,
  CardFooter,
  ErrorState,
  Field,
  FormSection,
  type GeoAddress,
  Input,
  Skeleton,
  StatusTag,
  Textarea,
  useToast,
} from '@limousine-workspace/shared-ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { AdminShell } from '../../../../components/shell/AdminShell';
import { adminApi } from '../../../../lib/api';

export default function BookingEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [pickup, setPickup] = useState<GeoAddress>({ address: '' });
  const [dropoff, setDropoff] = useState<GeoAddress>({ address: '' });
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const b = await adminApi.booking(id);
      setBooking(b);
      setContactName(b.contact_name);
      setContactPhone(b.contact_phone);
      setContactEmail(b.contact_email ?? '');
      setPickup({
        address: b.pickup.address,
        lat: b.pickup.location.lat,
        lng: b.pickup.location.lng,
      });
      setDropoff({
        address: b.dropoff.address,
        lat: b.dropoff.location.lat,
        lng: b.dropoff.location.lng,
      });
      setNote(b.note ?? '');
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await adminApi.updateBooking(id, {
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || undefined,
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
        note: note.trim() || undefined,
      });
      toast.success('Đã lưu thay đổi đơn vé');
      router.push(`/bookings/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Sửa đơn vé hành khách"
      subtitle="Chỉnh sửa thông tin liên hệ và tọa độ đón/trả PostGIS"
      breadcrumbs={[
        { label: 'Đơn hàng & Ký gửi', href: '/bookings' },
        { label: booking?.code ?? 'Chi tiết', href: `/bookings/${id}` },
        { label: 'Sửa đơn' },
      ]}
      headerExtra={
        <Link href={`/bookings/${id}`}>
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
      {error ? (
        <Card>
          <ErrorState onRetry={load} />
        </Card>
      ) : loading || !booking ? (
        <Card>
          <Skeleton className="h-64 w-full" rounded="card" />
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-xl font-bold text-brand-fg">
                  {booking.code}
                </h2>
                <StatusTag domain="booking" status={booking.status} />
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                Tuyến: {booking.trip.route.name} · Ghế:{' '}
                {booking.seats.map((s) => s.seat_label).join(', ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/bookings/${id}`}>
                <Button type="button" variant="ghost">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </div>
          </Card>

          <Card>
            <FormSection title="Chỉnh sửa thông tin đơn vé (nvOrdP1Ed)">
              <Field label="Họ tên liên hệ" required>
                {(p) => (
                  <Input
                    {...p}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Số điện thoại" required>
                {(p) => (
                  <Input
                    {...p}
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Email" className="sm:col-span-2">
                {(p) => (
                  <Input
                    {...p}
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                )}
              </Field>
              <Field
                label="Địa chỉ đón (PostGIS)"
                required
                className="sm:col-span-2"
              >
                {(p) => (
                  <AddressAutocomplete
                    id={p.id}
                    value={pickup}
                    onChange={setPickup}
                    search={(q) => adminApi.geocode(q)}
                  />
                )}
              </Field>
              <Field
                label="Địa chỉ trả (PostGIS)"
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
              <Field label="Ghi chú" className="sm:col-span-2">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                )}
              </Field>
            </FormSection>

            <CardFooter>
              <Link href={`/bookings/${id}`}>
                <Button type="button" variant="ghost">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" loading={saving}>
                Lưu thay đổi
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </AdminShell>
  );
}
