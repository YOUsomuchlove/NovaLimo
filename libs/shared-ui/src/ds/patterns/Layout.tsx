import { ChevronRight } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type LinkComponent = ComponentType<{
  href: string;
  className?: string;
  children: ReactNode;
}>;

const DefaultLink: LinkComponent = ({ href, className, children }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

/* ---------- PageHeader ---------- */

export interface Crumb {
  label: ReactNode;
  href?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  meta,
  linkComponent: Link = DefaultLink,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  /** Tags / status shown next to the title */
  meta?: ReactNode;
  /** Pass Next's `Link` from the app so the lib stays framework-free */
  linkComponent?: LinkComponent;
  className?: string;
}) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 lg:mb-8', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-ui text-fg-muted">
            {breadcrumbs.map((c, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={i} className="flex items-center gap-1">
                  {c.href && !last ? (
                    <Link
                      href={c.href}
                      className="transition-colors hover:text-fg"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(last && 'text-fg-secondary')}
                      aria-current={last ? 'page' : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                  {!last && <ChevronRight className="size-3.5 opacity-60" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px] sm:leading-9">
              {title}
            </h1>
            {meta}
          </div>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-fg-muted">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------- FormSection: label column + fields column (pen form pattern) ---------- */

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'grid gap-5 border-b border-border-subtle py-7 first:pt-0 last:border-b-0 last:pb-0 lg:grid-cols-[280px_1fr] lg:gap-10',
        className,
      )}
    >
      <div>
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {description && (
          <p className="mt-1 text-ui text-fg-muted">{description}</p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/* ---------- DetailLayout: main column + sticky aside ---------- */

export function DetailLayout({
  main,
  aside,
  className,
}: {
  main: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        aside && 'xl:grid-cols-[minmax(0,1fr)_360px]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-6">{main}</div>
      {aside && (
        <aside className="flex flex-col gap-6 xl:sticky xl:top-24 xl:self-start">
          {aside}
        </aside>
      )}
    </div>
  );
}

/* ---------- DescriptionList ---------- */

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
  /** Span full row */
  full?: boolean;
}

export function DescriptionList({
  items,
  columns = 2,
  className,
}: {
  items: DescriptionItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const cols = {
    1: '',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
  }[columns];
  return (
    <dl className={cn('grid gap-x-8 gap-y-5', cols, className)}>
      {items.map((it, i) => (
        <div key={i} className={cn('min-w-0', it.full && 'sm:col-span-full')}>
          <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            {it.label}
          </dt>
          <dd className="mt-1 break-words text-sm text-fg">
            {it.value ?? '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Timeline ---------- */

export interface TimelineItem {
  title: ReactNode;
  time?: ReactNode;
  description?: ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: ReactNode;
}

const timelineDot = {
  brand: 'bg-brand ring-brand-subtle',
  success: 'bg-success-solid ring-success-bg',
  warning: 'bg-warning-solid ring-warning-bg',
  danger: 'bg-danger-solid ring-danger-bg',
  info: 'bg-info-solid ring-info-bg',
  neutral: 'bg-fg-disabled ring-surface-3',
};

export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <ol className={cn('relative flex flex-col gap-6', className)}>
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-4">
          {i < items.length - 1 && (
            <span
              className="absolute left-[7px] top-5 h-[calc(100%+8px)] w-px bg-border-default"
              aria-hidden
            />
          )}
          <span
            className={cn(
              'relative mt-1 flex size-[15px] shrink-0 items-center justify-center rounded-full ring-4',
              timelineDot[it.tone ?? 'neutral'],
            )}
          >
            {it.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-medium text-fg">{it.title}</p>
              {it.time && (
                <span className="text-xs tabular-nums text-fg-muted">
                  {it.time}
                </span>
              )}
            </div>
            {it.description && (
              <p className="mt-0.5 text-ui text-fg-muted">{it.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
