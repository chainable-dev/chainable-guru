'use client';

import dynamic from 'next/dynamic';

import { ThemeProvider } from '@/components/custom/theme-provider';
import { Toaster } from '@/components/ui/toast';

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
        {children}
        <Toaster />
      </ClientProviders>
    </ThemeProvider>
  );
} 