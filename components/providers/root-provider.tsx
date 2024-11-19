'use client';

import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/custom/theme-provider';

const ClientProviders = dynamic(
  () => import('@/components/providers/client-providers').then(mod => mod.ClientProviders),
  { ssr: false }
);

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClientProviders>
        <Toaster position="top-center" />
        {children}
      </ClientProviders>
    </ThemeProvider>
  );
} 