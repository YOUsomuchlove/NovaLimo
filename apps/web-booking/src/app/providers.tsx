'use client';

import { NovaThemeProvider } from '@limousine-workspace/shared-ui';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import type { ReactNode } from 'react';

dayjs.locale('vi');

export function Providers({ children }: { children: ReactNode }) {
  return <NovaThemeProvider mode="light">{children}</NovaThemeProvider>;
}
