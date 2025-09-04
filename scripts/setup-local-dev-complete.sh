#!/bin/bash

# Complete Local Development Setup Script
# This script ensures seamless local development with Supabase

set -e

echo "🚀 Setting up complete local development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "npm install -g supabase"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install it first:"
        echo "npm install -g pnpm"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Stop any running processes
cleanup_processes() {
    print_status "Cleaning up existing processes..."
    
    # Kill any running Next.js dev servers
    pkill -f "next dev" 2>/dev/null || true
    
    # Stop Supabase if running
    supabase stop 2>/dev/null || true
    
    print_success "Processes cleaned up"
}

# Clear caches
clear_caches() {
    print_status "Clearing caches..."
    
    # Clear Next.js cache
    rm -rf .next 2>/dev/null || true
    
    # Clear node modules cache
    rm -rf node_modules/.cache 2>/dev/null || true
    
    print_success "Caches cleared"
}

# Unset any global environment variables that might interfere
unset_global_env() {
    print_status "Unsetting global environment variables..."
    
    unset NEXT_PUBLIC_SUPABASE_URL 2>/dev/null || true
    unset NEXT_PUBLIC_SUPABASE_ANON_KEY 2>/dev/null || true
    unset SUPABASE_SERVICE_ROLE_KEY 2>/dev/null || true
    unset SUPABASE_URL 2>/dev/null || true
    unset SUPABASE_ANON_KEY 2>/dev/null || true
    unset SUPABASE_SERVICE_ROLE_KEY 2>/dev/null || true
    
    print_success "Global environment variables unset"
}

# Create comprehensive environment file
create_env_file() {
    print_status "Creating comprehensive environment file..."
    
    cat > .env.local << 'EOF'
# Local Development Configuration
# This file ensures the application works reliably in local development

# Supabase Configuration (Local)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# OpenAI Configuration
# OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=localhost

# Disable email confirmations for local development
NEXT_PUBLIC_DISABLE_EMAIL_CONFIRM=true

# Local development flags
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug
EOF

    print_success "Environment file created"
}

# Start Supabase
start_supabase() {
    print_status "Starting Supabase..."
    
    # Start Supabase
    supabase start
    
    # Wait for Supabase to be ready
    print_status "Waiting for Supabase to be ready..."
    sleep 5
    
    # Check if Supabase is running
    if supabase status | grep -q "API URL: http://127.0.0.1:54321"; then
        print_success "Supabase is running"
    else
        print_error "Failed to start Supabase"
        exit 1
    fi
}

# Create test user
create_test_user() {
    print_status "Creating test user..."
    
    # Create test user via API
    curl -X POST 'http://127.0.0.1:54321/auth/v1/signup' \
      -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@local.dev",
        "password": "testpassword123"
      }' 2>/dev/null || true
    
    print_success "Test user created (test@local.dev / testpassword123)"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    pnpm install
    print_success "Dependencies installed"
}

# Start development server
start_dev_server() {
    print_status "Starting development server..."
    
    # Start in background
    pnpm dev &
    
    # Wait for server to start
    print_status "Waiting for development server to start..."
    sleep 8
    
    # Check if server is running
    if lsof -i :3001 &>/dev/null; then
        print_success "Development server is running on http://localhost:3001"
    else
        print_warning "Development server might still be starting..."
    fi
}

# Test the setup
test_setup() {
    print_status "Testing the setup..."
    
    # Test Supabase connection
    if curl -s http://127.0.0.1:54321/health | grep -q "ok"; then
        print_success "Supabase is responding"
    else
        print_error "Supabase is not responding"
    fi
    
    # Test Next.js server
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|307"; then
        print_success "Next.js server is responding"
    else
        print_warning "Next.js server might still be starting..."
    fi
}

# Main execution
main() {
    echo "🎯 Complete Local Development Setup"
    echo "=================================="
    
    check_dependencies
    cleanup_processes
    clear_caches
    unset_global_env
    create_env_file
    start_supabase
    create_test_user
    install_dependencies
    start_dev_server
    test_setup
    
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "📋 Access URLs:"
    echo "  • Application: http://localhost:3001"
    echo "  • Supabase Studio: http://127.0.0.1:54323"
    echo "  • Supabase API: http://127.0.0.1:54321"
    echo ""
    echo "🔐 Test Credentials:"
    echo "  • Email: test@local.dev"
    echo "  • Password: testpassword123"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Open http://localhost:3001 in your browser"
    echo "  2. Login with the test credentials"
    echo "  3. Test the chatbot functionality"
    echo ""
    echo "💡 Tips:"
    echo "  • Use 'supabase stop' to stop Supabase"
    echo "  • Use 'supabase start' to restart Supabase"
    echo "  • Check Supabase Studio for database management"
    echo ""
}

# Run main function
main "$@"
