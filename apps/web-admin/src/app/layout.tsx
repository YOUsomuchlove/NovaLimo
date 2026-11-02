import './global.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { palette } from '@limousine-workspace/design-tokens';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from './providers';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: palette.navy[800],
};

export const metadata: Metadata = {
  title: {
    default: 'NovaLimo Admin',
    template: '%s | NovaLimo Admin',
  },
  description: 'Quản trị và điều hành NovaLimo — điều phối, chuyến, đơn hàng.',
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-theme="dark" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen bg-nova-navy text-slate-900 antialiased`}
      >
        <AntdRegistry layer>
          <AppProviders>{children}</AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
