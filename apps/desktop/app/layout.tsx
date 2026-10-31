import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from '@packages/ui/components/sonner';
import { ThemeProvider } from '@packages/ui/main/Theme.provider';
import { roboto, robotoMono } from '@packages/ui/styles/fonts';

import { QueryProvider } from '@/providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Khongor Self-Service Kiosk',
  description: 'Restaurant self-service ordering kiosk',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="mn"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider defaultTheme="light">
          <QueryProvider>
            {children}
            <Toaster position="top-center" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
