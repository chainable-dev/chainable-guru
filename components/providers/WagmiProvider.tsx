"use client";

import React from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';

import { config } from '@/config/wagmi';

const WagmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {



  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
};

export default WagmiProvider;