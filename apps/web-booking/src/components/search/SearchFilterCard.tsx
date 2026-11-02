'use client';

import React from 'react';
import { Button, Card, Checkbox, Slider, Typography } from 'antd';

const HOUR_PRESETS: { label: string; value: [number, number] }[] = [
  { label: '07:00 - 10:00', value: [7, 10] },
  { label: '10:00 - 13:00', value: [10, 13] },
  { label: '13:00 - 16:00', value: [13, 16] },
  { label: '16:00 - 19:00', value: [16, 19] },
  { label: '19:00 - 22:00', value: [19, 22] },
];

export { HOUR_PRESETS };

const VEHICLE_OPTIONS = [
  { label: 'Limousine 9 chỗ VIP', value: '9' },
  { label: 'Limousine 12 chỗ Premium', value: '12' },
];

export type SearchFilterCardProps = {
  loading: boolean;
  presetHours: string[];
  onPresetHoursChange: (values: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (v: [number, number]) => void;
  vehicleTypes: string[];
  onVehicleTypesChange: (values: string[]) => void;
  onReset: () => void;
};

/** Cột trái — Bộ lọc (mockup NovaLimo). */
export function SearchFilterCard({
  loading,
  presetHours,
  onPresetHoursChange,
  priceRange,
  onPriceRangeChange,
  vehicleTypes,
  onVehicleTypesChange,
  onReset,
}: SearchFilterCardProps) {
  return (
    <Card
      loading={loading}
      variant="borderless"
      className="search-filter-card rounded-[18px] !bg-white !shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
      styles={{
        body: { padding: '22px 20px 20px' },
        header: { border: 'none', padding: '0 0 4px' },
      }}
      title={
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block size-2 shrink-0 rounded-full bg-nova-gold"
            aria-hidden
          />
          <span className="text-lg font-black tracking-tight text-[#0a0e18]">
            Bộ lọc
          </span>
        </div>
      }
    >
      <Typography.Text className="text-[15px] font-bold text-[#0a0e18]">
        Giờ chạy
      </Typography.Text>
      <Checkbox.Group
        className="mt-3 flex flex-col gap-2.5"
        value={presetHours}
        onChange={(v) => onPresetHoursChange(v as string[])}
        options={HOUR_PRESETS.map((p) => ({
          label: (
            <span className="text-[14px] font-medium text-[#1a1d26]">
              {p.label}
            </span>
          ),
          value: p.label,
        }))}
      />

      <Typography.Text className="mb-2 mt-6 block text-[15px] font-bold text-[#0a0e18]">
        Mức giá (VND)
      </Typography.Text>
      <div className="search-price-slider px-0.5 pb-1 pt-1">
        <Slider
          range
          min={0}
          max={3000000}
          step={50000}
          value={priceRange}
          onChange={(v) => onPriceRangeChange(v as [number, number])}
          tooltip={{
            formatter: (v) =>
              v != null ? `${Number(v).toLocaleString('vi-VN')} ₫` : '',
          }}
        />
      </div>

      <Typography.Text className="mb-2 mt-5 block text-[15px] font-bold text-[#0a0e18]">
        Loại xe
      </Typography.Text>
      <Checkbox.Group
        className="flex flex-col gap-2.5"
        value={vehicleTypes}
        onChange={(v) => onVehicleTypesChange(v as string[])}
        options={VEHICLE_OPTIONS.map((o) => ({
          label: (
            <span className="text-[14px] font-medium text-[#1a1d26]">
              {o.label}
            </span>
          ),
          value: o.value,
        }))}
      />

      <Button
        type="primary"
        block
        size="large"
        onClick={onReset}
        className="mt-8 h-11 rounded-[12px] !border-0 !bg-[#0a0e18] !text-[14px] !font-bold !text-white hover:!bg-[#141a28]"
      >
        Đặt lại bộ lọc
      </Button>
    </Card>
  );
}
