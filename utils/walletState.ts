export async function getWalletState(walletId: string) {
    try {
        // Example: Fetch from local storage or a database
        const state = localStorage.getItem(`walletState-${walletId}`);
        return state ? JSON.parse(state) : null;
    } catch (error) {
        console.error('Error fetching wallet state:', error);
        return null;
    }
}

export async function updateWalletState(walletId: string, newState: any) {
    try {
        localStorage.setItem(`walletState-${walletId}`, JSON.stringify(newState));
    } catch (error) {
        console.error('Error updating wallet state:', error);
    }
}

export async function clearWalletState(walletId: string) {
    try {
        localStorage.removeItem(`walletState-${walletId}`);
    } catch (error) {
        console.error('Error clearing wallet state:', error);
    }
} 