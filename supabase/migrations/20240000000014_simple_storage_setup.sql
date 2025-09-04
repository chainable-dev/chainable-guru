-- Simple storage setup without modifying system tables
-- This migration focuses on creating the bucket and basic policies

-- Create the chat_attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat_attachments',
    'chat_attachments',
    true,
    52428800, -- 50MB
    ARRAY['image/*', 'application/pdf', 'text/*']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/*', 'application/pdf', 'text/*']::text[];

-- Create basic storage policies (these will be created by Supabase automatically in most cases)
-- We'll let Supabase handle the default storage policies
