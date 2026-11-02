import type { RouteDto } from '@limousine-workspace/shared-types';
import { Money, buttonClasses } from '@limousine-workspace/shared-ui';
import {
  ArrowRight,
  Armchair,
  BellRing,
  Clock,
  MapPinned,
  Package,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { TripSearchForm } from '../components/home/TripSearchForm';
import { Container, Section } from '../components/site/Section';
import { DEFAULT_SETTINGS, publicApi, safe } from '../lib/api';

export const revalidate = 300;

const FEATURES = [
  {
    icon: MapPinned,
    title: 'Đón trả tận nơi',
    body: 'Tài xế đón tại nhà, khách sạn hay văn phòng. Thứ tự đón được tối ưu để không ai phải chờ lâu.',
  },
  {
    icon: Armchair,
    title: 'Chọn ghế trực tuyến',
    body: 'Xem sơ đồ xe thời gian thực, chọn ghế VIP hàng đầu hay hàng sau yên tĩnh — giá hiển thị rõ ràng.',
  },
  {
    icon: QrCode,
    title: 'Thanh toán VietQR',
    body: 'Quét mã bằng bất kỳ ứng dụng ngân hàng nào. Vé được xác nhận tự động trong vài giây.',
  },
  {
    icon: BellRing,
    title: 'Báo tin đúng lúc',
    body: 'Nhận SMS khi xe xuất phát, kèm biển số và số điện thoại tài xế. Không cần gọi hỏi.',
  },
];

const STEPS = [
  { n: '01', title: 'Chọn chuyến', body: 'Tuyến, ngày và khung giờ phù hợp.' },
  {
    n: '02',
    title: 'Chọn ghế',
    body: 'Ghế được giữ riêng cho bạn trong 10 phút.',
  },
  {
    n: '03',
    title: 'Điểm đón & trả',
    body: 'Nhập địa chỉ hoặc chọn điểm đón có sẵn.',
  },
  {
    n: '04',
    title: 'Thanh toán',
    body: 'VietQR hoặc trả tiền mặt cho tài xế.',
  },
];

function RouteCard({ route }: { route: RouteDto }) {
  const hours = Math.floor(route.duration_min / 60);
  const mins = route.duration_min % 60;
  return (
    <Link
      href={`/search?route=${route.id}`}
      className="group relative flex flex-col overflow-hidden rounded-panel border border-border-subtle bg-surface-1 p-6 shadow-e1 transition-[transform,border-color,box-shadow] duration-200 ease-nova hover:-translate-y-1 hover:border-brand/40 hover:shadow-e2"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand/10 blur-3xl transition-opacity group-hover:opacity-100 sm:opacity-60" />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
        {route.code}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-fg">
        {route.origin_name} <span className="text-brand-fg">→</span>{' '}
        {route.destination_name}
      </h3>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" /> {hours ? `${hours} giờ ` : ''}
          {mins ? `${mins} phút` : ''}
        </span>
        {route.distance_km && <span>{route.distance_km} km</span>}
        <span>
          {route.stops?.filter((s) => s.kind !== 'DROPOFF').length ?? 0} điểm
          đón
        </span>
      </div>
      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="text-xs text-fg-muted">Giá vé từ</p>
          {route.from_price_vnd ? (
            <Money
              value={route.from_price_vnd}
              className="text-2xl font-semibold text-fg"
            />
          ) : (
            <span className="text-fg-muted">Liên hệ</span>
          )}
        </div>
        <span className="flex size-10 items-center justify-center rounded-full border border-border-default text-fg-secondary transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [routes, settings] = await Promise.all([
    safe(publicApi.routes(), []),
    safe(publicApi.settings(), DEFAULT_SETTINGS),
  ]);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/media/carousel-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[65%_center] opacity-70"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/30" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-canvas to-transparent" />
        <Container className="pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pt-28">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-subtle px-3 py-1 text-xs font-medium text-brand-fg">
              <Sparkles className="size-3.5" /> Limousine 9 &amp; 12 chỗ · ghế
              massage · Wi-Fi
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl lg:text-display">
              Hành trình đẳng cấp,
              <br />
              <span className="bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600 bg-clip-text text-transparent">
                đón tận cửa nhà.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-secondary">
              Đặt ghế limousine trong một phút. Chúng tôi đón bạn tại địa chỉ
              bạn chọn và đưa tới đúng nơi cần đến — đúng giờ, riêng tư, thoải
              mái.
            </p>
          </div>

          <div
            id="dat-ve"
            className="mt-10 scroll-mt-28 rounded-sheet border border-border-default bg-surface-1/75 p-5 shadow-e3 backdrop-blur-xl sm:p-7"
          >
            {routes.length ? (
              <TripSearchForm routes={routes} />
            ) : (
              <p className="text-center text-fg-muted">
                Hệ thống đặt vé đang bảo trì. Vui lòng gọi hotline để được hỗ
                trợ.
              </p>
            )}
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6">
            {[
              [`${routes.length}`, 'tuyến khởi hành mỗi ngày'],
              [
                `${settings.booking.seat_hold_minutes} phút`,
                'giữ ghế khi bạn đặt',
              ],
              [
                `${settings.booking.free_cancel_hours} giờ`,
                'hủy miễn phí trước giờ đi',
              ],
            ].map(([k, v]) => (
              <div key={v} className="flex flex-col">
                <dt className="order-2 mt-1 text-xs text-fg-muted sm:text-sm">
                  {v}
                </dt>
                <dd className="text-2xl font-semibold tabular-nums text-fg sm:text-3xl">
                  {k}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ---------- Popular routes ---------- */}
      {routes.length > 0 && (
        <Section
          eyebrow="Hành trình được yêu thích"
          title="Tuyến đang khai thác"
          lead="Khởi hành mỗi ngày nhiều khung giờ. Giá đã gồm nước uống, khăn lạnh và bảo hiểm hành khách."
          action={
            <Link
              href="/pricing"
              className={buttonClasses({ variant: 'outline' })}
            >
              Xem bảng giá <ArrowRight className="size-4" />
            </Link>
          }
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((r) => (
              <RouteCard key={r.id} route={r} />
            ))}
          </div>
        </Section>
      )}

      {/* ---------- Features ---------- */}
      <Section
        eyebrow="Vì sao chọn NovaLimo"
        title="Trải nghiệm được chăm chút từng chi tiết"
        className="border-y border-border-subtle bg-surface-1/30"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-panel border border-border-subtle bg-surface-1 p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-card bg-brand-subtle text-brand-fg">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-fg">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------- How it works ---------- */}
      <Section
        eyebrow="Đặt vé trong 4 bước"
        title="Nhanh như gọi một cuộc điện thoại"
      >
        <ol className="grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <span
                  className="nl-gold-rule absolute left-14 right-0 top-6 hidden md:block"
                  aria-hidden
                />
              )}
              <span className="relative flex size-12 items-center justify-center rounded-full border border-brand/40 bg-canvas text-sm font-semibold text-brand-fg">
                {s.n}
              </span>
              <h3 className="mt-5 font-semibold text-fg">{s.title}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------- Comfort + cargo ---------- */}
      <Section className="pt-0 sm:pt-0">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-sheet border border-border-subtle bg-gradient-to-br from-surface-2 to-surface-1 p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-fg">
              Tiện nghi trên xe
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-fg sm:text-3xl">
              Như ngồi khoang thương gia
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                [Armchair, 'Ghế da rộng, có chế độ massage'],
                [Wifi, 'Wi-Fi & cổng sạc USB-C'],
                [ShieldCheck, 'Bảo hiểm hành khách theo quy định'],
                [Sparkles, 'Nước uống, khăn lạnh miễn phí'],
              ].map(([Icon, text]) => {
                const I = Icon as typeof Armchair;
                return (
                  <li
                    key={text as string}
                    className="flex items-center gap-3 text-sm text-fg-secondary"
                  >
                    <I className="size-4 shrink-0 text-brand-fg" />{' '}
                    {text as string}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-sheet border border-brand/25 bg-brand-subtle p-8 sm:p-10">
            <div>
              <Package className="size-8 text-brand-fg" />
              <h2 className="mt-4 text-2xl font-semibold text-fg">
                Gửi hàng theo xe
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
                Giao tận tay trong ngày, thu hộ COD, theo dõi vận đơn trực
                tuyến.
              </p>
            </div>
            <Link
              href="/cargo"
              className={buttonClasses({
                variant: 'primary',
                className: 'self-start',
              })}
            >
              Ký gửi hàng <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
