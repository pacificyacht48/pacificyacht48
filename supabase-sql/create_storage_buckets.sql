-- Supabase Storage Bucket Setup for 'uploads'
-- This script creates a new bucket and sets up basic security policies.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable public read access
-- This allows anyone to view the uploaded files via their public URL.
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'uploads' );

-- 3. Enable authenticated upload access
-- This allows logged-in admin users to upload files.
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );

-- 4. Enable authenticated update access
-- This allows admin users to overwrite their files.
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );

-- 5. Enable authenticated delete access
-- This allows admin users to delete files.
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );
