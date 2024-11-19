import React from 'react';
import { useAccount } from 'wagmi';

const WalletTest = () => {
  const { address, isConnected } = useAccount();

  return (
    <div>
      <h1>Wallet State</h1>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      {isConnected && (
        <div>
          <p>Wallet Address: {address}</p>
          {/* Add more wallet details as needed */}
        </div>
      )}
    </div>
  );
};

export default WalletTest; 