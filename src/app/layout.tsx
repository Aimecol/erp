import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/fontawesome.css';
import '../lib/fontawesome';
import { ReactQueryProvider } from '@/lib/react-query';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { MSWProvider } from './mocks';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ERP System - Business Management Platform',
  description: 'A comprehensive ERP system for managing sales, inventory, finance, and more.',
  keywords: ['ERP', 'Business Management', 'Sales', 'Inventory', 'Finance'],
  authors: [{ name: 'ERP Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ERP System - Business Management Platform',
    description: 'A comprehensive ERP system for managing sales, inventory, finance, and more.',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <MSWProvider>
            <ReactQueryProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ReactQueryProvider>
          </MSWProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
