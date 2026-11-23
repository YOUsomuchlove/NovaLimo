import type { RouteDto } from '@limousine-workspace/shared-types';
import { Money, buttonClasses } from '@limousine-workspace/shared-ui';
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { InteractiveSeatDemo } from '../components/home/InteractiveSeatDemo';
import { TripSearchForm } from '../components/home/TripSearchForm';
import { Container, Section } from '../components/site/Section';
import { DEFAULT_SETTINGS, publicApi, safe } from '../lib/api';
import { DEMO_ROUTES } from '../lib/demo-data';

export const revalidate = 300;

const STANDARDS = [
  {
    n: '01',
    title: 'Đón tận sảnh, trả đúng địa chỉ',
    body: 'Không ra bến xe, không trung chuyển rườm rà. Hệ thống điều phối gom điểm đón thông minh để xe luôn xuất phát đúng giờ.',
  },
  {
    n: '02',
    title: 'Sơ đồ ghế thời gian thực',
    body: 'Bạn chọn chính xác vị trí ghế mình muốn. Khi đã giữ chỗ, hệ thống khóa riêng 10 phút — tuyệt đối không có tình trạng trùng ghế.',
  },
  {
    n: '03',
    title: 'Thanh toán VietQR trong 5 giây',
    body: 'Quét mã bằng bất kỳ ứng dụng ngân hàng nào. Vé điện tử xác nhận tự động, hoặc chọn thanh toán tiền mặt trực tiếp cho tài xế.',
  },
  {
    n: '04',
    title: 'Minh bạch trước giờ khởi hành',
    body: 'Trước chuyến đi, bạn nhận đủ biển số xe, tên và số điện thoại tài xế qua SMS. Hủy trước 24 giờ hoàn 100% không rườm rà.',
  },
];

const PHOTO_BY_CODE: Record<string, { src: string; caption: string }> = {
  'HN-HL': {
    src: '/media/dest-halong.jpg',
    caption: 'Đường bao biển Vịnh Hạ Long',
  },
  'HN-NB': {
    src: '/media/fleet-exterior.jpg',
    caption: 'Đưa đón sảnh T1 & T2 Nội Bài',
  },
  'HN-NBH': {
    src: '/media/dest-ninhbinh.jpg',
    caption: 'Tràng An · Tam Cốc, Ninh Bình',
  },
};

function FeaturedRouteCard({
  route,
  fallbackPhoto,
}: {
  route: RouteDto;
  fallbackPhoto: string;
}) {
  const hours = Math.floor(route.duration_min / 60);
  const mins = route.duration_min % 60;
  const media = PHOTO_BY_CODE[route.code];
  const imgSrc = media?.src ?? route.image_url ?? fallbackPhoto;

  return (
    <Link
      href={`/search?route=${route.id}`}
      className="group flex flex-col overflow-hidden rounded-panel border border-border-subtle bg-surface-1 transition-[transform,border-color,box-shadow] duration-300 ease-nova hover:-translate-y-1 hover:border-border-strong hover:shadow-e2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <Image
          src={imgSrc}
          alt={media?.caption ?? route.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-nova group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
          <span>{route.code}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {hours ? `${hours}g` : ''}
            {mins ? ` ${mins}p` : ''}
          </span>
        </div>
        <h3 className="font-display mt-3 text-2xl font-semibold tracking-tight text-fg">
          {route.origin_name} — {route.destination_name}
        </h3>
        {route.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-muted">
            {route.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between border-t border-border-subtle pt-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-fg-muted">
              Từ
            </p>
            {route.from_price_vnd ? (
              <Money
                value={route.from_price_vnd}
                className="text-xl font-semibold text-fg"
              />
            ) : (
              <span className="text-fg-muted">Liên hệ</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-fg-secondary transition-colors group-hover:text-brand-fg">
            Xem lịch chạy <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [liveRoutes, settings] = await Promise.all([
    safe(publicApi.routes(), []),
    safe(publicApi.settings(), DEFAULT_SETTINGS),
  ]);
  const routes = liveRoutes.length ? liveRoutes : DEMO_ROUTES;

  const featuredRoutes = [
    routes.find((r) => r.code === 'HN-HL') ?? routes[0],
    routes.find((r) => r.code === 'HN-NBH') ?? routes[1],
    routes.find((r) => r.code === 'HN-NB') ?? routes[2],
  ].filter(Boolean) as RouteDto[];
  const featuredIds = new Set(featuredRoutes.map((r) => r.id));
  const otherRoutes = routes.filter((r) => !featuredIds.has(r.id));

  return (
    <>
      {/* ---------- Full-bleed Editorial Hero ---------- */}
      <section className="relative isolate overflow-hidden border-b border-border-subtle bg-canvas">
        <div className="relative min-h-[540px] lg:min-h-[610px]">
          <Image
            src="/media/hero-limo-light.jpg"
            alt="Khoang ghế thương gia sáng rộng trên xe limousine NovaLimo"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
          {/* Sculpted warm sunlit alabaster scrim — readable typography on the left, crisp sunlit cabin on the right */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/90 to-canvas/15 lg:via-canvas/82 lg:to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-canvas to-transparent"
            aria-hidden
          />

          <Container className="relative flex min-h-[540px] flex-col justify-center pb-24 pt-16 lg:min-h-[610px] lg:pb-28 lg:pt-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-fg">
                Hà Nội · Hạ Long · Hải Phòng · Ninh Bình · Nội Bài
              </p>
              <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.03] tracking-tight text-fg sm:text-6xl lg:text-[4.25rem]">
                Hành trình riêng tư,
                <br />
                <span className="italic font-medium text-fg-secondary">
                  khởi đầu từ cửa nhà.
                </span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-fg-secondary sm:text-lg">
                Limousine 9 &amp; 12 chỗ đón trả tận nơi. Chọn ghế trực tuyến
                trong một phút, thanh toán VietQR xác nhận tức thì.
              </p>

              <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-border-default/80 pt-6">
                {[
                  [`${routes.length}+`, 'Tuyến mỗi ngày'],
                  [
                    `${settings.booking.seat_hold_minutes} phút`,
                    'Giữ ghế không cọc',
                  ],
                  [`${settings.booking.free_cancel_hours} giờ`, 'Hủy miễn phí'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dd className="font-display text-2xl font-semibold tabular-nums text-fg sm:text-3xl">
                      {value}
                    </dd>
                    <dt className="mt-0.5 text-xs text-fg-muted">{label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </div>

        {/* Architectural Floating Booking Bar bridging Hero & Canvas */}
        <Container className="relative z-10 -mt-14 pb-16 sm:-mt-16 sm:pb-20">
          <div
            id="dat-ve"
            className="scroll-mt-28 rounded-panel border border-border-default bg-surface-1 p-5 shadow-e3 sm:p-7"
          >
            <TripSearchForm routes={routes} />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-subtle pt-4 text-xs text-fg-muted">
              <span className="font-medium uppercase tracking-[0.14em]">
                Tuyến phổ biến:
              </span>
              {routes.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/search?route=${r.id}`}
                  className="inline-flex items-center gap-1.5 text-fg-secondary underline decoration-border-strong underline-offset-4 transition-colors hover:text-brand-fg hover:decoration-brand"
                >
                  {r.origin_name} → {r.destination_name}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ---------- Signature Destinations & Timetable (Warm Paper) ---------- */}
      <Section
        eyebrow="Hành trình tiêu biểu"
        title="Những tuyến đường được chọn nhiều nhất"
        lead="Khởi hành nhiều khung giờ trong ngày. Giá vé niêm yết trọn gói, đã bao gồm đón trả nội thành, nước uống và bảo hiểm hành khách."
        className="nl-surface-paper"
        action={
          <Link
            href="/pricing"
            className={buttonClasses({ variant: 'outline' })}
          >
            Xem toàn bộ bảng giá <ArrowRight className="size-4" />
          </Link>
        }
      >
        <div className="grid gap-6 md:grid-cols-3">
          {featuredRoutes.map((r, i) => (
            <FeaturedRouteCard
              key={r.id}
              route={r}
              fallbackPhoto={
                i === 0
                  ? '/media/dest-halong.jpg'
                  : i === 1
                    ? '/media/dest-ninhbinh.jpg'
                    : '/media/fleet-exterior.jpg'
              }
            />
          ))}
        </div>

        {otherRoutes.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-panel border border-border-subtle bg-surface-1">
            <div className="border-b border-border-subtle px-6 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-muted">
                Các tuyến khai thác khác
              </p>
            </div>
            <ul className="divide-y divide-border-subtle">
              {otherRoutes.map((r) => {
                const h = Math.floor(r.duration_min / 60);
                const m = r.duration_min % 60;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/search?route=${r.id}`}
                      className="group flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-canvas"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="w-16 text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
                          {r.code}
                        </span>
                        <span className="font-display text-xl font-semibold text-fg group-hover:text-brand-fg">
                          {r.origin_name} — {r.destination_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="hidden text-fg-muted sm:inline">
                          {h ? `${h} giờ ` : ''}
                          {m ? `${m} phút` : ''}
                          {r.distance_km ? ` · ${r.distance_km} km` : ''}
                        </span>
                        {r.from_price_vnd && (
                          <Money
                            value={r.from_price_vnd}
                            className="font-semibold text-fg"
                          />
                        )}
                        <ArrowUpRight className="size-4 text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-fg" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Section>

      {/* ---------- Interactive Cabin & Seat Preview (Warm Sand Linen) ---------- */}
      <Section
        id="trai-nghiem-ghe"
        className="nl-surface-linen border-y border-border-subtle"
      >
        <InteractiveSeatDemo firstRouteId={routes[0]?.id} />
      </Section>

      {/* ---------- The NovaLimo Standard (Crisp White Asymmetric Editorial) ---------- */}
      <Section className="bg-surface-1">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-fg">
              Chuẩn mực dịch vụ
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-[2.75rem]">
              Ít lời hứa hơn.
              <br />
              <span className="italic font-medium text-fg-secondary">
                Nhiều sự chỉn chu hơn.
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-fg-muted">
              Mỗi chuyến xe NovaLimo được vận hành theo quy trình chuẩn khách
              sạn — để bạn chỉ cần bước lên xe và nghỉ ngơi.
            </p>
            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-panel border border-border-subtle">
              <Image
                src="/media/fleet-exterior.jpg"
                alt="Xe limousine NovaLimo đón khách tại sảnh khách sạn Hà Nội"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <ol className="divide-y divide-border-subtle border-y border-border-subtle lg:col-span-7">
            {STANDARDS.map((item) => (
              <li
                key={item.n}
                className="grid gap-4 py-8 sm:grid-cols-[72px_1fr] sm:items-baseline"
              >
                <span className="font-display text-3xl font-medium italic text-brand-fg">
                  {item.n}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-fg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-secondary sm:text-base">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ---------- Single Architectural Contrast Band (Deep Espresso) ---------- */}
      <section className="nl-surface-espresso py-20 text-slate-100 sm:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">
              Cảm nhận từ hành khách
            </p>
            <blockquote className="font-display mt-6 text-3xl font-medium italic leading-[1.28] text-white sm:text-4xl lg:text-[2.75rem]">
              “Lần đầu tiên đi Hà Nội – Hạ Long mà không cần ra bến. Bước xuống
              sảnh chung cư, xe đã đợi sẵn với nước mát và ghế massage êm ái.”
            </blockquote>
            <p className="mt-6 text-sm text-slate-400">
              <strong className="font-medium text-slate-200">Minh Anh</strong> ·
              Hành khách tuyến Hà Nội – Hạ Long
            </p>
          </div>

          <div className="mt-16 grid gap-10 border-t border-white/15 pt-14 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-300">
                  Đặt vé &amp; Đặt đoàn riêng
                </p>
                <h2 className="font-display mt-3 text-3xl font-semibold text-white">
                  Sẵn sàng cho chuyến đi tiếp theo?
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
                  Chọn ghế trực tuyến ngay trong 60 giây, hoặc liên hệ đội ngũ
                  điều phối để đặt nguyên xe cho gia đình &amp; doanh nghiệp.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/#dat-ve" className={buttonClasses({ size: 'lg' })}>
                  Đặt vé ngay <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className={buttonClasses({
                    variant: 'outline',
                    size: 'lg',
                    className:
                      'border-white/25 text-white hover:border-gold-300 hover:text-gold-200',
                  })}
                >
                  Liên hệ đặt đoàn
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 border-t border-white/15 pt-10 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-300">
                  Ký gửi hỏa tốc
                </p>
                <h2 className="font-display mt-3 text-3xl font-semibold text-white">
                  Gửi hàng theo chuyến trong ngày
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
                  Lấy hàng tận nơi, đi cùng chuyến limousine gần nhất, hỗ trợ
                  thu hộ COD và tra cứu vận đơn trực tuyến.
                </p>
              </div>
              <Link
                href="/cargo"
                className="inline-flex items-center gap-2 self-start text-sm font-semibold text-gold-300 underline decoration-gold-300/40 underline-offset-8 transition-colors hover:text-white hover:decoration-white"
              >
                Tạo đơn ký gửi hàng <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
