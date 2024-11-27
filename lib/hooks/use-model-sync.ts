import { useEffect } from 'react';
import { useModelStore } from '../store/model-store';
import { useSettingsStore } from '../store/settings-store';
import { toast } from 'sonner';

export function useModelSync(selectedModelId?: string) {
  const { models, selectedModelId: currentModelId, setSelectedModel } = useModelStore();
  const { isLocalhost } = useSettingsStore();

  useEffect(() => {
    // Sync model selection if provided
    if (selectedModelId && selectedModelId !== currentModelId) {
      const newModel = models.find(m => m.id === selectedModelId);
      if (newModel) {
        // Check if model is available based on environment
        const isOllamaModel = newModel.provider === 'ollama';
        if (isOllamaModel && !isLocalhost) {
          toast.error('Ollama models are only available in local development');
          return;
        }
        
        setSelectedModel(selectedModelId);
        toast.success(`Using ${newModel.name}${isOllamaModel ? ' (Local)' : ''}`);
      }
    }
  }, [selectedModelId, currentModelId, models, setSelectedModel, isLocalhost]);

  return {
    currentModelId,
    models,
    setSelectedModel
  };
} 