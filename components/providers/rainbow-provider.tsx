'use client'

import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { useTheme } from 'next-themes'
import { WagmiConfig } from 'wagmi'
import { chains, config } from '@/lib/wagmi'
import { useEffect, useState } from 'react'
import { base } from 'wagmi/chains'

const themeConfig = {
  accentColor: '#7b3fe4',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system'
}

export function RainbowProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="invisible">{children}</div>
  }

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={chains}
        initialChain={base}
        theme={resolvedTheme === 'dark' ? darkTheme(themeConfig) : lightTheme(themeConfig)}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
