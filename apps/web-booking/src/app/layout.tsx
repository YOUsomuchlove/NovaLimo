import './global.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { palette } from '@limousine-workspace/design-tokens';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteFooter } from '../components/site/SiteFooter';
import { SiteHeader } from '../components/site/SiteHeader';
import { DEFAULT_SETTINGS, SITE_URL, publicApi, safe } from '../lib/api';
import { Providers } from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: palette.slate[50],
  colorScheme: 'light',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NovaLimo — Đặt vé xe Limousine đón trả tận nơi',
    template: '%s · NovaLimo',
  },
  description:
    'Đặt vé limousine Hà Nội – Hạ Long, Nội Bài, Hải Phòng. Đón trả tận nơi, chọn ghế trực tuyến, thanh toán VietQR, xác nhận tức thì.',
  applicationName: 'NovaLimo',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'NovaLimo',
    title: 'NovaLimo — Đặt vé xe Limousine đón trả tận nơi',
    description: 'Chọn ghế trực tuyến, đón tận nhà, thanh toán VietQR.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await safe(publicApi.settings(), DEFAULT_SETTINGS);
  return (
    <html
      lang="vi"
      data-theme="light"
      className={`${jakarta.variable} ${cormorant.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only rounded-control bg-brand px-4 py-2 text-on-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1300]"
        >
          Bỏ qua tới nội dung
        </a>
        <AntdRegistry layer>
          <Providers>
            <SiteHeader hotline={settings.company.hotline} />
            <main id="main" className="min-h-[60dvh]">
              {children}
            </main>
            <SiteFooter company={settings.company} />
          </Providers>
        </AntdRegistry>
        <script
          type="application/ld+json"
          // Organization structured data for search engines.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TravelAgency',
              name: settings.company.name,
              url: SITE_URL,
              telephone: settings.company.hotline,
              email: settings.company.email,
              address: settings.company.address,
            }),
          }}
        />
      </body>
    </html>
  );
}
