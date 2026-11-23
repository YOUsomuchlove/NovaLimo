import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminLoginClient } from './AdminLoginClient';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-fg-muted">
          Đang tải trang đăng nhập…
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
