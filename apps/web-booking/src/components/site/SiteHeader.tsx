'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Drawer } from 'antd';
import { Menu, Plus } from 'lucide-react';
import React, { useState } from 'react';

const NAV_LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'Trang Chủ' },
  { href: '/about', label: 'Giới Thiệu' },
  { href: '/pricing', label: 'Bảng Giá' },
  { href: '/cargo', label: 'Ký gửi hàng' },
  { href: '/contact', label: 'Liên Hệ' },
];

/**
 * Top Navigation — padding ngang 64px (md+), gap nav 22px, CTA "+ Đặt vé ngay".
 * Mobile: Drawer + nút Menu.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navBase =
    'relative flex items-center whitespace-nowrap px-0 py-1 text-[12px] font-semibold leading-none tracking-[0.02em] no-underline transition-colors';
  const navInactive = `${navBase} text-white/75! hover:text-white!`;

  function isActiveHref(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function navCls(href: string) {
    const active = isActiveHref(href);
    if (active) {
      return `${navBase} text-[#D4AF37]! font-extrabold`;
    }
    return navInactive;
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-t border-[#D4AF37] bg-[#0B1020] shadow-[0_8px_24px_rgba(0,0,0,0.30)]"
      role="banner"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_45%,rgba(0,0,0,0.25)_100%)]" />
      <div className="relative mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 md:gap-6 md:px-16">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-white no-underline"
        >
          <span className="text-[14px] font-extrabold tracking-wide text-white">
            NovaLimo
          </span>
        </Link>

        <nav
          className="hidden h-full min-w-0 flex-1 items-center justify-center gap-x-4 md:flex md:gap-x-6"
          aria-label="Điều hướng chính"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActiveHref(href);
            return (
              <Link
                key={href}
                href={href}
                className={navCls(href)}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
            aria-label="Mở menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
          </button>
          <Link href="/search" className="no-underline">
            <Button
              type="primary"
              size="middle"
              className="inline-flex! h-[36px] min-w-[152px] items-center justify-center gap-2 rounded-[14px] border-0 bg-nova-gold! px-4! text-[12px]! font-bold! text-[#0B1020]! shadow-[0_10px_18px_rgba(0,0,0,0.28)] hover:bg-nova-gold-hover!"
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] bg-[#0B1020] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <Plus
                  className="h-[12px] w-[12px] text-[#D4AF37]"
                  strokeWidth={3}
                  aria-hidden
                />
              </span>
              Đặt vé ngay
            </Button>
          </Link>
        </div>
      </div>

      <Drawer
        title={<span className="font-extrabold text-nova-bg">NovaLimo</span>}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{ body: { paddingTop: 8 } }}
        size={280}
      >
        <nav className="flex flex-col gap-1" aria-label="Menu di động">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-3 text-base font-semibold no-underline ${
                pathname === href
                  ? 'bg-nova-gold/15 text-nova-gold'
                  : 'text-nova-bg hover:bg-black/5'
              }`}
              onClick={() => setDrawerOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/my-tickets"
            className="rounded-lg px-3 py-3 text-base font-semibold text-nova-bg no-underline hover:bg-black/5"
            onClick={() => setDrawerOpen(false)}
          >
            Vé của tôi
          </Link>
          <Link
            href="/search"
            className="mt-2 flex items-center justify-center gap-2 rounded-(--radius-nova-md) bg-nova-gold px-4 py-3 text-center text-base font-black text-nova-bg no-underline"
            onClick={() => setDrawerOpen(false)}
          >
            Đặt vé ngay
          </Link>
        </nav>
      </Drawer>
    </header>
  );
}
