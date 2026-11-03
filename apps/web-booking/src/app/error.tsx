'use client';

import { Button } from '@limousine-workspace/shared-ui';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Container } from '../components/site/Section';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-semibold text-fg sm:text-3xl">
        Đã có lỗi xảy ra
      </h1>
      <p className="mt-3 max-w-md text-fg-muted">
        Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-fg-muted">
          Mã lỗi: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <Button variant="primary" onClick={reset}>
          <RotateCcw className="size-4" /> Thử lại
        </Button>
        <Link
          href="/"
          className="inline-flex items-center px-4 text-sm text-fg-muted hover:text-fg"
        >
          Về trang chủ
        </Link>
      </div>
    </Container>
  );
}
