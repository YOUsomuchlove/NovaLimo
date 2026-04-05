'use client';

import { NOVA_BRAND, NOVA_FONT_STACK, NOVA_RADIUS } from '@limousine-workspace/utils-core';
import React from 'react';
import { App, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

/** NovaLimo web booking — web-bôking.pen Khu A/B. @see DESIGN-TOKENS-NOVALIMO.md */
const novaGold = NOVA_BRAND.gold;
const novaNavy = NOVA_BRAND.navy;

export const novaBookingTheme = {
  token: {
    colorPrimary: novaGold,
    colorInfo: '#B2CCFF',
    colorSuccess: '#16a34a',
    colorWarning: '#eab308',
    colorError: '#dc2626',
    colorBgLayout: '#f1f5f9',
    borderRadius: NOVA_RADIUS.bookingLg,
    fontFamily: NOVA_FONT_STACK,
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Layout: {
      headerBg: novaNavy,
      bodyBg: '#f1f5f9',
    },
    Button: {
      primaryShadow: '0 3px 16px rgba(0, 0, 0, 0.12)',
      borderRadius: 14,
      controlHeightLG: 52,
    },
    Card: {
      borderRadiusLG: NOVA_RADIUS.bookingCard,
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
