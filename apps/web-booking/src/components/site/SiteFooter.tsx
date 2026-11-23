import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import type { PublicSettings } from '../../lib/api';
import { Logo } from './Logo';

const COLUMNS = [
  {
    title: 'Dịch vụ',
    links: [
      { href: '/#dat-ve', label: 'Đặt vé limousine' },
      { href: '/cargo', label: 'Ký gửi hàng' },
      { href: '/cargo/track', label: 'Tra cứu vận đơn' },
      { href: '/pricing', label: 'Bảng giá' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { href: '/my-tickets', label: 'Tra cứu vé' },
      { href: '/faq', label: 'Câu hỏi thường gặp' },
      { href: '/contact', label: 'Liên hệ' },
    ],
  },
  {
    title: 'Pháp lý',
    links: [
      { href: '/terms', label: 'Điều khoản sử dụng' },
      { href: '/privacy', label: 'Chính sách bảo mật' },
    ],
  },
];

export function SiteFooter({
  company,
}: {
  company: PublicSettings['company'];
}) {
  return (
    <footer className="border-t border-border-subtle bg-surface-1">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-5">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
            Limousine đón trả tận nơi, đúng giờ và riêng tư. Một số điện thoại
            cho mọi việc: đặt vé, tra cứu và hỗ trợ.
          </p>
          <ul className="flex flex-col gap-2.5 text-sm text-fg-secondary">
            <li>
              <a
                href={`tel:${company.hotline.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2.5 hover:text-brand-fg"
              >
                <Phone className="size-4 text-brand-fg" /> Hotline{' '}
                <strong className="font-semibold tabular-nums text-fg">
                  {company.hotline}
                </strong>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${company.email}`}
                className="inline-flex items-center gap-2.5 hover:text-brand-fg"
              >
                <Mail className="size-4 text-brand-fg" /> {company.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-fg" />{' '}
              {company.address}
            </li>
          </ul>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-fg-muted">
              {c.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-fg-secondary transition-colors hover:text-fg"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border-subtle bg-canvas/70">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {company.name}. Bảo lưu mọi quyền.
          </p>
          <p>Thanh toán an toàn qua VietQR · Hỗ trợ 24/7</p>
        </div>
      </div>
    </footer>
  );
}
