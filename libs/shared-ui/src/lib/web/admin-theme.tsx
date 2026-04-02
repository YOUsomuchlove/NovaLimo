'use client';

import React from 'react';
import { App, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

export const adminTheme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
  },
  algorithm: theme.defaultAlgorithm,
};

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={viVN} theme={adminTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
