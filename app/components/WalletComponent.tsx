import React from 'react';
import { useWalletState } from '../../hooks/useWalletState';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface WalletComponentProps {
    walletId: string;
}

function WalletComponent({ walletId }: WalletComponentProps) {
    const { walletState, updateState, clearState } = useWalletState(walletId);

    const handleConnect = async () => {
        const newState = {
            address: '0x34D8cd259f248A7Ca8669Ad8A76Dc6226aD17414',
            chainId: 8453,
            network: 'Base Mainnet',
            isConnected: true,
            networkInfo: 'Base Mainnet',
            isCorrectNetwork: true,
        };
        await updateState(newState);
        toast.success('Wallet connected successfully!');
    };

    const handleDisconnect = async () => {
        await clearState();
        toast.success('Wallet disconnected successfully!');
    };

    return (
        <div>
            <h1>Wallet</h1>
            {walletState ? (
                <div>
                    <p>Connected: {walletState.address}</p>
                    <p>Network: {walletState.network}</p>
                    <button onClick={handleDisconnect}>Disconnect</button>
                </div>
            ) : (
                <button onClick={handleConnect}>Connect</button>
            )}
            <ToastContainer />
        </div>
    );
}

export default WalletComponent; 