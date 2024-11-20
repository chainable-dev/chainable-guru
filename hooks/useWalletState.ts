import { useState, useEffect } from 'react';
import { getWalletState, updateWalletState, clearWalletState } from '../utils/walletState';
import { Account } from '../types/account';

export function useWalletState(walletId: string) {
    const [walletState, setWalletState] = useState<Account | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [lastAccount, setLastAccount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchWalletState() {
            try {
                const state = await getWalletState(walletId);
                if (state) {
                    setWalletState(state);
                    setIsConnected(true);
                    setLastAccount(state.address);
                    console.log('Wallet state loaded:', state);
                } else {
                    console.warn('No wallet state found');
                }
            } catch (error) {
                console.error('Failed to load wallet state:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchWalletState();

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                const newState = { ...walletState, address: accounts[0] };
                if (newState.address !== walletState?.address) {
                    updateState(newState);
                    setLastAccount(accounts[0]);
                    console.log('Account changed:', accounts[0]);
                }
            } else {
                clearState();
                console.log('Wallet disconnected');
            }
        };

        const handleChainChanged = (chainId: string) => {
            const newState = { ...walletState, chainId: parseInt(chainId, 16) };
            if (newState.chainId !== walletState?.chainId) {
                updateState(newState);
                console.log('Network changed:', chainId);
            }
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [walletId, walletState]);

    const updateState = async (newState: Account) => {
        if (JSON.stringify(newState) !== JSON.stringify(walletState)) {
            try {
                await updateWalletState(walletId, newState);
                setWalletState(newState);
                setIsConnected(true);
                console.log('Wallet state updated:', newState);
            } catch (error) {
                console.error('Failed to update wallet state:', error);
            }
        }
    };

    const clearState = async () => {
        try {
            await clearWalletState(walletId);
            setWalletState(null);
            setIsConnected(false);
            setLastAccount(null);
            setIsLoading(false);
            console.log('Wallet state cleared');
        } catch (error) {
            console.error('Failed to clear wallet state:', error);
        }
    };

    return { walletState, isConnected, lastAccount, isLoading, updateState, clearState };
}