import { useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export function useDatabase() {
  const client = useMemo(() => createClientComponentClient<Database>(), []);
  
  const getAuthenticatedClient = useCallback(async () => {
    const { data: { session } } = await client.auth.getSession();
    if (!session) {
      throw new Error('No authenticated session');
    }
    return client;
  }, [client]);

  return {
    client,
    getAuthenticatedClient
  } as const;
}

export type DatabaseClient = SupabaseClient<Database>; 