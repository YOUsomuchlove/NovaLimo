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
                <p className="mb-3 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-fg">
                  <span className="h-px w-8 bg-brand" aria-hidden />
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
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

/** Compact page hero for inner pages. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="nl-glow relative overflow-hidden border-b border-border-subtle">
      <Container className="py-14 sm:py-20">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-fg">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {lead}
          </p>
        )}
        {children}
      </Container>
    </div>
  );
}
