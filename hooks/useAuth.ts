import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';

//returns a session object
export function useAuth() {
  const supabase = createClient();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event: string, session: Session | null) => {
          setSession(session);
        }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return session;
}
