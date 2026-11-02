'use client';

import React from 'react';
import { Drawer } from 'antd';
import type { TripBatch } from '@limousine-workspace/shared-types';
import { SearchSelectionSummary } from './SearchSelectionSummary';
import { getBatchDemoMeta } from './search-batch-demo';

export type SearchSelectionDrawerProps = {
  open: boolean;
  batch: TripBatch | null;
  onClose: () => void;
};

/** Drawer bên phải (mobile / tablet) — cùng nội dung với panel desktop. */
export function SearchSelectionDrawer({
  open,
  batch,
  onClose,
}: SearchSelectionDrawerProps) {
  const meta = batch ? getBatchDemoMeta(batch) : null;

  return (
    <Drawer
      title={null}
      placement="right"
      size={360}
      open={open}
      onClose={onClose}
      closable
      classNames={{
        body: '!p-0 !bg-[#0a0e18]',
        header: '!hidden',
      }}
      styles={{
        section: { background: '#0a0e18' },
      }}
    >
      {batch && meta ? (
        <SearchSelectionSummary
          batch={batch}
          mockPrice={meta.mockPrice}
          capacity={meta.capacity}
          seatsLeft={meta.seatsLeft}
          onConfirmNavigate={onClose}
        />
      ) : null}
    </Drawer>
  );
}
