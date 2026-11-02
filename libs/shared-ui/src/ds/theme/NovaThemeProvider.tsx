'use client';

import type { ThemeName } from '@limousine-workspace/design-tokens';
import { App, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { type ReactNode, useCallback, useMemo } from 'react';
import { createAntdTheme } from './antd-theme';

/**
 * Root provider for both Next apps: antd theme from tokens + vi_VN locale + antd `App`
 * (needed by `useToast` / `useConfirm`). The surrounding element should carry
 * `data-theme={mode}` so Tailwind token utilities match antd.
 */
export function NovaThemeProvider({
  mode = 'dark',
  children,
}: {
  mode?: ThemeName;
  children: ReactNode;
}) {
  const theme = useMemo(() => createAntdTheme(mode), [mode]);
  return (
    <ConfigProvider locale={viVN} theme={theme} wave={{ disabled: true }}>
      <App
        message={{ maxCount: 3, top: 72 }}
        notification={{ placement: 'topRight' }}
      >
        {children}
      </App>
    </ConfigProvider>
  );
}

/** Toasts: `toast.success('Đã lưu')`. */
export function useToast() {
  const { message } = App.useApp();
  return useMemo(
    () => ({
      success: (content: ReactNode) => message.success(content),
      error: (content: ReactNode) => message.error(content),
      info: (content: ReactNode) => message.info(content),
      warning: (content: ReactNode) => message.warning(content),
      loading: (content: ReactNode) => message.loading(content, 0),
    }),
    [message],
  );
}

export interface ConfirmOptions {
  title: ReactNode;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

/** `if (await confirm({ title: 'Xóa xe?', danger: true })) …` */
export function useConfirm() {
  const { modal } = App.useApp();
  return useCallback(
    ({
      title,
      content,
      okText = 'Xác nhận',
      cancelText = 'Hủy',
      danger,
    }: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        modal.confirm({
          title,
          content,
          okText,
          cancelText,
          okButtonProps: { danger },
          centered: true,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      }),
    [modal],
  );
}
