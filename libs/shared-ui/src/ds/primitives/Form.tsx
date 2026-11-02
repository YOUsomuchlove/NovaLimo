'use client';

import { Check } from 'lucide-react';
import { type ComponentProps, type ReactNode, useId } from 'react';
import { cn } from '../utils/cn';

/* ---------- Field (label + hint + error wrapper) ---------- */

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  /** Render-prop gives the generated id + aria attributes for the control */
  children: (control: {
    id: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
}

export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-ui font-medium text-fg-secondary">
          {label}
          {required && <span className="ml-0.5 text-danger-fg">*</span>}
        </label>
      )}
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger-fg">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Input / Textarea ---------- */

const control =
  'w-full rounded-control border border-border-default bg-surface-2 text-sm text-fg placeholder:text-fg-disabled ' +
  'transition-[border-color,box-shadow,background-color] duration-150 ease-nova ' +
  'hover:border-border-strong focus:border-brand focus:bg-surface-1 focus:outline-none focus:ring-4 focus:ring-focus-ring/40 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger-solid aria-[invalid=true]:focus:ring-danger-bg';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  leading?: ReactNode;
  trailing?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export function Input({
  leading,
  trailing,
  inputSize = 'md',
  className,
  ...rest
}: InputProps) {
  const h = { sm: 'h-8 text-ui', md: 'h-10', lg: 'h-12 text-base' }[inputSize];
  if (!leading && !trailing)
    return <input className={cn(control, h, 'px-3.5', className)} {...rest} />;
  return (
    <div className={cn('relative flex items-center', className)}>
      {leading && (
        <span className="pointer-events-none absolute left-3.5 flex text-fg-muted">
          {leading}
        </span>
      )}
      <input
        className={cn(
          control,
          h,
          leading ? 'pl-10' : 'pl-3.5',
          trailing ? 'pr-10' : 'pr-3.5',
        )}
        {...rest}
      />
      {trailing && (
        <span className="absolute right-3 flex text-fg-muted">{trailing}</span>
      )}
    </div>
  );
}

export function Textarea({
  className,
  rows = 4,
  ...rest
}: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        control,
        'resize-y px-3.5 py-2.5 leading-relaxed',
        className,
      )}
      {...rest}
    />
  );
}

/* ---------- Checkbox ---------- */

export function Checkbox({
  label,
  description,
  className,
  ...rest
}: Omit<ComponentProps<'input'>, 'type'> & {
  label?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label
      className={cn(
        'group inline-flex cursor-pointer items-start gap-3',
        rest.disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative mt-0.5 flex size-[18px] shrink-0">
        <input
          type="checkbox"
          className="peer absolute inset-0 cursor-[inherit] opacity-0"
          {...rest}
        />
        <span className="size-full rounded-[5px] border border-border-strong bg-surface-2 transition-colors duration-150 peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-focus-ring/40" />
        <Check
          className="pointer-events-none absolute inset-0 m-auto size-3 text-on-brand opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm text-fg">{label}</span>}
          {description && (
            <span className="text-xs text-fg-muted">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}

/* ---------- Switch ---------- */

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  size = 'md',
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const thumb =
    size === 'sm'
      ? 'size-4 data-[on=true]:translate-x-4'
      : 'size-5 data-[on=true]:translate-x-5';
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-3',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full border border-border-default p-0.5 transition-colors duration-200 ease-nova',
          track,
          checked ? 'border-brand bg-brand' : 'bg-surface-3',
        )}
      >
        <span
          data-on={checked}
          className={cn(
            'rounded-full bg-fg shadow-e1 transition-transform duration-200 ease-nova data-[on=true]:bg-on-brand',
            thumb,
          )}
        />
      </button>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  );
}

/* ---------- Segmented control ---------- */

export interface SegmentOption<V extends string> {
  value: V;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth,
  className,
  ariaLabel,
}: {
  /** `NoInfer` so `V` comes from `value` (keeps unions like `'dark' | 'light'` narrow) */
  options: SegmentOption<NoInfer<V>>[];
  value: V;
  onChange: (v: NoInfer<V>) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex gap-1 rounded-control border border-border-subtle bg-surface-2 p-1',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-[7px] font-medium whitespace-nowrap transition-all duration-150 ease-nova disabled:opacity-40',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3.5 text-ui',
              active
                ? 'bg-surface-1 text-fg shadow-e1 ring-1 ring-border-default'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
