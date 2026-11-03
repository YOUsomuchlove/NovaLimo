import type { Metadata } from 'next';
import { PageHero, Container } from '../../components/site/Section';
import { TicketLookup } from '../../components/tickets/TicketLookup';

export const metadata: Metadata = {
  title: 'Tra cứu vé',
  description:
    'Tra cứu, thanh toán hoặc hủy vé NovaLimo bằng mã vé hoặc số điện thoại.',
  alternates: { canonical: '/my-tickets' },
};

export default function MyTicketsPage() {
  return (
    <>
      <PageHero
        eyebrow="Tra cứu vé"
        title="Vé của bạn, mọi lúc"
        lead="Một số điện thoại cho đặt vé, tra cứu và hỗ trợ. Không cần tạo tài khoản."
      />
      <Container className="py-10 sm:py-14">
        <TicketLookup />
      </Container>
    </>
  );
}
