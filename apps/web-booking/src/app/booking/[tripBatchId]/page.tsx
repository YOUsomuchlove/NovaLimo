'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Form, Grid, Typography, message } from 'antd';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import type { PaymentMethod } from '@limousine-workspace/shared-types/legacy';
import {
  priceForSeat,
  type SeatCapacity,
} from '@limousine-workspace/shared-ui/legacy';
import { getApiBaseUrl } from '../../../lib/api';
import { PageSection } from '../../../components/blocks/PageSection';
import { BookingCheckoutStep } from '../../../components/booking-wizard/BookingCheckoutStep';
import { bookingDisplayCode } from '../../../components/booking-wizard/booking-display-code';
import { BookingPassengerStep } from '../../../components/booking-wizard/BookingPassengerStep';
import type { BookingPassengerFormValues } from '../../../components/booking-wizard/BookingPassengerStep';
import { BookingSeatStep } from '../../../components/booking-wizard/BookingSeatStep';
import { BookingStepper } from '../../../components/booking-wizard/BookingStepper';
import { BookingSuccessPanel } from '../../../components/booking-wizard/BookingSuccessPanel';
import { PaymentQrModal } from '../../../components/booking-wizard/PaymentQrModal';
import { BookingPageScaffold } from '../../../components/layout/BookingPageScaffold';
import { PEN_BG, PEN_OVERLAY } from '../../../lib/booking-pen-assets';

type Geo = { lat: number; lng: number };

function seatSortKey(id: string): number {
  const m = id.match(/^([A-Z])(\d+)$/);
  if (!m) return 9999;
  const row = m[1].charCodeAt(0) - 65;
  const n = Number(m[2]);
  return row * 100 + n;
}

function BookingWizardInner() {
  const screens = Grid.useBreakpoint();
  const isMdUp = Boolean(screens.md);
  const router = useRouter();
  const pathname = usePathname();

  const params = useParams<{ tripBatchId: string }>();
  const searchParams = useSearchParams();
  const tripBatchId = params.tripBatchId;
  const rawCap = Number(searchParams.get('capacity')) || 9;
  const seatUiCapacity: 9 | 12 = rawCap === 12 ? 12 : 9;
  const capacity = seatUiCapacity as SeatCapacity;
  const baseFromUrl = Number(searchParams.get('price')) || 350000;

  const apiUrl = getApiBaseUrl();
  const [form] = Form.useForm<BookingPassengerFormValues>();
  const passengerName =
    (Form.useWatch('passenger_name', form) as string | undefined) ?? '';
  const passengerPhone =
    (Form.useWatch('passenger_phone', form) as string | undefined) ?? '';

  const [step, setStep] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [pickup, setPickup] = useState<{ address: string; loc: Geo | null }>({
    address: '',
    loc: null,
  });
  const [dropoff, setDropoff] = useState<{ address: string; loc: Geo | null }>({
    address: '',
    loc: null,
  });
  const [payment, setPayment] = useState<PaymentMethod>('VNPAY');
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const unitPrice = useMemo(() => {
    return selectedSeats.reduce(
      (sum, id) => sum + priceForSeat(id, baseFromUrl, capacity),
      0,
    );
  }, [selectedSeats, baseFromUrl, capacity]);

  const seatSummaryLabel = useMemo(() => {
    return [...selectedSeats]
      .sort((a, b) => seatSortKey(a) - seatSortKey(b))
      .join(' • ');
  }, [selectedSeats]);

  const setSeatCapacity = useCallback(
    (next: 9 | 12) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set('capacity', String(next));
      router.replace(`${pathname}?${p.toString()}`);
      setSelectedSeats([]);
    },
    [pathname, router, searchParams],
  );

  const toggleSeat = useCallback(
    (id: string) => {
      if (takenSeats.includes(id)) return;
      setSelectedSeats((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        return [...prev, id];
      });
    },
    [takenSeats],
  );

  const { bgSrc, overlay } = useMemo(() => {
    if (step === 0) return { bgSrc: PEN_BG.seatMap, overlay: PEN_OVERLAY.seat };
    if (step === 1)
      return { bgSrc: PEN_BG.bookingInfo, overlay: PEN_OVERLAY.info };
    if (step === 2)
      return { bgSrc: PEN_BG.checkout, overlay: PEN_OVERLAY.checkout };
    return { bgSrc: PEN_BG.bookingSuccess, overlay: PEN_OVERLAY.success };
  }, [step]);

  const loadTaken = useCallback(async () => {
    try {
      const res = await fetch(
        `${apiUrl}/bookings/taken-seats?trip_batch_id=${encodeURIComponent(tripBatchId)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as string[];
      setTakenSeats(Array.isArray(data) ? data : []);
    } catch {
      setTakenSeats([]);
    }
  }, [apiUrl, tripBatchId]);

  useEffect(() => {
    void loadTaken();
  }, [loadTaken]);

  async function submitBooking() {
    const v = await form.validateFields();
    if (selectedSeats.length === 0) {
      message.error('Chọn ít nhất một ghế');
      return;
    }
    if (!pickup.loc || !dropoff.loc) {
      message.error('Chọn địa chỉ đón và trả từ gợi ý để có tọa độ');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          trip_batch_id: tripBatchId,
          passenger_name: v.passenger_name,
          passenger_phone: v.passenger_phone,
          booker_name: v.booker_name || null,
          booker_phone: v.booker_phone || null,
          pickup_address: pickup.address,
          pickup_location: pickup.loc,
          dropoff_address: dropoff.address,
          dropoff_location: dropoff.loc,
          note: v.note ?? null,
          seat_label: [...selectedSeats]
            .sort((a, b) => seatSortKey(a) - seatSortKey(b))
            .join(', '),
          unit_price: unitPrice,
          total_amount: unitPrice,
          payment_method: payment,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || res.statusText);
      }
      const booking = (await res.json()) as { id: string };
      setDoneId(booking.id);
      setStep(3);
      message.success('Đặt vé thành công');
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : 'Không thể hoàn tất đặt vé',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function openPaymentModal() {
    try {
      await form.validateFields();
      if (!pickup.loc || !dropoff.loc) {
        message.error(
          'Chọn địa chỉ đón và trả từ danh sách gợi ý để lấy tọa độ',
        );
        return;
      }
      setPayModalOpen(true);
    } catch {
      /* validation */
    }
  }

  return (
    <div className={step === 3 && doneId ? 'bg-[#0a0e18]' : 'bg-nova-bg'}>
      <BookingPageScaffold
        bgSrc={bgSrc}
        overlayClassName={overlay}
        minHeight={
          step === 3 && doneId
            ? 'min-h-[360px] md:min-h-[420px]'
            : step === 0
              ? 'min-h-[200px] md:min-h-[240px]'
              : step === 1
                ? 'min-h-[200px] md:min-h-[260px]'
                : step === 2
                  ? 'min-h-[200px] md:min-h-[240px]'
                  : 'min-h-[200px]'
        }
        priority={step === 0 || step === 1 || step === 2}
        imageClassName={
          step === 3 && doneId ? 'scale-105 blur-[3px]' : undefined
        }
      >
        <PageSection
          className={
            step === 3 && doneId ? '!pb-6 !pt-8 sm:!pt-10' : 'py-6 sm:py-8'
          }
        >
          <Typography.Title
            level={2}
            className={
              step === 3 && doneId
                ? 'mb-3 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-[40px]'
                : 'mb-1 text-xl font-black text-white sm:text-2xl md:text-3xl'
            }
          >
            {step === 3 && doneId
              ? 'Đặt vé thành công'
              : step === 0
                ? 'Lựa chọn sơ đồ ghế'
                : step === 1
                  ? 'Thông tin hành khách'
                  : 'Thanh toán'}
          </Typography.Title>
          {step === 3 && doneId ? (
            <Typography.Text className="text-lg font-black text-[#d4af37] sm:text-xl">
              Mã đơn: {bookingDisplayCode(doneId)}
            </Typography.Text>
          ) : step === 0 ? (
            <Typography.Text className="max-w-2xl text-sm font-semibold text-nova-muted sm:text-base">
              Chọn ghế cho Limousine 9/12 chỗ · Hiển thị trạng thái trống / đã
              bán / đang chọn
            </Typography.Text>
          ) : step === 1 ? (
            <Typography.Text className="max-w-2xl text-sm font-semibold text-white/90 sm:text-base">
              Nhập thông tin và chọn điểm đón/trả để hoàn tất đặt vé
            </Typography.Text>
          ) : step === 2 ? (
            <Typography.Text className="max-w-2xl text-sm font-semibold text-white/90 sm:text-base">
              Hoàn tất đặt vé trực tuyến
            </Typography.Text>
          ) : (
            <Typography.Text className="text-nova-muted">
              Chuyến: <strong className="text-white">{tripBatchId}</strong> · Xe{' '}
              {capacity} chỗ
            </Typography.Text>
          )}
        </PageSection>
      </BookingPageScaffold>

      <PageSection
        className={`${step === 0 || step === 1 || step === 2 ? 'max-w-6xl' : 'max-w-4xl'} ${step < 3 ? 'bg-nova-bg pb-16 pt-2' : 'bg-[#0a0e18] !pb-20 !pt-4'}`}
      >
        {step < 3 ? (
          <BookingStepper
            wizardStep={Math.min(step, 2) as 0 | 1 | 2}
            isMdUp={isMdUp}
          />
        ) : null}

        {step === 0 && (
          <BookingSeatStep
            capacity={seatUiCapacity}
            baseFromUrl={baseFromUrl}
            selectedSeats={selectedSeats}
            takenSeats={takenSeats}
            onToggleSeat={toggleSeat}
            onCapacityChange={setSeatCapacity}
            onContinue={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <BookingPassengerStep
            form={form}
            apiBaseUrl={apiUrl}
            pickup={pickup}
            dropoff={dropoff}
            setPickup={setPickup}
            setDropoff={setDropoff}
            onBack={() => setStep(0)}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <BookingCheckoutStep
            payment={payment}
            onPaymentChange={setPayment}
            seatSummary={seatSummaryLabel}
            seatCount={selectedSeats.length}
            unitPrice={unitPrice}
            pickupAddress={pickup.address}
            dropoffAddress={dropoff.address}
            passengerName={passengerName}
            passengerPhone={passengerPhone}
            submitting={submitting}
            onBack={() => setStep(1)}
            onOpenPayment={() => void openPaymentModal()}
          />
        )}

        {step === 3 && doneId ? <BookingSuccessPanel doneId={doneId} /> : null}
      </PageSection>

      <PaymentQrModal
        open={payModalOpen}
        payment={payment}
        unitPrice={unitPrice}
        submitting={submitting}
        passengerName={passengerName}
        passengerPhone={passengerPhone}
        pickupAddress={pickup.address}
        dropoffAddress={dropoff.address}
        seatSummary={seatSummaryLabel}
        seatCount={selectedSeats.length}
        tripBatchId={tripBatchId}
        onCancel={() => setPayModalOpen(false)}
        onConfirm={() => {
          setPayModalOpen(false);
          void submitBooking();
        }}
      />
    </div>
  );
}

export default function BookingWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">
          Đang tải…
        </div>
      }
    >
      <BookingWizardInner />
    </Suspense>
  );
}
