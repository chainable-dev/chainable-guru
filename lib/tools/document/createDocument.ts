import { z } from 'zod';
import { StreamData } from 'ai';
import { generateUUID } from '@/lib/utils';
import { saveDocument } from '@/db/mutations';
import { customModel } from '@/ai';
import { createDocumentFunctionCall } from './function-calls';
import { getUser } from '@/lib/auth/utils';
import { streamText } from '@/lib/utils/stream';

export const createDocumentSchema = z.object({
  title: z.string(),
  modelId: z.string()
});

export type CreateDocumentParams = z.infer<typeof createDocumentSchema>;

export const createDocument = {
  description: createDocumentFunctionCall.description,
  parameters: createDocumentSchema,
  execute: async ({ title, modelId }: CreateDocumentParams) => {
    const id = generateUUID();
    let draftText: string = '';
    const data = new StreamData();

    try {
      const user = await getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      data.append({ type: 'id', content: id });
      data.append({ type: 'title', content: title });

      await saveDocument({
        id,
        title,
        content: 'Draft content',
        userId: user.id
      });

      return {
        type: 'tool-result',
        result: {
          id,
          title,
          content: `A document was created and is now visible to the user.`,
        }
      };
    } catch (error) {
      console.error('Error creating document:', error);
      return {
        type: 'tool-result',
        result: {
          error: 'Failed to create document',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}; 