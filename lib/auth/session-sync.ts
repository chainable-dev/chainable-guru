import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { clerkClient } from '@clerk/nextjs';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function syncSupabaseSession() {
  const { getToken } = auth();
  const token = await getToken({ template: 'supabase' });
  
  if (token) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });
  }
  
  return supabase;
}

export async function getSupabaseClient() {
  return await syncSupabaseSession();
}

export async function migrateUserToClerk(email: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // Find existing Supabase user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Create secure migration token
    const migrationToken = createHash('sha256')
      .update(`${existingUser.id}-${Date.now()}`)
      .digest('hex');

    // Store migration token with expiry
    await supabase
      .from('auth_migrations')
      .insert({
        user_id: existingUser.id,
        migration_token: migrationToken,
        email: email,
        expires_at: new Date(Date.now() + 1000 * 60 * 15) // 15 minutes
      });

    // Create or update Clerk user
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: null, // Force OAuth or magic link
      publicMetadata: {
        supabaseId: existingUser.id,
        migrationToken
      }
    });

    // Update Supabase user with Clerk ID
    await supabase
      .from('users')
      .update({
        clerk_id: clerkUser.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUser.id);

    return {
      success: true,
      message: 'Migration initiated. Please check your email to complete the process.'
    };

  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: 'Failed to migrate user'
    };
  }
} 