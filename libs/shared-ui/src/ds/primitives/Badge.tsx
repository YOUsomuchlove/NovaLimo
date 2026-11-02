import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type Tone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

const soft: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-fg-secondary border-border-default',
  brand: 'bg-brand-subtle text-brand-fg border-brand/30',
  success: 'bg-success-bg text-success-fg border-success-border',
  warning: 'bg-warning-bg text-warning-fg border-warning-border',
  danger: 'bg-danger-bg text-danger-fg border-danger-border',
  info: 'bg-info-bg text-info-fg border-info-border',
};

const solid: Record<Tone, string> = {
  neutral: 'bg-fg-muted text-canvas border-transparent',
  brand: 'bg-brand text-on-brand border-transparent',
  success: 'bg-success-solid text-white border-transparent',
  warning: 'bg-warning-solid text-navy-900 border-transparent',
  danger: 'bg-danger-solid text-white border-transparent',
  info: 'bg-info-solid text-white border-transparent',
};

export const dotTone: Record<Tone, string> = {
  neutral: 'bg-fg-muted',
  brand: 'bg-brand',
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  danger: 'bg-danger-solid',
  info: 'bg-info-solid',
};

export interface BadgeProps {
  tone?: Tone;
  variant?: 'soft' | 'solid';
  size?: 'sm' | 'md';
  /** Leading status dot (pulses when `pulse`) */
  dot?: boolean;
  pulse?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot,
  pulse,
  icon,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-tag border font-medium tabular-nums',
        size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-6 px-2 text-xs',
        variant === 'soft' ? soft[tone] : solid[tone],
        className,
      )}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex size-full animate-ping rounded-full opacity-60',
                dotTone[tone],
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex size-1.5 rounded-full',
              dotTone[tone],
            )}
          />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}
