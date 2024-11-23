import { Metadata } from 'next';

import { RootProvider } from '@/components/providers/root-provider';

import './globals.css';
import '../styles/dark-mode.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://chainable.guru'),
  title: 'Chainable AI',
  description: 'AI-powered Web3 assistant',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/logos/chainable.png', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logos/chainable.png',
  },
  other: {
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
