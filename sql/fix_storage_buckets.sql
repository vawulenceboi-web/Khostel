-- Safe SQL snippet to fix storage bucket issues
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Create storage buckets if they don't exist
-- Note: You might need to create these via Supabase Dashboard if SQL doesn't work

-- Try to create buckets via SQL (might need manual creation)
DO $$ 
BEGIN
  -- Try to insert buckets (this might fail and require manual creation)
  BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES 
      ('hostel-media', 'hostel-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']),
      ('face-verification', 'face-verification', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Storage buckets created successfully via SQL';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create buckets via SQL - please create manually in Supabase Dashboard';
    RAISE NOTICE 'Bucket 1: hostel-media (public, 50MB limit, images/videos)';
    RAISE NOTICE 'Bucket 2: face-verification (private, 10MB limit, images only)';
  END;
END $$;

-- Step 2: Create RLS policies for storage (if buckets exist)
DO $$
BEGIN
  -- Policies for hostel-media bucket
  BEGIN
    CREATE POLICY "Anyone can view hostel media" ON storage.objects
      FOR SELECT USING (bucket_id = 'hostel-media');
    RAISE NOTICE 'Created public read policy for hostel-media';
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Public read policy already exists for hostel-media';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create hostel-media policies - bucket might not exist';
  END;

  BEGIN
    CREATE POLICY "Authenticated users can upload hostel media" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'hostel-media' AND 
        auth.role() = 'authenticated'
      );
    RAISE NOTICE 'Created upload policy for hostel-media';
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Upload policy already exists for hostel-media';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create hostel-media upload policy';
  END;

  -- Policies for face-verification bucket
  BEGIN
    CREATE POLICY "Users can upload their own face verification" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'face-verification' AND 
        auth.role() = 'authenticated'
      );
    RAISE NOTICE 'Created face verification upload policy';
  EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Face verification policy already exists';
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create face-verification policies - bucket might not exist';
  END;
END $$;

-- Step 3: Manual bucket creation instructions
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== MANUAL BUCKET CREATION REQUIRED ===';
  RAISE NOTICE '';
  RAISE NOTICE 'If buckets were not created automatically, please create them manually:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Go to Supabase Dashboard > Storage';
  RAISE NOTICE '2. Create bucket: hostel-media';
  RAISE NOTICE '   - Public: Yes';
  RAISE NOTICE '   - File size limit: 50MB';
  RAISE NOTICE '   - Allowed types: image/jpeg, image/png, image/webp, video/mp4, video/webm';
  RAISE NOTICE '';
  RAISE NOTICE '3. Create bucket: face-verification';
  RAISE NOTICE '   - Public: No (Private)';
  RAISE NOTICE '   - File size limit: 10MB';
  RAISE NOTICE '   - Allowed types: image/jpeg, image/png, image/webp';
  RAISE NOTICE '';
  RAISE NOTICE 'After creating buckets manually, profile photo upload will work!';
  RAISE NOTICE '';
END $$;

-- Step 4: Test bucket accessibility
DO $$
DECLARE
  bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bucket_count FROM storage.buckets WHERE id IN ('hostel-media', 'face-verification');
  
  IF bucket_count = 2 THEN
    RAISE NOTICE '✅ Both storage buckets exist and are ready!';
  ELSIF bucket_count = 1 THEN
    RAISE NOTICE '⚠️ Only one storage bucket exists - please create the missing one manually';
  ELSE
    RAISE NOTICE '❌ No storage buckets found - please create them manually in Supabase Dashboard';
  END IF;
  
  RAISE NOTICE 'Found % storage bucket(s)', bucket_count;
END $$;