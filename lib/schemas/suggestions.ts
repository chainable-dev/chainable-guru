import { z } from 'zod';

export const suggestionSchema = z.object({
  id: z.string(),
  document_id: z.string(),
  content: z.string(),
  original_text: z.string(),
  suggested_text: z.string(),
  document_created_at: z.string(),
  user_id: z.string(),
  is_resolved: z.boolean(),
  created_at: z.string(),
  description: z.string().optional()
});

export type Suggestion = z.infer<typeof suggestionSchema>;

// For mutations
export const createSuggestionSchema = suggestionSchema.omit({ 
  id: true,
  created_at: true 
});

export type CreateSuggestion = z.infer<typeof createSuggestionSchema>; 