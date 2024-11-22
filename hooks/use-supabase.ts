import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    setClient(supabase);
  }, []);

  return client;
} 