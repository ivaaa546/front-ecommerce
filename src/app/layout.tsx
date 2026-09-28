import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CartDrawer from '@/components/layout/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
