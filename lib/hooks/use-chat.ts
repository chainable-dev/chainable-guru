import { useCallback } from 'react';
import { useSettingsStore } from '../store/settings-store';
import { useModelSettings } from '../store/model-settings';
import { createClient } from '@/lib/supabase/client';

export function useChat() {
  const { openAIKey } = useSettingsStore();
  const { settings } = useModelSettings();

  const sendMessage = useCallback(async (message: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          ...(openAIKey && { 'X-OpenAI-Key': openAIKey }),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          settings: {
            model: settings.model,
            maxTokens: settings.maxTokens,
            temperature: settings.temperature,
            topK: settings.topK,
            topP: settings.topP,
            repeatPenalty: settings.repeatPenalty,
            stop: settings.stop,
            systemPrompt: settings.systemPrompt
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to send message');
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [openAIKey, settings]);

  return { sendMessage };
} 