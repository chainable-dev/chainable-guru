# Supabase Database Setup Guide

## Current Database Schema

Your project has a well-structured database schema with the following tables:

- **users** - User authentication and profiles
- **chats** - Chat conversations
- **messages** - Individual messages within chats
- **documents** - Document creation and editing
- **suggestions** - Writing suggestions for documents
- **votes** - Message voting system
- **file_uploads** - File storage and management

## Setting Up a New Supabase Project

### Step 1: Get Your Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your profile icon (top right)
3. Go to "Access Tokens"
4. Create a new token with appropriate permissions
5. Copy the token

### Step 2: Set Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Supabase Access Token (for MCP tools)
SUPABASE_ACCESS_TOKEN=your_supabase_access_token

# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# Vercel Configuration (if using Vercel)
VERCEL_BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Step 3: Create New Project

Once you have your access token, I can help you:

1. **List existing projects** to see what you have
2. **Create a new project** specifically for this application
3. **Apply all migrations** to set up the database schema
4. **Configure RLS policies** for security
5. **Set up storage buckets** for file uploads

## Database Features

Your schema includes:

- ✅ **Row Level Security (RLS)** - Users can only access their own data
- ✅ **File Storage** - Integrated with Supabase Storage
- ✅ **Real-time subscriptions** - For live chat updates
- ✅ **Full-text search** - Using PostgreSQL extensions
- ✅ **Document versioning** - Track document changes
- ✅ **Message voting** - User feedback system

## Next Steps

1. Provide your Supabase access token
2. I'll help create a new project
3. Apply all migrations
4. Test the database connection
5. Verify all features work correctly

## Migration Files

Your project includes these migrations:
- `20240000000001_extensions.sql` - Database extensions
- `20240000000002_users.sql` - User table setup
- `20240000000003_chats_and_messages.sql` - Chat system
- `20240000000004_documents_and_suggestions.sql` - Document features
- `20240000000005_message_votes.sql` - Voting system
- `20240000000006_triggers.sql` - Database triggers
- `20240000000007_indexes.sql` - Performance indexes
- `20240000000008_document_rls.sql` - Document security
- `20240000000009_suggestions_rls.sql` - Suggestion security
- `20240000000010_squashed_file_uploads.sql` - File storage
- `20240000000011_fix_bucket_policies.sql` - Storage policies
- `20240000000012_fix_auth_and_documents.sql` - Auth fixes
