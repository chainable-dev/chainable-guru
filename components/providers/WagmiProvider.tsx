"use client";

import React from 'react';
import { WagmiConfig, createClient } from 'wagmi';

const client = createClient({
    autoConnect: true,
    // Add your provider configuration here
});

const WagmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <WagmiConfig client={client}>
            {children}
        </WagmiConfig>
    );
};

export default WagmiProvider; 