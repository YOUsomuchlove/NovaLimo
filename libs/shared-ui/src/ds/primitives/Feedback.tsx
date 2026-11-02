import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

/* ---------- Skeleton ---------- */

export function Skeleton({
  className,
  rounded = 'control',
}: {
  className?: string;
  rounded?: 'control' | 'card' | 'pill' | 'tag';
}) {
  const r = {
    control: 'rounded-control',
    card: 'rounded-card',
    pill: 'rounded-full',
    tag: 'rounded-tag',
  }[rounded];
  return <div aria-hidden className={cn('nl-skeleton h-4', r, className)} />;
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)} aria-busy>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5',
            i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}

/* ---------- Empty / Error ---------- */

interface StateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

function StateLayout({
  title,
  description,
  icon,
  action,
  compact,
  className,
  tone,
}: StateProps & { tone: 'neutral' | 'danger' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
    >
      <div className="relative mb-1">
        <div
          className={cn(
            'absolute inset-0 -m-3 rounded-full blur-xl',
            tone === 'danger' ? 'bg-danger-bg' : 'bg-brand-subtle',
          )}
        />
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full border',
            compact ? 'size-11' : 'size-14',
            tone === 'danger'
              ? 'border-danger-border bg-danger-bg text-danger-fg'
              : 'border-border-default bg-surface-2 text-fg-muted',
          )}
        >
          {icon}
        </div>
      </div>
      <p
        className={cn(
          'font-semibold text-fg',
          compact ? 'text-sm' : 'text-base',
        )}
      >
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-ui text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, ...rest }: StateProps) {
  return (
    <StateLayout
      tone="neutral"
      icon={icon ?? <Inbox className="size-6" strokeWidth={1.75} />}
      {...rest}
    />
  );
}

export function ErrorState({
  title = 'Không tải được dữ liệu',
  description = 'Đã có lỗi khi kết nối máy chủ. Vui lòng thử lại.',
  onRetry,
  icon,
  ...rest
}: Partial<StateProps> & { onRetry?: () => void }) {
  return (
    <StateLayout
      tone="danger"
      title={title}
      description={description}
      icon={icon ?? <AlertTriangle className="size-6" strokeWidth={1.75} />}
      action={
        onRetry && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCw className="size-3.5" />}
            onClick={onRetry}
          >
            Thử lại
          </Button>
        )
      }
      {...rest}
    />
  );
}

/* ---------- Small atoms ---------- */

export function Divider({
  label,
  className,
}: {
  label?: ReactNode;
  className?: string;
}) {
  if (!label)
    return (
      <hr className={cn('border-0 border-t border-border-subtle', className)} />
    );
  return (
    <div
      className={cn('flex items-center gap-3 text-xs text-fg-muted', className)}
    >
      <span className="h-px flex-1 bg-border-subtle" />
      {label}
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}

export function Kbd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-tag border border-border-default bg-surface-2 px-1 font-sans text-[11px] font-medium text-fg-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function Avatar({
  name,
  src,
  size = 36,
  status,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  status?: 'online' | 'busy' | 'offline';
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const dot = {
    online: 'bg-success-solid',
    busy: 'bg-warning-solid',
    offline: 'bg-fg-disabled',
  };
  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="size-full rounded-full object-cover ring-1 ring-border-default"
        />
      ) : (
        <span
          className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-700 font-semibold text-navy-900"
          style={{ fontSize: Math.max(10, size * 0.38) }}
          aria-label={name}
        >
          {initials}
        </span>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-surface-1',
            dot[status],
          )}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </span>
  );
}
