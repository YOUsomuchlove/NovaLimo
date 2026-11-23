import {
  formatDate,
  formatDateTime,
  formatTime,
  formatVnPhone,
  formatVnd,
  maskVnPhone,
} from '@limousine-workspace/utils-core';
import { cn } from '../utils/cn';

/** Money in VND with tabular digits. */
export function Money({
  value,
  compact,
  signed,
  className,
}: {
  value: number;
  compact?: boolean;
  signed?: boolean;
  className?: string;
}) {
  const formatted = formatVnd(Math.abs(value), { compact });
  const prefix = value < 0 ? '− ' : signed && value > 0 ? '+ ' : '';
  return (
    <span className={cn('tabular-nums whitespace-nowrap', className)}>
      {prefix}
      {formatted}
    </span>
  );
}

/** Vietnamese phone, optionally masked and/or as a tel: link. */
export function Phone({
  value,
  masked,
  link,
  className,
}: {
  value: string;
  masked?: boolean;
  link?: boolean;
  className?: string;
}) {
  const text = masked ? maskVnPhone(value) : formatVnPhone(value);
  const cls = cn('tabular-nums whitespace-nowrap', className);
  return link && !masked ? (
    <a href={`tel:${value}`} className={cn(cls, 'hover:text-brand-fg')}>
      {text}
    </a>
  ) : (
    <span className={cls}>{text}</span>
  );
}

export function DateTime({
  value,
  format = 'datetime',
  mode,
  className,
}: {
  value: Date | string | number | null | undefined;
  format?: 'datetime' | 'date' | 'time';
  mode?: 'datetime' | 'date' | 'time';
  className?: string;
}) {
  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-fg-muted', className)}>—</span>;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return <span className={cn('text-fg-muted', className)}>—</span>;
  }
  const fmt = mode ?? format;
  const text =
    fmt === 'date'
      ? formatDate(d)
      : fmt === 'time'
        ? formatTime(d)
        : formatDateTime(d);
  return (
    <time
      dateTime={d.toISOString()}
      className={cn('tabular-nums whitespace-nowrap', className)}
    >
      {text}
    </time>
  );
}
