import { buttonClasses } from '@limousine-workspace/shared-ui';
import {
  ArrowRight,
  Gem,
  HeartHandshake,
  Route as RouteIcon,
  ShieldCheck,
  Timer,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container, PageHero, Section } from '../../components/site/Section';
import { publicApi, safe } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description:
    'NovaLimo — dịch vụ limousine đón trả tận nơi với điều phối thông minh, tài xế chuyên nghiệp và trải nghiệm hạng thương gia.',
  alternates: { canonical: '/about' },
};
export const revalidate = 300;

const VALUES = [
  {
    icon: Timer,
    title: 'Đúng giờ',
    body: 'Lộ trình đón được tối ưu để mỗi khách chờ ít nhất có thể và xe xuất phát đúng lịch.',
  },
  {
    icon: ShieldCheck,
    title: 'An toàn',
    body: 'Tài xế được đào tạo, xe bảo dưỡng định kỳ, mọi chuyến được theo dõi vị trí theo thời gian thực.',
  },
  {
    icon: Gem,
    title: 'Tiện nghi',
    body: 'Không gian rộng, ghế êm, sạch sẽ — để hành trình dài trở nên nhẹ nhàng.',
  },
  {
    icon: HeartHandshake,
    title: 'Tận tâm',
    body: 'Một số điện thoại cho mọi việc. Gọi là có người nghe, hỏi là có câu trả lời.',
  },
];

export default async function AboutPage() {
  const routes = await safe(publicApi.routes(), []);
  return (
    <>
      <PageHero
        eyebrow="Về NovaLimo"
        title="Hành trình đẳng cấp, bắt đầu từ cửa nhà bạn"
        lead="Chúng tôi xây dựng NovaLimo để mỗi chuyến đi liên tỉnh đều riêng tư, đúng giờ và dễ chịu như ngồi xe gia đình."
      />
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sheet border border-border-subtle">
            <Image
              src="/media/carousel-background.png"
              alt="Nội thất ghế limousine NovaLimo"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/70 to-transparent" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-fg">
              Câu chuyện
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
              Không còn ra bến, không còn chờ đợi
            </h2>
            <div className="mt-5 flex flex-col gap-4 text-fg-secondary">
              <p>
                Thay vì gom khách ở bến, NovaLimo đón bạn ngay tại địa chỉ bạn
                chọn. Hệ thống điều phối gom các điểm đón gần nhau vào cùng một
                xe và sắp xếp thứ tự đón ngắn nhất — nên xe vẫn xuất phát đúng
                giờ.
              </p>
              <p>
                Bạn biết trước xe nào, tài xế nào sẽ đón; được báo khi xe sắp
                tới; và thanh toán bằng một lần quét mã.
              </p>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <dt className="flex items-center gap-2 text-sm text-fg-muted">
                  <RouteIcon className="size-4" /> Tuyến khai thác
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-fg">
                  {routes.length}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm text-fg-muted">
                  <Users className="size-4" /> Dòng xe
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-fg">
                  9 & 12 chỗ
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>
      <Section
        eyebrow="Giá trị"
        title="Điều chúng tôi cam kết"
        className="border-t border-border-subtle bg-surface-1/30"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-panel border border-border-subtle bg-surface-1 p-6"
            >
              <v.icon className="size-6 text-brand-fg" />
              <h3 className="mt-4 font-semibold text-fg">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </Section>
      <Container className="pb-20 text-center">
        <Link href="/#dat-ve" className={buttonClasses({ size: 'lg' })}>
          Đặt chuyến đầu tiên <ArrowRight className="size-4" />
        </Link>
      </Container>
    </>
  );
}
