# Vercel Environment Variables Setup

This document lists all the environment variables that need to be configured in Vercel for the application to work properly.

## Required Environment Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### OpenAI Configuration
```
OPENAI_API_KEY=your_openai_api_key
```

### Application Configuration
```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

### Optional Features
```
NEXT_PUBLIC_FEATURE_ATTACHMENTS=true
NEXT_PUBLIC_FEATURE_WEB_SEARCH=true
```

### Optional Services
```
BING_API_KEY=your_bing_search_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Make sure to add them for all environments (Production, Preview, Development)

## Security Notes

- Never commit actual API keys to the repository
- Use Vercel's environment variables for all sensitive data
- The `SUPABASE_SERVICE_ROLE_KEY` should be kept secret
- The `OPENAI_API_KEY` should be kept secret

## Local Development

For local development, create a `.env.local` file with the same variables but use local Supabase URLs and keys.
