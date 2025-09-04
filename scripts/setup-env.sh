#!/bin/bash

# Setup environment variables for local Supabase development

echo "🚀 Setting up environment variables for local Supabase development..."

# Create .env.local file
cat > .env.local << EOF
# Supabase Local Development Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Database URL for direct connections
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Storage Configuration
S3_ACCESS_KEY=625729a08b95bf1b7ff351a663f3a23c
S3_SECRET_KEY=850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
S3_REGION=local
S3_ENDPOINT=http://127.0.0.1:54321/storage/v1/s3

# JWT Secret
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# AI Configuration (you'll need to add your OpenAI API key)
# OPENAI_API_KEY=your_openai_api_key_here

# Vercel Configuration (if using Vercel)
# VERCEL_BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
EOF

echo "✅ Created .env.local file with local Supabase configuration"
echo ""
echo "📋 Next steps:"
echo "1. Add your OpenAI API key to .env.local"
echo "2. Restart your development server: pnpm dev"
echo "3. Visit http://localhost:3001 to test the application"
echo "4. Visit http://127.0.0.1:54323 for Supabase Studio"
echo ""
echo "🔗 Useful URLs:"
echo "   - Application: http://localhost:3001"
echo "   - Supabase Studio: http://127.0.0.1:54323"
echo "   - API: http://127.0.0.1:54321"
echo "   - Storage: http://127.0.0.1:54321/storage/v1/s3"
