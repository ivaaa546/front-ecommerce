import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import CartDrawer from '@/components/layout/CartDrawer';
import MetaPixel from '@/components/analytics/MetaPixel';

export const metadata: Metadata = {
  title: 'E-commerce MVP',
  description: 'Tienda en línea rápida y segura.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${GeistSans.className} min-h-screen flex flex-col`}>
        <MetaPixel />
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
