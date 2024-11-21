import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const supabase = createClient();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return session;
}
