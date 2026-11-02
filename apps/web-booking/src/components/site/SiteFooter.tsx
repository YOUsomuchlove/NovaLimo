'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import {
  FOOTER_DESCRIPTION,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_HOTLINE_DISPLAY,
  SITE_HOTLINE_TEL,
} from '../../lib/site-contact';

/**
 * Booking Footer — khớp frame n6z7m (web-bôking.pen): viền vàng trên, 3 cột, typography.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const linkClass =
    'block text-sm font-medium text-nova-text no-underline transition-colors hover:text-nova-gold';

  return (
    <footer className="bg-[#0B1020]" role="contentinfo">
      <div className="mx-auto max-w-[1440px] border-t border-[#D4AF37] px-4 pb-10 pt-12 md:px-16">
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          <div>
            <p className="text-[20px] font-extrabold text-white">NovaLimo</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-nova-muted">
              {FOOTER_DESCRIPTION}
            </p>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-nova-gold">Liên kết</p>
            <nav className="flex flex-col gap-2" aria-label="Liên kết nhanh">
              <Link href="/" className={linkClass}>
                Trang Chủ
              </Link>
              <Link href="/about" className={linkClass}>
                Giới Thiệu
              </Link>
              <Link href="/pricing" className={linkClass}>
                Bảng Giá
              </Link>
              <Link href="/contact" className={linkClass}>
                Liên Hệ
              </Link>
              <Link href="/cargo" className={linkClass}>
                Ký gửi hàng
              </Link>
            </nav>
          </div>
          <div>
            <p className="mb-4 text-sm font-bold text-nova-gold">Liên Hệ</p>
            <ul className="list-none space-y-2 p-0 text-sm font-medium text-nova-text">
              <li>
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                  Hotline:{' '}
                </span>
                <a
                  href={`tel:${SITE_HOTLINE_TEL}`}
                  className="font-medium text-nova-text no-underline hover:text-nova-gold"
                >
                  {SITE_HOTLINE_DISPLAY}
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#D4AF37]" aria-hidden />
                  Email:{' '}
                </span>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="text-nova-text no-underline hover:text-nova-gold"
                >
                  {SITE_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                  aria-hidden
                />
                <span>Địa chỉ VP: {SITE_ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[1312px] border-t border-nova-footer-rule pt-6">
          <p className="text-center text-xs leading-relaxed text-nova-copyright">
            © {year} NovaLimo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
