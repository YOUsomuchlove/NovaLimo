'use client';

import { NovaThemeProvider } from '@limousine-workspace/shared-ui';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { ReactNode } from 'react';
import { AdminAuthProvider } from '../components/shell/AdminAuthContext';

dayjs.locale('vi');

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NovaThemeProvider mode="dark">
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </NovaThemeProvider>
  );
}
