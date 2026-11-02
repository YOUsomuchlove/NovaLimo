import { cn } from '@limousine-workspace/shared-ui';

/** NovaLimo monogram + wordmark. */
export function Logo({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="nl-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--color-gold-300)' }} />
            <stop offset="1" style={{ stopColor: 'var(--color-gold-700)' }} />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#nl-logo)" />
        <path
          d="M9 23V9h2.6l7.9 9.6V9H22v14h-2.6L11.5 13.4V23H9Z"
          style={{ fill: 'var(--color-navy-900)' }}
        />
      </svg>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight text-fg">
          Nova<span className="text-brand-fg">Limo</span>
        </span>
      )}
    </span>
  );
}
