import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md' | 'icon-lg';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-nova ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-45 select-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-on-brand shadow-brand hover:bg-brand-hover active:bg-brand-active',
  secondary:
    'bg-surface-3 text-fg border border-border-default hover:border-border-strong hover:bg-surface-2',
  outline:
    'border border-border-strong text-fg hover:border-brand hover:text-brand-fg bg-transparent',
  ghost: 'text-fg-secondary hover:bg-surface-2 hover:text-fg bg-transparent',
  danger:
    'bg-danger-solid text-white hover:brightness-110 active:brightness-95',
  link: 'h-auto px-0 text-brand-fg underline-offset-4 hover:underline bg-transparent shadow-none',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-ui',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  'icon-sm': 'size-8 text-ui',
  'icon-md': 'size-10 text-sm',
  'icon-lg': 'size-12 text-base',
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Class string for anything that should look like a button (e.g. a Next `<Link>`). */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    base,
    variants[variant],
    variant !== 'link' && sizes[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps
  extends Omit<ComponentProps<'button'>, 'className'>,
    ButtonStyleOptions {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={size?.endsWith('lg') ? 18 : 16} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
