'use client';

import { buttonClasses, cn } from '@limousine-workspace/shared-ui';
import { Menu, Phone, Search, Ticket, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Logo } from './Logo';
import { NAV_LINKS, isActive } from './nav';

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Chính" className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            'relative rounded-control px-3.5 py-2 text-sm font-medium transition-colors',
            isActive(pathname, l.href)
              ? 'text-fg'
              : 'text-fg-muted hover:text-fg',
          )}
          aria-current={isActive(pathname, l.href) ? 'page' : undefined}
        >
          {l.label}
          {isActive(pathname, l.href) && (
            <span className="absolute inset-x-3.5 -bottom-[17px] h-0.5 rounded-full bg-brand" />
          )}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Full-screen mobile drawer rendered via Portal into `document.body` so it is never
 * trapped inside the sticky `<header>`'s `backdrop-filter` containing block.
 */
export function MobileNav({ hotline }: { hotline: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClasses({
          variant: 'ghost',
          size: 'icon-md',
          className: 'lg:hidden',
        })}
        aria-label="Mở menu"
        aria-expanded={open}
      >
        <Menu className="size-5" />
      </button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex h-dvh w-screen flex-col bg-surface-1 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border-subtle bg-surface-1 px-4">
              <Link href="/" onClick={close} aria-label="NovaLimo — Trang chủ">
                <Logo />
              </Link>
              <button
                type="button"
                onClick={close}
                className={buttonClasses({
                  variant: 'ghost',
                  size: 'icon-md',
                })}
                aria-label="Đóng menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav
              className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-4"
              aria-label="Chính"
            >
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className={cn(
                    'rounded-card px-4 py-3.5 text-base font-semibold transition-colors',
                    isActive(pathname, l.href)
                      ? 'border border-brand/30 bg-brand-subtle text-brand-fg'
                      : 'text-fg-secondary hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/my-tickets"
                onClick={close}
                className={cn(
                  'rounded-card px-4 py-3.5 text-base font-semibold transition-colors',
                  isActive(pathname, '/my-tickets')
                    ? 'border border-brand/30 bg-brand-subtle text-brand-fg'
                    : 'text-fg-secondary hover:bg-surface-2 hover:text-fg',
                )}
              >
                Tra cứu vé
              </Link>
            </nav>
            <div className="mt-auto flex shrink-0 flex-col gap-3 border-t border-border-subtle bg-canvas p-4">
              <Link
                href="/#dat-ve"
                onClick={close}
                className={buttonClasses({ size: 'lg', fullWidth: true })}
              >
                <Ticket className="size-4" /> Đặt vé ngay
              </Link>
              <a
                href={`tel:${hotline.replace(/\s/g, '')}`}
                onClick={close}
                className={buttonClasses({
                  variant: 'outline',
                  size: 'lg',
                  fullWidth: true,
                  className: 'bg-surface-1',
                })}
              >
                <Phone className="size-4 text-brand-fg" /> Hotline {hotline}
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function TicketLookupLink() {
  return (
    <Link
      href="/my-tickets"
      className={buttonClasses({
        variant: 'ghost',
        size: 'sm',
        className: 'hidden sm:inline-flex',
      })}
    >
      <Search className="size-4" /> Tra cứu vé
    </Link>
  );
}
