import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// If you want to export a createClient function, you can do it like this:
export const createClient = () => {
    return supabase;
}; 