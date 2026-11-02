'use client';

import { buttonClasses, cn } from '@limousine-workspace/shared-ui';
import { Menu, Phone, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

/** Full-screen sheet menu for < lg. */
export function MobileNav({ hotline }: { hotline: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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
      {open && (
        <div
          className="fixed inset-0 z-[1000] flex flex-col bg-canvas/98 backdrop-blur-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex h-[72px] items-center justify-between border-b border-border-subtle px-4">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={buttonClasses({ variant: 'ghost', size: 'icon-md' })}
              aria-label="Đóng menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="Chính">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-card px-4 py-3.5 text-lg font-medium',
                  isActive(pathname, l.href)
                    ? 'bg-brand-subtle text-brand-fg'
                    : 'text-fg-secondary hover:bg-surface-2',
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/my-tickets"
              className="rounded-card px-4 py-3.5 text-lg font-medium text-fg-secondary hover:bg-surface-2"
            >
              Tra cứu vé
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-border-subtle p-4">
            <Link
              href="/#dat-ve"
              className={buttonClasses({ size: 'lg', fullWidth: true })}
            >
              Đặt vé ngay
            </Link>
            <a
              href={`tel:${hotline.replace(/\s/g, '')}`}
              className={buttonClasses({
                variant: 'secondary',
                size: 'lg',
                fullWidth: true,
              })}
            >
              <Phone className="size-4" /> Hotline {hotline}
            </a>
          </div>
        </div>
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
