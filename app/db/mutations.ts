import { Task } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/server';

export async function createTask(task: Omit<Task, 'created_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  taskId: string,
  update: Partial<Omit<Task, 'id' | 'created_at'>>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTasksByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTaskById(taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
} 