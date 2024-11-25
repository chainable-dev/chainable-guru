import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { getAuthenticatedClient } from './client';
import type { Database } from '@/types/supabase';

export async function getServerDatabase() {
  try {
    return await getAuthenticatedClient();
  } catch (error) {
    // Fallback to anonymous client if auth fails
    return createServerComponentClient<Database>({ cookies });
  }
} 