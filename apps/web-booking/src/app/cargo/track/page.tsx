import type { Metadata } from 'next';
import { CargoTrackForm } from '../../../components/cargo/CargoTrackForm';
import { Container, PageHero } from '../../../components/site/Section';

export const metadata: Metadata = {
  title: 'Tra cứu vận đơn',
  alternates: { canonical: '/cargo/track' },
};

export default async function CargoTrackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Ký gửi hàng"
        title="Tra cứu vận đơn"
        lead="Nhập mã vận đơn (CG-…) và số điện thoại người gửi hoặc người nhận."
      />
      <Container className="py-10 sm:py-14">
        <CargoTrackForm initialCode={code} />
      </Container>
    </>
  );
}
