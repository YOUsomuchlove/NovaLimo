import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../utils/cn';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'outline';

const variants: Record<CardVariant, string> = {
  default: 'bg-surface-1 border border-border-subtle shadow-e1',
  elevated: 'bg-surface-2 border border-border-subtle shadow-e2',
  glass:
    'bg-surface-1/70 border border-border-default shadow-e2 backdrop-blur-xl',
  outline: 'bg-transparent border border-border-default',
};

export interface CardProps extends ComponentProps<'div'> {
  variant?: CardVariant;
  /** Hover lift for clickable cards */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };

export function Card({
  variant = 'default',
  interactive,
  padding = 'md',
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card text-fg',
        variants[variant],
        paddings[padding],
        interactive &&
          'cursor-pointer transition-[transform,border-color,box-shadow] duration-200 ease-nova hover:-translate-y-0.5 hover:border-border-strong hover:shadow-e2',
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({
  title,
  description,
  actions,
  icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('mb-5 flex items-start justify-between gap-4', className)}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-brand-subtle text-brand-fg">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-fg">{title}</h3>
          {description && (
            <p className="mt-0.5 text-ui text-fg-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function CardFooter({ className, ...rest }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '-mx-5 -mb-5 mt-5 flex items-center justify-end gap-3 border-t border-border-subtle px-5 py-4 sm:-mx-6 sm:-mb-6 sm:px-6',
        className,
      )}
      {...rest}
    />
  );
}
