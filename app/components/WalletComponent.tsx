import React from 'react';
import { useWalletState } from '../../hooks/useWalletState';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function WalletComponent({ walletId }) {
    const { isConnected, lastAccount, updateState, clearState } = useWalletState(walletId);

    const handleConnect = async () => {
        const newState = {
            address: lastAccount || '0xDefaultAddress',
            chainId: 8453,
            network: 'Base Mainnet',
            isConnected: true,
            networkInfo: 'Base Mainnet',
            isCorrectNetwork: true,
            connectionStatus: 'connected',
        };
        await updateState(newState);
        toast.success(`Wallet connected successfully! Last account: ${lastAccount}`);
    };

    const handleDisconnect = async () => {
        await clearState();
        toast.warning(`Wallet disconnected. Last account was: ${lastAccount}`);
    };

    return (
        <div>
            <h1>Wallet</h1>
            {isConnected ? (
                <div>
                    <p>Connected: {lastAccount}</p>
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