import './global.css';
import type { Metadata } from 'next';
import { AppProviders } from './providers';

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
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
