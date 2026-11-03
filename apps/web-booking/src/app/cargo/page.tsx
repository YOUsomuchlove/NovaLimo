import { buttonClasses } from '@limousine-workspace/shared-ui';
import {
  ArrowRight,
  Banknote,
  Clock,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHero, Section } from '../../components/site/Section';
import { publicApi, safe } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Ký gửi hàng theo xe limousine',
  description:
    'Gửi hàng Hà Nội – Hạ Long, Nội Bài, Hải Phòng trong ngày. Lấy tận nơi, thu hộ COD, theo dõi vận đơn trực tuyến.',
  alternates: { canonical: '/cargo' },
};
export const revalidate = 300;

const USP = [
  {
    icon: Clock,
    title: 'Giao trong ngày',
    body: 'Theo lịch xe chạy mỗi 2 giờ.',
  },
  { icon: Truck, title: 'Lấy & giao tận nơi', body: 'Không cần mang ra bến.' },
  {
    icon: Banknote,
    title: 'Thu hộ COD',
    body: 'Đối soát minh bạch, chuyển trả nhanh.',
  },
  {
    icon: ShieldCheck,
    title: 'Bảo hiểm hàng hóa',
    body: 'Theo giá trị khai báo.',
  },
];

const STEPS = [
  'Tạo đơn & nhận báo giá ngay',
  'Nhân viên gọi xác nhận, tài xế đến lấy',
  'Hàng đi cùng chuyến limousine gần nhất',
  'Người nhận ký nhận, bạn nhận thông báo',
];

export default async function CargoLandingPage() {
  const settings = await safe(publicApi.settings(), null);
  return (
    <>
      <PageHero
        eyebrow="Ký gửi hàng"
        title="Gửi hàng nhanh như đặt một chiếc ghế"
        lead="Kiện hàng của bạn đi cùng chuyến limousine gần nhất, được tài xế giao tận tay người nhận."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/cargo/book" className={buttonClasses({ size: 'lg' })}>
            Tạo đơn gửi hàng <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/cargo/track"
            className={buttonClasses({ size: 'lg', variant: 'secondary' })}
          >
            <Search className="size-4" /> Tra cứu vận đơn
          </Link>
        </div>
      </PageHero>
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USP.map((u) => (
            <div
              key={u.title}
              className="rounded-panel border border-border-subtle bg-surface-1 p-6"
            >
              <u.icon className="size-6 text-brand-fg" />
              <h2 className="mt-4 font-semibold text-fg">{u.title}</h2>
              <p className="mt-1 text-sm text-fg-muted">{u.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section
        eyebrow="Quy trình"
        title="4 bước, không cần ra bến"
        className="pt-0 sm:pt-0"
      >
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="rounded-panel border border-border-subtle bg-surface-1 p-6"
            >
              <span className="text-sm font-semibold text-brand-fg">
                0{i + 1}
              </span>
              <p className="mt-3 text-sm text-fg-secondary">{s}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Container className="pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-sheet border border-brand/25 bg-brand-subtle p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="flex items-center gap-4">
            <PackageCheck className="size-10 shrink-0 text-brand-fg" />
            <div>
              <p className="text-xl font-semibold text-fg">
                Cần gửi gấp hoặc số lượng lớn?
              </p>
              <p className="text-sm text-fg-secondary">
                Gọi hotline {settings?.company.hotline ?? ''} để được báo giá
                riêng.
              </p>
            </div>
          </div>
          <Link href="/cargo/book" className={buttonClasses()}>
            Báo giá ngay <ArrowRight className="size-4" />
          </Link>
        </div>
      </Container>
    </>
  );
}
