'use client';

import { ThemeProvider } from "./custom/theme-provider";
import { Providers } from "./providers";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Providers>{children}</Providers>
    </ThemeProvider>
  );
} 