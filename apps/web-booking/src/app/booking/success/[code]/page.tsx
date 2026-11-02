import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '../../../../components/site/Section';
import { TicketView } from '../../../../components/tickets/TicketView';

export const metadata: Metadata = {
  title: 'Vé của bạn',
  robots: { index: false },
};

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = decodeURIComponent(code).toUpperCase();
  if (!/^NL-[0-9A-Z]{6}$/.test(normalized)) notFound();
  return (
    <Container className="py-10 sm:py-14">
      <TicketView code={normalized} />
    </Container>
  );
}
