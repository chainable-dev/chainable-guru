import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useModelStore } from '@/lib/store/model-store';

export function useModel() {
  const router = useRouter();
  const { 
    models, 
    selectedModelId, 
    isLoading, 
    setModels, 
    setSelectedModel, 
    setIsLoading 
  } = useModelStore();

  const selectedModel = models.find(model => model.id === selectedModelId) || models[0];

  const handleModelChange = useCallback((value: string) => {
    const newModel = models.find(m => m.id === value);
    if (newModel) {
      toast.success(
        `Switching to ${newModel.name}${newModel.provider === 'ollama' ? ' (Local)' : ''}...`,
        {
          duration: 1000,
          onAutoClose: () => {
            setSelectedModel(value);
            router.push(`/?model=${value}`);
          }
        }
      );
    }
  }, [models, router, setSelectedModel]);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to load available models');
    }
  }, [setModels]);

  return {
    models,
    selectedModel,
    selectedModelId,
    isLoading,
    handleModelChange,
    fetchModels,
    setIsLoading
  };
} 