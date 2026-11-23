import { buttonClasses } from '@limousine-workspace/shared-ui';
import { Phone } from 'lucide-react';
import Link from 'next/link';
import { DesktopNav, MobileNav, TicketLookupLink } from './HeaderNav';
import { Logo } from './Logo';

/** Clean, minimal 72px editorial sticky header. */
export function SiteHeader({ hotline }: { hotline: string }) {
  return (
    <header className="sticky top-0 z-[200] border-b border-border-subtle bg-canvas/90 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/80">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="NovaLimo — Trang chủ" className="shrink-0">
          <Logo />
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-2">
          <a
            href={`tel:${hotline.replace(/\s/g, '')}`}
            className="hidden items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium tabular-nums text-fg-secondary transition-colors hover:text-fg xl:inline-flex"
          >
            <Phone className="size-3.5 text-brand-fg" />
            {hotline}
          </a>
          <span
            className="hidden h-4 w-px bg-border-default xl:inline-block"
            aria-hidden
          />
          <TicketLookupLink />
          <Link
            href="/#dat-ve"
            className={buttonClasses({
              size: 'sm',
              className: 'hidden sm:inline-flex',
            })}
          >
            Đặt vé
          </Link>
          <MobileNav hotline={hotline} />
        </div>
      </div>
    </header>
  );
}
