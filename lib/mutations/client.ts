import { createClient } from '@/lib/supabase/client';

export async function applySuggestionClient({
  suggestionId,
  chatId,
}: {
  suggestionId: string;
  chatId: string;
}) {
  const client = createClient();
  
  const { error } = await client
    .from('suggestions')
    .update({ is_resolved: true })
    .eq('id', suggestionId);

  if (error) throw error;
  
  return { success: true };
} 