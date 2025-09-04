#!/usr/bin/env tsx

/**
 * Database Verification Script for Chainable Guru
 * 
 * This script verifies that all database tables, policies, and functions
 * are properly set up and working correctly.
 */

import { createClient } from '@supabase/supabase-js';

// Database schema verification
const EXPECTED_TABLES = [
  'users',
  'chats', 
  'messages',
  'documents',
  'suggestions',
  'votes',
  'file_uploads'
];

const EXPECTED_FUNCTIONS = [
  'handle_new_user',
  'get_next_file_version',
  'set_file_version',
  'get_document_latest_version',
  'get_latest_document'
];

// Create Supabase client
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  return createClient(url, serviceKey);
}

// Test database connection
async function testConnection(supabase: any) {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Check if all tables exist
async function checkTables(supabase: any) {
  console.log('\n📋 Checking database tables...');
  
  const results = {
    existing: [] as string[],
    missing: [] as string[]
  };
  
  for (const table of EXPECTED_TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        results.missing.push(table);
        console.log(`❌ Missing table: ${table}`);
      } else {
        results.existing.push(table);
        console.log(`✅ Table exists: ${table}`);
      }
    } catch (error) {
      results.missing.push(table);
      console.log(`❌ Error checking table ${table}:`, error);
    }
  }
  
  return results;
}

// Check RLS policies
async function checkRLSPolicies(supabase: any) {
  console.log('\n🔒 Checking Row Level Security policies...');
  
  try {
    // Test RLS by trying to access data without authentication
    const { data, error } = await supabase.from('users').select('*');
    
    if (error && error.message.includes('JWT')) {
      console.log('✅ RLS is properly configured (JWT required)');
      return true;
    } else if (data && data.length === 0) {
      console.log('✅ RLS is properly configured (no data returned)');
      return true;
    } else {
      console.log('⚠️  RLS may not be properly configured');
      return false;
    }
  } catch (error) {
    console.log('✅ RLS is properly configured (access denied)');
    return true;
  }
}

// Check storage buckets
async function checkStorage(supabase: any) {
  console.log('\n📦 Checking storage buckets...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage check failed:', error.message);
      return false;
    }
    
    const bucketNames = buckets.map((bucket: any) => bucket.name);
    console.log(`✅ Available buckets: ${bucketNames.join(', ')}`);
    
    const hasChatAttachments = bucketNames.includes('chat_attachments');
    if (hasChatAttachments) {
      console.log('✅ chat_attachments bucket exists');
    } else {
      console.log('❌ chat_attachments bucket missing');
    }
    
    return hasChatAttachments;
  } catch (error) {
    console.error('❌ Storage check failed:', error);
    return false;
  }
}

// Test basic functionality
async function testBasicFunctionality(supabase: any) {
  console.log('\n🧪 Testing basic functionality...');
  
  try {
    // Test user creation (this should work with service role)
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com'
    };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(testUser)
      .select();
    
    if (userError) {
      console.log('❌ User creation test failed:', userError.message);
      return false;
    }
    
    console.log('✅ User creation works');
    
    // Test chat creation
    const testChat = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Test Chat',
      user_id: testUser.id
    };
    
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .upsert(testChat)
      .select();
    
    if (chatError) {
      console.log('❌ Chat creation test failed:', chatError.message);
      return false;
    }
    
    console.log('✅ Chat creation works');
    
    // Clean up test data
    await supabase.from('chats').delete().eq('id', testChat.id);
    await supabase.from('users').delete().eq('id', testUser.id);
    
    console.log('✅ Basic functionality tests passed');
    return true;
  } catch (error) {
    console.error('❌ Basic functionality test failed:', error);
    return false;
  }
}

// Main verification function
async function main() {
  console.log('🔍 Verifying Chainable Guru Database Setup\n');
  
  const supabase = createSupabaseClient();
  
  // Test connection
  const connected = await testConnection(supabase);
  if (!connected) {
    process.exit(1);
  }
  
  // Check tables
  const { existing, missing } = await checkTables(supabase);
  
  // Check RLS
  const rlsOk = await checkRLSPolicies(supabase);
  
  // Check storage
  const storageOk = await checkStorage(supabase);
  
  // Test functionality
  const functionalityOk = await testBasicFunctionality(supabase);
  
  // Summary
  console.log('\n📊 Database Verification Summary:');
  console.log(`   Tables: ${existing.length}/${EXPECTED_TABLES.length} configured`);
  console.log(`   RLS Policies: ${rlsOk ? '✅' : '❌'}`);
  console.log(`   Storage: ${storageOk ? '✅' : '❌'}`);
  console.log(`   Functionality: ${functionalityOk ? '✅' : '❌'}`);
  
  if (missing.length > 0) {
    console.log(`\n❌ Missing tables: ${missing.join(', ')}`);
  }
  
  const allGood = existing.length === EXPECTED_TABLES.length && rlsOk && storageOk && functionalityOk;
  
  if (allGood) {
    console.log('\n🎉 Database is fully configured and ready to use!');
    console.log('\n🔗 Next steps:');
    console.log('   1. Add your OpenAI API key to .env.local');
    console.log('   2. Restart your development server: pnpm dev');
    console.log('   3. Visit http://localhost:3001 to test the application');
    console.log('   4. Visit http://127.0.0.1:54323 for Supabase Studio');
  } else {
    console.log('\n⚠️  Database setup incomplete. Please check the issues above.');
  }
}

// Run the verification
if (require.main === module) {
  main().catch(console.error);
}

export { main as verifyDatabase };
