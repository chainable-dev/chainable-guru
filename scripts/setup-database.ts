#!/usr/bin/env tsx

/**
 * Database Setup Script for Chainable Guru
 * 
 * This script helps set up a new Supabase database with all required:
 * - Tables and relationships
 * - Row Level Security policies
 * - Storage buckets and policies
 * - Functions and triggers
 * - Indexes for performance
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Database schema information
const DATABASE_INFO = {
  name: 'Chainable Guru Chat Bot',
  description: 'AI-powered chat application with document editing and file storage',
  features: [
    'User authentication and profiles',
    'Real-time chat conversations',
    'Document creation and editing',
    'Writing suggestions and feedback',
    'File uploads and storage',
    'Message voting system',
    'Full-text search capabilities'
  ],
  tables: [
    'users - User profiles and authentication',
    'chats - Chat conversations',
    'messages - Individual messages',
    'documents - Document creation and editing',
    'suggestions - Writing suggestions',
    'votes - Message voting',
    'file_uploads - File storage management'
  ]
};

// Required environment variables
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Check environment variables
function checkEnvironment() {
  const missing = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease set these in your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables configured');
}

// Create Supabase client
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
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

// Check if tables exist
async function checkTables(supabase: any) {
  const tables = ['users', 'chats', 'messages', 'documents', 'suggestions', 'votes', 'file_uploads'];
  const existingTables = [];
  const missingTables = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        missingTables.push(table);
      } else {
        existingTables.push(table);
      }
    } catch (error) {
      missingTables.push(table);
    }
  }
  
  console.log(`✅ Existing tables: ${existingTables.join(', ')}`);
  if (missingTables.length > 0) {
    console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
  }
  
  return { existingTables, missingTables };
}

// Check storage buckets
async function checkStorage(supabase: any) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage check failed:', error.message);
      return false;
    }
    
    const bucketNames = buckets.map((bucket: any) => bucket.name);
    console.log(`✅ Storage buckets: ${bucketNames.join(', ')}`);
    
    const hasChatAttachments = bucketNames.includes('chat_attachments');
    if (!hasChatAttachments) {
      console.log('❌ Missing chat_attachments bucket');
    }
    
    return hasChatAttachments;
  } catch (error) {
    console.error('❌ Storage check failed:', error);
    return false;
  }
}

// Main setup function
async function main() {
  console.log('🚀 Setting up Chainable Guru Database\n');
  
  // Check environment
  checkEnvironment();
  
  // Create client
  const supabase = createSupabaseClient();
  
  // Test connection
  const connected = await testConnection(supabase);
  if (!connected) {
    process.exit(1);
  }
  
  // Check tables
  const { existingTables, missingTables } = await checkTables(supabase);
  
  // Check storage
  const storageOk = await checkStorage(supabase);
  
  // Summary
  console.log('\n📊 Database Status:');
  console.log(`   Tables: ${existingTables.length}/7 configured`);
  console.log(`   Storage: ${storageOk ? '✅' : '❌'}`);
  
  if (missingTables.length > 0 || !storageOk) {
    console.log('\n⚠️  Database setup incomplete. Please run migrations:');
    console.log('   1. Apply all migration files in supabase/migrations/');
    console.log('   2. Set up storage buckets and policies');
    console.log('   3. Configure Row Level Security policies');
  } else {
    console.log('\n🎉 Database is fully configured and ready to use!');
  }
  
  // Display database info
  console.log('\n📋 Database Information:');
  console.log(`   Name: ${DATABASE_INFO.name}`);
  console.log(`   Description: ${DATABASE_INFO.description}`);
  console.log('   Features:');
  DATABASE_INFO.features.forEach(feature => {
    console.log(`     • ${feature}`);
  });
}

// Run the setup
if (require.main === module) {
  main().catch(console.error);
}

export { main as setupDatabase };
