import { cn } from '@limousine-workspace/shared-ui';
import type { ReactNode } from 'react';

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1280px] px-4 sm:px-6', className)}
    >
      {children}
    </div>
  );
}

/** Section with optional eyebrow / title / lead, consistent vertical rhythm. */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  action,
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 py-16 sm:py-24', className)}>
      <Container>
        {(title || eyebrow) && (
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              {eyebrow && (
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-fg">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="font-display text-3xl font-semibold leading-[1.12] tracking-tight text-fg sm:text-[2.65rem]">
                  {title}
                </h2>
              )}
              {lead && (
                <p className="mt-4 text-base leading-relaxed text-fg-muted">
                  {lead}
                </p>
              )}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

const HERO_TONE = {
  brand: 'nl-glow',
  sky: 'nl-hero-sky',
  emerald: 'nl-hero-emerald',
  warm: 'nl-hero-warm',
  indigo: 'nl-hero-indigo',
} as const;

/** Compact page hero for inner pages with distinct vibrant tone per page. */
export function PageHero({
  eyebrow,
  title,
  lead,
  tone = 'brand',
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: keyof typeof HERO_TONE;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        HERO_TONE[tone],
        'relative overflow-hidden border-b border-border-subtle',
      )}
    >
      <Container className="py-14 sm:py-20">
        {eyebrow && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-fg">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-[3.5rem]">
          {title}
        </h1>
        {lead && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-secondary sm:text-lg">
            {lead}
          </p>
        )}
        {children}
      </Container>
    </div>
  );
}
