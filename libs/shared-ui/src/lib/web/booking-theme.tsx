'use client';

import React from 'react';
import { App, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

const novaGold = '#c9a227';
const novaNavy = '#0f172a';

export const novaBookingTheme = {
  token: {
    colorPrimary: novaGold,
    colorInfo: novaGold,
    colorSuccess: '#16a34a',
    colorWarning: '#eab308',
    colorError: '#dc2626',
    colorBgLayout: '#f8fafc',
    borderRadius: 10,
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Layout: {
      headerBg: novaNavy,
      bodyBg: '#f8fafc',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(201, 162, 39, 0.15)',
    },
  },
};

export function BookingProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider locale={viVN} theme={novaBookingTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
