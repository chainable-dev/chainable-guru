#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase service key. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  full_name: 'Test User'
};

async function seedTestUser() {
  console.log('🌱 Seeding test user...');
  
  try {
    // Create the test user using signUp (works with local Supabase)
    const { data, error } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          full_name: TEST_USER.full_name
        }
      }
    });

    if (error) {
      console.error('❌ Error creating test user:', error.message);
      process.exit(1);
    }

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', TEST_USER.email);
    console.log('🔑 Password:', TEST_USER.password);
    console.log('🆔 User ID:', data.user?.id);

    // Create a test chat for the user
    if (data.user) {
      const { error: chatError } = await supabase
        .from('chats')
        .insert({
          user_id: data.user.id,
          title: 'Welcome Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (chatError) {
        console.warn('⚠️  Could not create test chat:', chatError.message);
      } else {
        console.log('💬 Test chat created successfully!');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting test user seeding...');
  console.log('🔗 Supabase URL:', supabaseUrl);
  
  await seedTestUser();
  
  console.log('\n🎉 Test user setup complete!');
  console.log('You can now login with:');
  console.log(`📧 Email: ${TEST_USER.email}`);
  console.log(`🔑 Password: ${TEST_USER.password}`);
  console.log('\n🌐 Visit: http://localhost:3002/login');
}

main().catch(console.error);
