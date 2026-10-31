import type { Metadata } from 'next';
import { Toaster } from '@packages/ui/components/sonner';
import { ThemeProvider } from '@packages/ui/main/Theme.provider';
import { roboto, robotoMono } from '@packages/ui/styles/fonts';

import { QueryProvider } from '@/providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Restaurant Admin',
  description: 'Restaurant platform administration',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider defaultTheme="light">
          <QueryProvider>
            {children}
            <Toaster position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
