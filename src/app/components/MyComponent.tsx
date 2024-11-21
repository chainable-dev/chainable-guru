import { createClient } from '@/lib/supabase/server';

export default async function MyComponent() {
    const client = createClient(); // This should be valid in a Server Component context
    // ... use the client ...
} 