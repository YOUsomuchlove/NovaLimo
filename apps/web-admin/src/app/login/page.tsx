import { Suspense } from 'react';
import { AdminLoginClient } from './AdminLoginClient';

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050814] text-slate-400">
      Đang tải…
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginClient />
    </Suspense>
  );
}
