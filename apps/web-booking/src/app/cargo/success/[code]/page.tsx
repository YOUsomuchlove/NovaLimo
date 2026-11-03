import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CargoStatusView } from '../../../../components/cargo/CargoStatusView';
import { Container } from '../../../../components/site/Section';

export const metadata: Metadata = {
  title: 'Gửi hàng thành công',
  robots: { index: false },
};

export default async function CargoSuccessPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const c = decodeURIComponent(code).toUpperCase();
  if (!/^CG-[0-9A-Z]{6}$/.test(c)) notFound();
  return (
    <Container className="py-10 sm:py-14">
      <CargoStatusView code={c} created />
    </Container>
  );
}
