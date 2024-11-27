import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openAIKey: string;
  setOpenAIKey: (key: string) => void;
  clearOpenAIKey: () => void;
  isLocalhost: boolean;
  setIsLocalhost: (isLocal: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openAIKey: '',
      isLocalhost: typeof window !== 'undefined' && window.location.hostname === 'localhost',
      setOpenAIKey: (key) => set({ openAIKey: key }),
      clearOpenAIKey: () => set({ openAIKey: '' }),
      setIsLocalhost: (isLocal) => set({ isLocalhost: isLocal }),
    }),
    {
      name: 'settings-storage',
    }
  )
); 