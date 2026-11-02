'use client';

import { AutoComplete, Input } from 'antd';
import { CircleCheck, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '../primitives/Spinner';

export interface GeoAddress {
  address: string;
  /** Only set once the user picked a suggestion — cleared as soon as the text is edited. */
  lat?: number;
  lng?: number;
}

export interface GeocodeSuggestion {
  lat: number;
  lng: number;
  display_name: string;
}

export interface AddressAutocompleteProps {
  value: GeoAddress;
  onChange: (value: GeoAddress) => void;
  /** Geocode search, e.g. `(q) => api.geocode(q)`; called debounced for ≥ 3 chars */
  search: (q: string) => Promise<GeocodeSuggestion[]>;
  placeholder?: string;
  status?: 'error' | 'warning';
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Address input with geocode suggestions. Fixes the legacy bug where editing the text after
 * picking a suggestion kept the old coordinates.
 */
export function AddressAutocomplete({
  value,
  onChange,
  search,
  placeholder = 'Nhập địa chỉ, tên tòa nhà…',
  status,
  disabled,
  id,
  className,
}: AddressAutocompleteProps) {
  const [options, setOptions] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const seq = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onSearch = (q: string) => {
    clearTimeout(timer.current);
    if (q.trim().length < 3) {
      setOptions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      const mine = ++seq.current;
      setLoading(true);
      try {
        const hits = await search(q.trim());
        if (mine === seq.current) setOptions(hits);
      } catch {
        if (mine === seq.current) setOptions([]);
      } finally {
        if (mine === seq.current) setLoading(false);
      }
    }, 350);
  };

  const located = value.lat !== undefined && value.lng !== undefined;

  return (
    <AutoComplete
      id={id}
      className={className}
      value={value.address}
      disabled={disabled}
      onSearch={onSearch}
      onChange={(text: string) => onChange({ address: text })}
      onSelect={(_: string, opt: { hit: GeocodeSuggestion }) =>
        onChange({
          address: opt.hit.display_name,
          lat: opt.hit.lat,
          lng: opt.hit.lng,
        })
      }
      options={options.map((h) => ({
        value: h.display_name,
        hit: h,
        label: (
          <span className="flex items-start gap-2 py-0.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-fg-muted" />
            <span className="whitespace-normal text-ui leading-5">
              {h.display_name}
            </span>
          </span>
        ),
      }))}
      popupMatchSelectWidth
    >
      <Input
        status={status}
        placeholder={placeholder}
        prefix={<MapPin className="size-4 text-fg-muted" />}
        suffix={
          loading ? (
            <Spinner size={14} className="text-fg-muted" />
          ) : located ? (
            <CircleCheck
              className="size-4 text-success-fg"
              aria-label="Đã xác định vị trí"
            />
          ) : (
            <span />
          )
        }
      />
    </AutoComplete>
  );
}
