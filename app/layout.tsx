import { Metadata } from 'next';

import { RootProvider } from '@/components/providers/root-provider';

import './globals.css';
import '../styles/dark-mode.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://chainable.guru'),
  title: 'use',
  description: 'AI Chat Bot with Blockchain Integration',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' }
    ],
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'light') document.documentElement.classList.remove('dark')
              else document.documentElement.classList.add('dark')
            } catch (_) {}
          `,
        }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="antialiased dark:bg-gray-900">
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
