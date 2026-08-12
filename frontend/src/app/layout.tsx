import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import PwaRegister from '@/components/pwa-register';
import OfflineBanner from '@/components/offline-banner';
import { PwaInstallBanner } from '@/components/pwa-install-button';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DocExpiry - Enterprise Compliance & Expiry Intelligence',
  description: 'High-precision document tracking and compliance monitoring platform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DocExpiry',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
    apple: '/icons/icon-192x192.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e40af',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-sans bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <PwaRegister />
            <PwaInstallBanner />
            <OfflineBanner />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

