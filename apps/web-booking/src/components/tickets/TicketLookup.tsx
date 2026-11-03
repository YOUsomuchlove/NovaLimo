'use client';

import type { BookingDto } from '@limousine-workspace/shared-types';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Money,
  SegmentedControl,
  StatusTag,
  useToast,
} from '@limousine-workspace/shared-ui';
import {
  formatTime,
  formatWeekdayDate,
  isValidVnPhone,
  normalizeVnPhone,
} from '@limousine-workspace/utils-core';
import { ArrowRight, KeyRound, LogOut, Phone, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, publicApi } from '../../lib/api';
import { lookupSession, ticketPhones } from '../../lib/session';

function ByCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const c = code
      .trim()
      .toUpperCase()
      .replace(/^NL(?!-)/, 'NL-');
    if (!/^NL-[0-9A-Z]{6}$/.test(c)) return setError('Mã vé có dạng NL-XXXXXX');
    if (!isValidVnPhone(phone)) return setError('Số điện thoại không hợp lệ');
    setLoading(true);
    setError(null);
    try {
      const p = normalizeVnPhone(phone);
      await publicApi.lookup(c, p);
      ticketPhones.set(c, p);
      router.push(`/my-tickets/${c}`);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'Không tra cứu được, vui lòng thử lại',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Field label="Mã vé" required>
        {(p) => (
          <Input
            {...p}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="NL-7K3M9Q"
            leading={<Ticket className="size-4" />}
            autoCapitalize="characters"
          />
        )}
      </Field>
      <Field label="Số điện thoại đặt vé" required error={error ?? undefined}>
        {(p) => (
          <Input
            {...p}
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912 345 678"
            leading={<Phone className="size-4" />}
          />
        )}
      </Field>
      <Button
        type="submit"
        size="lg"
        loading={loading}
        rightIcon={<ArrowRight className="size-4" />}
      >
        Xem vé
      </Button>
    </form>
  );
}

function ByPhone({
  onList,
}: {
  onList: (list: BookingDto[], phone: string) => void;
}) {
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const request = async () => {
    if (!isValidVnPhone(phone)) return setError('Số điện thoại không hợp lệ');
    setLoading(true);
    setError(null);
    try {
      const r = await publicApi.requestOtp(normalizeVnPhone(phone));
      setSent(true);
      setCooldown(r.resend_in);
      toast.success('Đã gửi mã xác thực qua SMS');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không gửi được mã');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return setError('Mã gồm 6 chữ số');
    setLoading(true);
    setError(null);
    try {
      const p = normalizeVnPhone(phone);
      const v = await publicApi.verifyOtp(p, code);
      lookupSession.set({
        token: v.lookup_token,
        phone: p,
        exp: Date.now() + v.expires_in * 1000,
      });
      onList(await publicApi.myBookings(v.lookup_token), p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Không xác thực được');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void (sent ? verify() : request());
      }}
    >
      <Field
        label="Số điện thoại"
        required
        error={!sent ? (error ?? undefined) : undefined}
      >
        {(p) => (
          <Input
            {...p}
            type="tel"
            inputMode="tel"
            value={phone}
            disabled={sent}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0912 345 678"
            leading={<Phone className="size-4" />}
          />
        )}
      </Field>
      {sent && (
        <Field
          label="Mã xác thực (6 số)"
          required
          error={error ?? undefined}
          hint="Mã có hiệu lực trong 5 phút"
        >
          {(p) => (
            <Input
              {...p}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              leading={<KeyRound className="size-4" />}
              className="tracking-[0.4em]"
            />
          )}
        </Field>
      )}
      <Button type="submit" size="lg" loading={loading}>
        {sent ? 'Xác thực & xem vé' : 'Gửi mã xác thực'}
      </Button>
      {sent && (
        <Button
          variant="ghost"
          size="sm"
          disabled={cooldown > 0 || loading}
          onClick={() => void request()}
        >
          {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : 'Gửi lại mã'}
        </Button>
      )}
    </form>
  );
}

function BookingList({
  list,
  phone,
  onLogout,
}: {
  list: BookingDto[];
  phone: string;
  onLogout: () => void;
}) {
  const upcoming = list.filter(
    (b) =>
      new Date(b.trip.departure_at) > new Date() && b.status !== 'CANCELLED',
  );
  const past = list.filter((b) => !upcoming.includes(b));
  const Item = ({ b }: { b: BookingDto }) => (
    <li>
      <Link
        href={`/my-tickets/${b.code}`}
        onClick={() => ticketPhones.set(b.code, phone)}
        className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface-2 p-4 transition-colors hover:border-brand/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wider text-brand-fg">
            {b.code}
          </p>
          <p className="mt-1 font-medium text-fg">{b.trip.route.name}</p>
          <p className="text-sm capitalize text-fg-muted">
            {formatTime(b.trip.departure_at)} ·{' '}
            {formatWeekdayDate(b.trip.departure_at)} · Ghế{' '}
            {b.seats.map((s) => s.seat_label).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <StatusTag domain="booking" status={b.status} size="sm" />
          <Money value={b.total_vnd} className="font-semibold text-fg" />
        </div>
      </Link>
    </li>
  );
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">
          {list.length} vé của <strong className="text-fg">{phone}</strong>
        </p>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<LogOut className="size-4" />}
          onClick={onLogout}
        >
          Đổi số
        </Button>
      </div>
      {!list.length && (
        <EmptyState
          compact
          title="Chưa có vé nào"
          description="Số điện thoại này chưa đặt vé nào trên hệ thống."
        />
      )}
      {upcoming.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Sắp đi
          </h3>
          <ul className="flex flex-col gap-3">
            {upcoming.map((b) => (
              <Item key={b.id} b={b} />
            ))}
          </ul>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Đã đi / đã hủy
          </h3>
          <ul className="flex flex-col gap-3 opacity-80">
            {past.map((b) => (
              <Item key={b.id} b={b} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** A10 / A11 — lookup form left, results right. */
export function TicketLookup() {
  const [mode, setMode] = useState<'code' | 'phone'>('code');
  const [result, setResult] = useState<{
    list: BookingDto[];
    phone: string;
  } | null>(null);

  // Resume a still-valid OTP session (30 min).
  useEffect(() => {
    const s = lookupSession.get();
    if (!s) return;
    publicApi.myBookings(s.token).then(
      (list) => {
        setMode('phone');
        setResult({ list, phone: s.phone });
      },
      () => lookupSession.set(null),
    );
  }, []);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <Card padding="lg" className="self-start">
        <SegmentedControl
          fullWidth
          ariaLabel="Cách tra cứu"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'code', label: 'Theo mã vé' },
            { value: 'phone', label: 'Tất cả vé của tôi' },
          ]}
        />
        <p className="my-5 text-sm text-fg-muted">
          {mode === 'code'
            ? 'Nhập mã vé trong SMS xác nhận và số điện thoại đã dùng khi đặt.'
            : 'Xác thực số điện thoại bằng mã SMS để xem mọi vé đã đặt.'}
        </p>
        {mode === 'code' ? (
          <ByCode />
        ) : (
          <ByPhone onList={(list, phone) => setResult({ list, phone })} />
        )}
      </Card>
      <Card padding="lg" className="min-h-[320px]">
        {result ? (
          <BookingList
            list={result.list}
            phone={result.phone}
            onLogout={() => {
              lookupSession.set(null);
              setResult(null);
            }}
          />
        ) : (
          <EmptyState
            icon={<Ticket className="size-6" strokeWidth={1.75} />}
            title="Vé của bạn sẽ hiện ở đây"
            description="Tra cứu theo mã vé, hoặc xác thực số điện thoại để xem toàn bộ lịch sử đặt vé."
          />
        )}
      </Card>
    </div>
  );
}
