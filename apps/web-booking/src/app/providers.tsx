'use client';

import React from 'react';
import { BookingProviders, BookingShell } from '@limousine-workspace/shared-ui';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <BookingProviders>
      <BookingShell>{children}</BookingShell>
    </BookingProviders>
  );
}
