import './global.css';
import type { Metadata } from 'next';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'NovaLimo Admin',
  description: 'Quản trị và điều hành NovaLimo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
