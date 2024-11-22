'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Wallet as WalletIcon, ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import { useWalletState } from '@/hooks/useWalletState';
import { truncateAddress } from '@/lib/utils';

export function WalletDisplay() {
  const { address, isConnected, networkInfo, balance } = useWalletState();

  if (!isConnected) return null;

  return (
    <motion.div 
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-card/50 border rounded-xl p-2 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <WalletIcon className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">{truncateAddress(address)}</span>
          </div>
          <div className="h-3 w-[1px] bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Image src="/eth-logo.png" alt="ETH" width={10} height={10} />
            </div>
            <span className="text-xs">{balance?.formatted || '0.00'}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 