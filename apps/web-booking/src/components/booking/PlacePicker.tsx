'use client';

import type { StopDto } from '@limousine-workspace/shared-types';
import { AddressAutocomplete, cn } from '@limousine-workspace/shared-ui';
import { Check, Home, MapPin } from 'lucide-react';
import { publicApi } from '../../lib/api';
import type { PlaceDraft } from '../../lib/session';

/** Pick a fixed stop of the route, or type any address (door-to-door pickup). */
export function PlacePicker({
  stops,
  value,
  onChange,
  error,
  label,
}: {
  stops: StopDto[];
  value: PlaceDraft | undefined;
  onChange: (v: PlaceDraft) => void;
  error?: string;
  label: string;
}) {
  const custom = !value?.stop_id;
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 text-sm font-medium text-fg-secondary">
        {label}
        <span className="ml-0.5 text-danger-fg">*</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {stops.map((s) => {
          const active = value?.stop_id === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                onChange({
                  stop_id: s.id,
                  address: `${s.name} — ${s.address}`,
                  lat: s.location.lat,
                  lng: s.location.lng,
                })
              }
              aria-pressed={active}
              className={cn(
                'flex items-start gap-3 rounded-card border p-3 text-left transition-colors',
                active
                  ? 'border-brand bg-brand-subtle'
                  : 'border-border-default bg-surface-2 hover:border-border-strong',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                  active
                    ? 'border-brand bg-brand text-on-brand'
                    : 'border-border-strong',
                )}
              >
                {active ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  <MapPin className="size-3 text-fg-muted" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-fg">
                  {s.name}
                </span>
                <span className="block truncate text-xs text-fg-muted">
                  {s.address}
                </span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange({ address: '' })}
          aria-pressed={custom}
          className={cn(
            'flex items-center gap-3 rounded-card border p-3 text-left transition-colors',
            custom
              ? 'border-brand bg-brand-subtle'
              : 'border-border-default bg-surface-2 hover:border-border-strong',
          )}
        >
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full border',
              custom
                ? 'border-brand bg-brand text-on-brand'
                : 'border-border-strong',
            )}
          >
            <Home className="size-3" />
          </span>
          <span>
            <span className="block text-sm font-medium text-fg">
              Địa chỉ khác
            </span>
            <span className="block text-xs text-fg-muted">
              Đón / trả tận nơi trong khu vực
            </span>
          </span>
        </button>
      </div>
      {custom && (
        <AddressAutocomplete
          value={{
            address: value?.address ?? '',
            lat: value?.lat,
            lng: value?.lng,
          }}
          onChange={(v) =>
            onChange({ address: v.address, lat: v.lat, lng: v.lng })
          }
          search={publicApi.geocode}
          placeholder="Số nhà, đường, phường… rồi chọn gợi ý"
          status={error ? 'error' : undefined}
        />
      )}
      {error && <p className="text-xs text-danger-fg">{error}</p>}
    </fieldset>
  );
}
