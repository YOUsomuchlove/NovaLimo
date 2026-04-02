'use client';

import React from 'react';
import { AdminProviders } from '@limousine-workspace/shared-ui';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
