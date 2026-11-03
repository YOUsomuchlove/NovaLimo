import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '../../../components/site/Section';
import { TicketView } from '../../../components/tickets/TicketView';

export const metadata: Metadata = {
  title: 'Chi tiết vé',
  robots: { index: false },
};

export default async function TicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = decodeURIComponent(code).toUpperCase();
  if (!/^NL-[0-9A-Z]{6}$/.test(normalized)) notFound();
  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto mb-6 max-w-3xl">
        <Link
          href="/my-tickets"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> Tra cứu vé
        </Link>
      </div>
      <TicketView code={normalized} />
    </Container>
  );
}
