"use client";

import { RainbowKitProvider as RainbowKitProviderBase } from '@rainbow-me/rainbowkit';
import { darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const customDarkTheme = darkTheme({
  accentColor: 'hsl(var(--primary))',
  accentColorForeground: 'hsl(var(--primary-foreground))',
  borderRadius: 'medium',
  overlayBlur: 'small',
});

const customLightTheme = lightTheme({
  accentColor: 'hsl(var(--primary))',
  accentColorForeground: 'hsl(var(--primary-foreground))',
  borderRadius: 'medium',
  overlayBlur: 'small',
});

export function RainbowKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RainbowKitProviderBase
      theme={{
        lightMode: customLightTheme,
        darkMode: customDarkTheme,
      }}
    >
      {children}
    </RainbowKitProviderBase>
  );
} 