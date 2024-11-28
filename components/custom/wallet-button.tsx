'use client';

import { useEffect, useState } from 'react';
import { WalletIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full"
      >
        <WalletIcon className="h-4 w-4" />
        <span className="sr-only">Connect Wallet</span>
      </Button>
    );
  }

  return (
    <BetterTooltip content="Connect Wallet">
      <div className="relative inline-block">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
        >
          <WalletIcon className="h-4 w-4" />
          <span className="sr-only">Connect Wallet</span>
        </Button>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openConnectModal,
            openAccountModal,
            mounted: rainbowKitMounted,
          }) => {
            const ready = rainbowKitMounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
                onClick={connected ? openAccountModal : openConnectModal}
                className="absolute inset-0 cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    connected ? openAccountModal() : openConnectModal();
                  }
                }}
              />
            );
          }}
        </ConnectButton.Custom>
      </div>
    </BetterTooltip>
  );
} 