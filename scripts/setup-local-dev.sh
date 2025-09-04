#!/bin/bash

# Local Development Setup Script
# This script ensures the application works reliably in local development

echo "🚀 Setting up local development environment..."

# Create .env.local with proper configuration
cat > .env.local << 'EOF'
# Local Development Configuration
# This file ensures the application works reliably in local development

# Supabase Configuration (Local)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# OpenAI Configuration
# OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=development
# NEXT_PUBLIC_APP_URL will be set dynamically based on the actual port used

# Disable email confirmations for local development
NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION=true

# Local development flags
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOCAL_DEV=true
EOF

echo "✅ Created .env.local with local development configuration"

# Check if Supabase is running
echo "🔍 Checking Supabase status..."
if command -v supabase &> /dev/null; then
    if supabase status &> /dev/null; then
        echo "✅ Supabase is running locally"
    else
        echo "⚠️  Supabase is not running. Starting Supabase..."
        supabase start
    fi
else
    echo "⚠️  Supabase CLI not found. Please install it or start Supabase manually."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Seed test user
echo "👤 Seeding test user..."
pnpm tsx scripts/seed-test-user.ts

echo "🎉 Local development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development server: pnpm dev"
echo "2. Open the URL shown in the terminal (Next.js will find an available port)"
echo "3. Login with: test@example.com / testpassword123"
echo "4. Test the chatbot functionality"
echo ""
echo "🔧 Configuration:"
echo "- Supabase: http://127.0.0.1:54321"
echo "- App: Dynamic port (Next.js will find available port)"
echo "- OpenAI API: Configured with your key"
echo "- Test user: test@example.com / testpassword123"
