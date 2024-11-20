export interface Account {
    address: string;
    chainId: number;
    network: string;
    isConnected: boolean;
    networkInfo: {
        name: string;
        isSupported: boolean;
        chainId: number | undefined;
    };
    isCorrectNetwork: boolean;
    connectionStatus: string;
} 