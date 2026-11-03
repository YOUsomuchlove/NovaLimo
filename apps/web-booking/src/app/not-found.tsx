import { buttonClasses } from '@limousine-workspace/shared-ui';
import { ArrowLeft, Search } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '../components/site/Section';

export const metadata: Metadata = {
  title: 'Không tìm thấy trang',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="nl-glow">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-7xl font-semibold tracking-tight text-brand-fg sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-fg sm:text-3xl">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 max-w-md text-fg-muted">
          Trang bạn tìm có thể đã được chuyển đi hoặc không còn tồn tại. Hãy
          quay về trang chủ hoặc tìm chuyến xe mới.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClasses({ variant: 'secondary' })}>
            <ArrowLeft className="size-4" /> Về trang chủ
          </Link>
          <Link
            href="/#dat-ve"
            className={buttonClasses({ variant: 'primary' })}
          >
            <Search className="size-4" /> Tìm chuyến
          </Link>
        </div>
      </Container>
    </div>
  );
}
