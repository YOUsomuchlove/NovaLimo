import { buttonClasses } from '@limousine-workspace/shared-ui';
import { Ticket } from 'lucide-react';
import Link from 'next/link';
import { DesktopNav, MobileNav, TicketLookupLink } from './HeaderNav';
import { Logo } from './Logo';

/** 72px sticky header (pen: header pattern on every page). */
export function SiteHeader({ hotline }: { hotline: string }) {
  return (
    <header className="sticky top-0 z-[200] border-b border-border-subtle bg-canvas/80 backdrop-blur-xl supports-[backdrop-filter]:bg-canvas/65">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="NovaLimo — Trang chủ" className="shrink-0">
          <Logo />
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-1.5">
          <TicketLookupLink />
          <Link
            href="/#dat-ve"
            className={buttonClasses({
              size: 'sm',
              className: 'hidden sm:inline-flex',
            })}
          >
            <Ticket className="size-4" /> Đặt vé ngay
          </Link>
          <MobileNav hotline={hotline} />
        </div>
      </div>
    </header>
  );
}
