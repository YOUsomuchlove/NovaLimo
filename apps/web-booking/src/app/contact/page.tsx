import { Card } from '@limousine-workspace/shared-ui';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { ContactForm } from '../../components/content/ContactForm';
import { Container, PageHero } from '../../components/site/Section';
import { DEFAULT_SETTINGS, publicApi, safe } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Liên hệ & hỗ trợ',
  description:
    'Hotline, email và form liên hệ NovaLimo — đặt xe đoàn, hỗ trợ vé, hợp tác.',
  alternates: { canonical: '/contact' },
};
export const revalidate = 300;

export default async function ContactPage() {
  const { company } = await safe(publicApi.settings(), DEFAULT_SETTINGS);
  const items = [
    {
      icon: Phone,
      label: 'Hotline 24/7',
      value: company.hotline,
      href: `tel:${company.hotline.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: company.email,
      href: `mailto:${company.email}`,
    },
    { icon: MapPin, label: 'Văn phòng', value: company.address },
    {
      icon: Clock,
      label: 'Giờ làm việc CSKH',
      value: '07:00 – 22:00 hằng ngày',
    },
  ];
  return (
    <>
      <PageHero
        tone="sky"
        eyebrow="Liên hệ"
        title="Chúng tôi luôn sẵn sàng"
        lead="Một số điện thoại cho đặt vé, tra cứu và hỗ trợ. Hoặc để lại lời nhắn, chúng tôi sẽ gọi lại."
      />
      <Container className="grid gap-6 py-10 sm:py-14 lg:grid-cols-[360px_1fr]">
        <ul className="flex flex-col gap-3">
          {items.map((i) => (
            <li key={i.label}>
              <Card className="flex items-center gap-4" padding="sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-brand-subtle text-brand-fg">
                  <i.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-fg-muted">{i.label}</p>
                  {i.href ? (
                    <a
                      href={i.href}
                      className="font-medium text-fg hover:text-brand-fg"
                    >
                      {i.value}
                    </a>
                  ) : (
                    <p className="font-medium text-fg">{i.value}</p>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
        <Card padding="lg">
          <h2 className="mb-6 text-lg font-semibold text-fg">Gửi lời nhắn</h2>
          <ContactForm />
        </Card>
      </Container>
    </>
  );
}
