'use client';

import { NOVA_BRAND, NOVA_FONT_STACK, NOVA_RADIUS } from '@limousine-workspace/utils-core';
import React from 'react';
import { App, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

/** NovaLimo Admin — khớp palette web-admin.pen (`halo` + sidebar). @see DESIGN-TOKENS-NOVALIMO.md */
const novaGold = NOVA_BRAND.gold;
const adminSiderNavy = NOVA_BRAND.navy;

export const adminTheme = {
  token: {
    colorPrimary: novaGold,
    colorInfo: '#2563EB',
    colorSuccess: '#22C55E',
    colorWarning: '#EAB308',
    colorError: '#EF4444',
    colorBgLayout: '#f1f5f9',
    colorBgContainer: '#ffffff',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    borderRadius: NOVA_RADIUS.admin,
    fontFamily: NOVA_FONT_STACK,
    fontSize: 14,
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    Layout: {
      /** Để Tailwind / style trên `<Header>` quyết định (tránh token #fff đè console). */
      headerBg: 'transparent',
      bodyBg: '#f1f5f9',
      siderBg: adminSiderNavy,
      triggerBg: adminSiderNavy,
    },
    Menu: {
      darkItemBg: 'transparent',
      /** Ô chọn tối, bo góc — mockup sidebar pen */
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.06)',
      darkItemSelectedColor: '#ffffff',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.04)',
      darkItemColor: '#e5e7eb',
      itemBorderRadius: 12,
      iconSize: 16,
      fontSize: 13,
    },
    Button: {
      primaryShadow: '0 2px 12px rgba(212, 175, 55, 0.25)',
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Table: {
      headerBg: '#f8fafc',
      rowHoverBg: 'rgba(212, 175, 55, 0.06)',
    },
  },
};

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={viVN} theme={adminTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
