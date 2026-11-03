import type { Metadata } from 'next';
import { CargoForm } from '../../../components/cargo/CargoForm';
import { Container, PageHero } from '../../../components/site/Section';
import { publicApi, safe } from '../../../lib/api';

export const metadata: Metadata = {
  title: 'Đặt gửi hàng',
  alternates: { canonical: '/cargo/book' },
};

export default async function CargoBookPage() {
  const routes = await safe(publicApi.routes(), []);
  return (
    <>
      <PageHero
        eyebrow="Ký gửi hàng"
        title="Tạo đơn gửi hàng"
        lead="Báo giá cập nhật ngay khi bạn nhập thông tin kiện hàng."
      />
      <Container className="py-10 sm:py-14">
        {routes.length ? (
          <CargoForm routes={routes} />
        ) : (
          <p className="text-fg-muted">
            Dịch vụ tạm gián đoạn, vui lòng gọi hotline.
          </p>
        )}
      </Container>
    </>
  );
}
