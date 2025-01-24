-- Update storage bucket policies for better security and access control

-- Enable Row Level Security (RLS) for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to read their own files
CREATE POLICY "Allow users to read own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to update their own files
CREATE POLICY "Allow users to update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow public read access for shared files
CREATE POLICY "Allow public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'files');