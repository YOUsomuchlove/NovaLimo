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
  className,
}: {
  value: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('tabular-nums whitespace-nowrap', className)}>
      {formatVnd(value, { compact })}
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
  className,
}: {
  value: Date | string | number;
  format?: 'datetime' | 'date' | 'time';
  className?: string;
}) {
  const d = value instanceof Date ? value : new Date(value);
  const text =
    format === 'date'
      ? formatDate(d)
      : format === 'time'
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
