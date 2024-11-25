import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function migrateUserAuth(userId: string) {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // Create a secure one-time migration token
    const migrationToken = crypto.randomUUID();
    
    // Store the migration token with expiry
    await supabase
      .from('auth_migrations')
      .insert({
        user_id: userId,
        migration_token: migrationToken,
        expires_at: new Date(Date.now() + 1000 * 60 * 15) // 15 minutes
      });

    // Send migration email to user
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `/auth/migrate?token=${migrationToken}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
} 