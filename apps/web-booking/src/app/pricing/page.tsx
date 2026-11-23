import { Money, buttonClasses } from '@limousine-workspace/shared-ui';
import { formatDuration } from '@limousine-workspace/utils-core';
import { ArrowRight, Crown, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHero } from '../../components/site/Section';
import { DEFAULT_SETTINGS, publicApi, safe } from '../../lib/api';
import { DEMO_ROUTES } from '../../lib/demo-data';

export const metadata: Metadata = {
  title: 'Bảng giá vé limousine',
  description:
    'Giá vé limousine các tuyến Hà Nội – Hạ Long, Nội Bài, Hải Phòng. Đã gồm đón trả tận nơi, nước uống và bảo hiểm.',
  alternates: { canonical: '/pricing' },
};
export const revalidate = 300;

export default async function PricingPage() {
  const [liveRoutes, settings] = await Promise.all([
    safe(publicApi.routes(), []),
    safe(publicApi.settings(), DEFAULT_SETTINGS),
  ]);
  const routes = liveRoutes.length ? liveRoutes : DEMO_ROUTES;
  const p = settings.booking;
  return (
    <>
      <PageHero
        eyebrow="Bảng giá"
        title="Giá minh bạch, không phụ thu ẩn"
        lead="Giá vé đã bao gồm đón trả tận nơi trong khu vực nội thành, nước uống và bảo hiểm hành khách."
      />
      <Container className="py-10 sm:py-14">
        <div className="overflow-hidden rounded-panel border border-border-subtle bg-surface-1 shadow-e1">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Giá vé theo tuyến</caption>
            <thead className="bg-surface-2 text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">
                  Tuyến
                </th>
                <th
                  scope="col"
                  className="hidden px-5 py-4 font-medium sm:table-cell"
                >
                  Thời gian
                </th>
                <th
                  scope="col"
                  className="hidden px-5 py-4 font-medium md:table-cell"
                >
                  Điểm đón
                </th>
                <th scope="col" className="px-5 py-4 text-right font-medium">
                  Ghế thường
                </th>
                <th scope="col" className="px-5 py-4 text-right font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Crown className="size-3.5 text-brand-fg" /> Ghế VIP
                  </span>
                </th>
                <th scope="col" className="w-0 px-5 py-4">
                  <span className="sr-only">Đặt vé</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-border-subtle transition-colors hover:bg-canvas/70"
                >
                  <th scope="row" className="px-5 py-5 font-medium text-fg">
                    {r.name}
                    {r.distance_km ? (
                      <span className="block text-xs font-normal text-fg-muted">
                        {r.distance_km} km
                      </span>
                    ) : null}
                  </th>
                  <td className="hidden px-5 py-5 text-fg-secondary sm:table-cell">
                    {formatDuration(r.duration_min)}
                  </td>
                  <td className="hidden px-5 py-5 text-fg-secondary md:table-cell">
                    {r.stops?.filter((s) => s.kind !== 'DROPOFF').length ?? 0}{' '}
                    điểm + tận nơi
                  </td>
                  <td className="px-5 py-5 text-right font-semibold text-fg">
                    {r.from_price_vnd ? (
                      <Money value={r.from_price_vnd} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-5 text-right font-semibold text-brand-fg">
                    {r.from_price_vnd ? (
                      <Money
                        value={r.from_price_vnd + (r.vip_surcharge_vnd ?? 0)}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-5">
                    <Link
                      href={`/search?route=${r.id}`}
                      className={buttonClasses({
                        size: 'sm',
                        variant: 'outline',
                      })}
                      aria-label={`Đặt vé ${r.name}`}
                    >
                      Đặt <ArrowRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-fg-muted">
          Giá có thể thay đổi theo ngày lễ, Tết. Giá chính xác hiển thị khi chọn
          chuyến.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-panel border border-info-border bg-info-bg p-6">
            <h2 className="flex items-center gap-2 font-semibold text-info-fg">
              <Info className="size-4" /> Chính sách hủy vé
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-fg-secondary">
              <li>
                Hủy trước giờ khởi hành từ {p.free_cancel_hours} giờ trở lên:
                hoàn 100%.
              </li>
              <li>Hủy muộn hơn: hoàn {p.late_cancel_refund_pct}% giá vé.</li>
              <li>
                Vé chưa thanh toán được hủy tự động sau {p.payment_due_minutes}{' '}
                phút.
              </li>
            </ul>
          </div>
          <div className="rounded-panel border border-border-subtle bg-surface-1 p-6">
            <h2 className="font-semibold text-fg">Trẻ em & hành lý</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-fg-secondary">
              <li>
                Trẻ từ 2 tuổi trở lên cần mua vé riêng để có ghế ngồi an toàn.
              </li>
              <li>
                Miễn phí 1 vali xách tay và 1 vali ký gửi cỡ trung mỗi hành
                khách.
              </li>
              <li>Hành lý quá cỡ vui lòng ghi chú khi đặt vé.</li>
            </ul>
          </div>
        </div>
      </Container>
    </>
  );
}
