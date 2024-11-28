import { darkTheme, lightTheme } from '@rainbow-me/rainbowkit';

export const customDarkTheme = darkTheme({
  accentColor: 'hsl(var(--primary))',
  accentColorForeground: 'hsl(var(--primary-foreground))',
  borderRadius: 'medium',
  overlayBlur: 'small',
});

export const customLightTheme = lightTheme({
  accentColor: 'hsl(var(--primary))',
  accentColorForeground: 'hsl(var(--primary-foreground))',
  borderRadius: 'medium',
  overlayBlur: 'small',
}); 