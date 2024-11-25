import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { Database } from '@/types/supabase';

// Create a single instance for the server
const serverClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Function to get authenticated client
export async function getAuthenticatedClient() {
  const { getToken } = auth();
  const supabaseAccessToken = await getToken({ template: 'supabase' });
  
  if (supabaseAccessToken) {
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`
          }
        }
      }
    );
  }
  
  return serverClient;
}

// For client components
export function createDatabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// For server components
export { serverClient as databaseClient }; 