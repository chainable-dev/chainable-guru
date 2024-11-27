import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openAIKey: string;
  setOpenAIKey: (key: string) => void;
  clearOpenAIKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openAIKey: '',
      setOpenAIKey: (key) => set({ openAIKey: key }),
      clearOpenAIKey: () => set({ openAIKey: '' }),
    }),
    {
      name: 'settings-storage',
    }
  )
); 