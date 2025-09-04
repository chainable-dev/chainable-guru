# Getting Your Supabase Access Token

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account

## Step 2: Get Your Access Token

1. Click on your **profile icon** in the top-right corner
2. Select **"Access Tokens"** from the dropdown menu
3. Click **"Generate new token"**
4. Give it a name like "Chainable Guru MCP"
5. Select appropriate permissions (at minimum: `projects:read`, `projects:write`)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't be able to see it again)

## Step 3: Set Environment Variable

Add this to your `.env.local` file:

```bash
SUPABASE_ACCESS_TOKEN=your_token_here
```

## Step 4: Test the Connection

Once you have the token set, I can help you:

1. **List your existing projects**
2. **Create a new project** for this application
3. **Apply all database migrations**
4. **Set up storage buckets**
5. **Configure security policies**

## Alternative: Use Existing Project

If you already have a Supabase project you want to use:

1. Go to your project dashboard
2. Go to **Settings** → **API**
3. Copy your:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Security Note

- Keep your access token secure
- Don't commit it to version control
- Use environment variables only
- The service role key has admin privileges - keep it secret
