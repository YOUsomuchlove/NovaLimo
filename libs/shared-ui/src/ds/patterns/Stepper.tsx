import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface StepItem {
  title?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
}

/**
 * Horizontal stepper (booking flow). On small screens collapses to
 * "Bước 2/4 · Thông tin" with a progress bar.
 */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: StepItem[];
  current: number;
  className?: string;
}) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100;
  return (
    <div className={className}>
      {/* compact (mobile) */}
      <div className="sm:hidden">
        <p className="text-ui text-fg-muted">
          Bước {current + 1}/{steps.length} ·{' '}
          <span className="font-medium text-fg">
            {steps[current]?.title ?? steps[current]?.label}
          </span>
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300 ease-nova"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* full */}
      <ol className="hidden items-start sm:flex">
        {steps.map((s, i) => {
          const state =
            i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li
              key={i}
              className={cn(
                'flex items-start',
                i < steps.length - 1 && 'flex-1',
              )}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200',
                    state === 'done' && 'border-brand bg-brand text-on-brand',
                    state === 'current' &&
                      'border-brand bg-brand-subtle text-brand-fg ring-4 ring-brand-subtle',
                    state === 'todo' &&
                      'border-border-strong bg-surface-2 text-fg-muted',
                  )}
                >
                  {state === 'done' ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="max-w-32">
                  <span
                    className={cn(
                      'block text-ui font-medium',
                      state === 'todo' ? 'text-fg-muted' : 'text-fg',
                    )}
                  >
                    {s.title ?? s.label}
                  </span>
                  {s.description && (
                    <span className="block text-xs text-fg-muted">
                      {s.description}
                    </span>
                  )}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className="mx-3 mt-[18px] h-px flex-1 overflow-hidden bg-border-default">
                  <span
                    className={cn(
                      'block h-full bg-brand transition-[width] duration-300 ease-nova',
                      i < current ? 'w-full' : 'w-0',
                    )}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
