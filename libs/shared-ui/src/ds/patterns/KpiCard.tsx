import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { Skeleton } from '../primitives/Feedback';
import { cn } from '../utils/cn';

/** Tiny dependency-free area sparkline. Colour follows `currentColor`. */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const gid = useId();
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map(
    (v, i) =>
      [i * step, height - 2 - ((v - min) / span) * (height - 4)] as const,
  );
  const line = pts
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function KpiCard({
  label,
  value,
  icon,
  delta,
  deltaLabel = 'so với kỳ trước',
  trend,
  loading,
  invertDelta,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  /** Percentage change, e.g. 12.5 or -3 */
  delta?: number;
  deltaLabel?: ReactNode;
  trend?: number[];
  loading?: boolean;
  /** When a decrease is good news (e.g. cancellations) */
  invertDelta?: boolean;
  className?: string;
}) {
  const up = (delta ?? 0) >= 0;
  const good = invertDelta ? !up : up;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-border-subtle bg-surface-1 p-5 shadow-e1',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-brand/40 before:to-transparent',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-ui font-medium text-fg-muted">{label}</p>
        {icon && (
          <span className="flex size-9 items-center justify-center rounded-control border border-border-subtle bg-surface-2 text-brand-fg">
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="mt-3 flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ) : (
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[28px] font-semibold leading-9 tracking-tight tabular-nums text-fg">
              {value}
            </p>
            {delta !== undefined && (
              <p className="mt-1 flex min-w-0 items-center gap-1 text-xs">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-tag px-1 font-semibold tabular-nums',
                    good
                      ? 'bg-success-bg text-success-fg'
                      : 'bg-danger-bg text-danger-fg',
                  )}
                >
                  {up ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {Math.abs(delta).toLocaleString('vi-VN', {
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
                <span className="truncate text-fg-muted">{deltaLabel}</span>
              </p>
            )}
          </div>
          {trend && (
            <Sparkline
              data={trend}
              className={good ? 'text-brand' : 'text-danger-fg'}
            />
          )}
        </div>
      )}
    </div>
  );
}
