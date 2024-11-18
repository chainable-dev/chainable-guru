import { createClient } from '@/lib/supabase/server';

export async function saveDocument({
  id,
  title,
  content,
  userId
}: {
  id: string;
  title: string;
  content: string;
  userId: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('documents')
    .insert({
      id,
      title,
      content,
      user_id: userId
    });

  if (error) throw error;
}
