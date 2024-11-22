'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWalletState } from '@/hooks/useWalletState';
import { truncateAddress } from '@/lib/utils';
import { Wallet, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function Web3Button() {
  const { address, isConnected, networkInfo, balance } = useWalletState();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Wallet className="mr-2 h-4 w-4" />
          {isConnected ? (
            <span className="flex items-center gap-2">
              {truncateAddress(address)}
              {balance && (
                <span className="text-muted-foreground">
                  {parseFloat(balance.formatted).toFixed(4)} ETH
                </span>
              )}
            </span>
          ) : (
            'Connect Wallet'
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isConnected ? (
          <>
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            Connect Wallet
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 