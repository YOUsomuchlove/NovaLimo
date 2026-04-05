'use client';

import Link from 'next/link';

/** Khối footer ~380px nền #0B1020 — pen `footer` / `foot` */
export function SiteFooter() {
  return (
    <footer
      className="min-h-[380px] bg-[#0B1020] px-4 py-12 text-[#B8BCC8] md:px-8"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <p className="text-lg font-black text-white">NovaLimo</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed">
            Đặt vé limousine tuyến cố định, đón trả tận nơi. Hỗ trợ 24/7.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-[#E8EAEF]">Dịch vụ</span>
            <Link href="/search" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              Tìm chuyến
            </Link>
            <Link href="/cargo" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              Ký gửi hàng
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-[#E8EAEF]">Công ty</span>
            <Link href="/about" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              Giới thiệu
            </Link>
            <Link href="/pricing" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              Bảng giá
            </Link>
            <Link href="/contact" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              Liên hệ
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-[#E8EAEF]">Pháp lý</span>
            <Link href="/terms" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              Điều khoản
            </Link>
            <Link href="/privacy" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              Bảo mật
            </Link>
            <Link href="/faq" className="text-[#B8BCC8] no-underline hover:text-[#D4AF37]">
              FAQ
            </Link>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-[1440px] border-t border-white/10 pt-8 text-center text-xs text-[#8B90A0]">
        © {new Date().getFullYear()} NovaLimo. Hotline{' '}
        <a href="tel:19003528" className="text-[#D4AF37] no-underline">
          1900 xxxx
        </a>
      </p>
    </footer>
  );
}
