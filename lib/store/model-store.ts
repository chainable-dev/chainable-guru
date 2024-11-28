import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Model {
  id: string;
  name: string;
  provider: 'openai' | 'ollama';
}

interface ModelState {
  models: Model[];
  selectedModelId: string;
  setModels: (models: Model[]) => void;
  setSelectedModel: (modelId: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      models: [],
      selectedModelId: 'gpt-3.5-turbo',
      isLoading: true,
      setModels: (models) => set({ models, isLoading: false }),
      setSelectedModel: (modelId) => set({ selectedModelId: modelId }),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'model-store',
    }
  )
); 