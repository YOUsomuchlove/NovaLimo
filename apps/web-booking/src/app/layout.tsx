import './global.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { palette } from '@limousine-workspace/design-tokens';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SiteLayout } from '../components/site/SiteLayout';
import { AppProviders } from './providers';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: palette.navy[800],
};

export const metadata: Metadata = {
  title: {
    default: 'NovaLimo — Đặt vé xe Limousine',
    template: '%s | NovaLimo',
  },
  description:
    'Đặt vé xe limousine tuyến cố định, đón trả tận nơi. NovaLimo — quản lý và điều phối thông minh.',
  openGraph: {
    title: 'NovaLimo — Đặt vé xe Limousine',
    description:
      'Đặt vé nhanh trên điện thoại hoặc máy tính. Hỗ trợ đón trả tận nơi.',
    locale: 'vi_VN',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-theme="light" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}
      >
        <AntdRegistry layer>
          <AppProviders>
            <SiteLayout>{children}</SiteLayout>
          </AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
