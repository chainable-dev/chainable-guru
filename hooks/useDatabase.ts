import { useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@clerk/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export function useDatabase() {
  const client = useMemo(() => createClientComponentClient<Database>(), []);
  const { userId } = useAuth();
  
  const getAuthenticatedClient = useCallback(async () => {
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }
    return client;
  }, [client, userId]);

  return {
    client,
    getAuthenticatedClient,
    isAuthorized: Boolean(userId)
  } as const;
}

export type DatabaseClient = SupabaseClient<Database>; 