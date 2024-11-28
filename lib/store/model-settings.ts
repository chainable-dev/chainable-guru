import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModelSettings {
  temperature: number;
  topK: number;
  topP: number;
  repeatPenalty: number;
  systemPrompt: string;
}

interface ModelSettingsState {
  settings: ModelSettings;
  updateSettings: (settings: Partial<ModelSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: ModelSettings = {
  temperature: 0.7,
  topK: 40,
  topP: 0.9,
  repeatPenalty: 1.1,
  systemPrompt: "You are a helpful AI assistant. You are direct and concise in your responses.",
};

export const useModelSettings = create<ModelSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'model-settings-storage',
    }
  )
); 