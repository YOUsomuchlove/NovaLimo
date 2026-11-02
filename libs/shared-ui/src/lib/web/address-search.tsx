'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AutoComplete, Input } from 'antd';
import type { GeocodeHit } from './geocode-types';

export type { GeocodeHit } from './geocode-types';

type Option = GeocodeHit & { value: string; label: string };

export function AddressSearchInput({
  apiBaseUrl,
  placeholder,
  value,
  onAddressChange,
  onLocationCommit,
  className,
  inputClassName,
  suffix,
}: {
  apiBaseUrl: string;
  placeholder?: string;
  value: string;
  onAddressChange: (address: string) => void;
  onLocationCommit: (loc: { lat: number; lng: number; address: string }) => void;
  /** className trên AutoComplete (wrapper). */
  className?: string;
  /** className trên ô Input. */
  inputClassName?: string;
  suffix?: React.ReactNode;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (q: string) => {
      const t = q.trim();
      if (t.length < 3) {
        setOptions([]);
        return;
      }
      try {
        const res = await fetch(
          `${apiBaseUrl}/geocode?q=${encodeURIComponent(t)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as GeocodeHit[];
        setOptions(
          data.map((h) => ({
            ...h,
            value: h.display_name,
            label: h.display_name,
          })),
        );
      } catch {
        setOptions([]);
      }
    },
    [apiBaseUrl],
  );

  const debounced = useCallback(
    (q: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void runSearch(q), 400);
    },
    [runSearch],
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <AutoComplete
      className={['w-full', className].filter(Boolean).join(' ')}
      options={options}
      value={value}
      onSearch={(q) => debounced(q)}
      onChange={(v) => onAddressChange(String(v))}
      onSelect={(_, opt) => {
        const o = opt as Option;
        onAddressChange(o.display_name);
        onLocationCommit({
          lat: o.lat,
          lng: o.lng,
          address: o.display_name,
        });
      }}
    >
      <Input
        placeholder={placeholder ?? 'Nhập địa chỉ (gợi ý OpenStreetMap)'}
        className={inputClassName}
        suffix={suffix}
      />
    </AutoComplete>
  );
}
