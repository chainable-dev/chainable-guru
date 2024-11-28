import { useCallback } from 'react';
import { useSettingsStore } from '../store/settings-store';
import { useModelSettings } from '../store/model-settings';

export function useChat() {
  const { openAIKey } = useSettingsStore();
  const { settings } = useModelSettings();

  const sendMessage = useCallback(async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(openAIKey && { 'X-OpenAI-Key': openAIKey }),
        },
        body: JSON.stringify({
          message,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [openAIKey, settings]);

  return { sendMessage };
} 