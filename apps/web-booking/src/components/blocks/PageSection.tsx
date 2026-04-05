import type { ReactNode } from 'react';

type PageSectionProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Centered content column (~1440px max) with horizontal padding aligned to the booking design spec.
 */
export function PageSection({ className, children }: PageSectionProps) {
  return (
    <section
      className={[
        'mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-10 lg:px-16',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}
