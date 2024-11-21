import type { WalletInfo } from '@/types';
import type { ChatCompletionTool } from 'openai/resources/chat';

export const tools = {
  createDocument: {
    execute: async (params: any) => {
      // Implementation
      return { success: true };
    }
  }
};

export function getAvailableTools(walletInfo: WalletInfo): ChatCompletionTool[] {
  return [
    {
      type: 'function',
      function: {
        name: 'createDocument',
        description: 'Create a new document',
        parameters: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Document content'
            }
          },
          required: ['content']
        }
      }
    }
  ];
} 