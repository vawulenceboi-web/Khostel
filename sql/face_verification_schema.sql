-- Enhanced Face Verification System Schema
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Add face verification columns to users table
DO $$ 
BEGIN
  -- Add face_photo_url for storing face verification image
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'face_photo_url') THEN
    ALTER TABLE users ADD COLUMN face_photo_url TEXT;
    RAISE NOTICE 'Added face_photo_url column';
  END IF;
  
  -- Add face_verification_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'face_verification_status') THEN
    ALTER TABLE users ADD COLUMN face_verification_status VARCHAR(20) DEFAULT 'pending' 
      CHECK (face_verification_status IN ('pending', 'approved', 'rejected', 'needs_retry'));
    RAISE NOTICE 'Added face_verification_status column';
  END IF;
  
  -- Add face_verification_attempts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'face_verification_attempts') THEN
    ALTER TABLE users ADD COLUMN face_verification_attempts INTEGER DEFAULT 0;
    RAISE NOTICE 'Added face_verification_attempts column';
  END IF;
  
  -- Add face_rejection_reason
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'face_rejection_reason') THEN
    ALTER TABLE users ADD COLUMN face_rejection_reason TEXT;
    RAISE NOTICE 'Added face_rejection_reason column';
  END IF;
  
  -- Add face_verified_at timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'face_verified_at') THEN
    ALTER TABLE users ADD COLUMN face_verified_at TIMESTAMP;
    RAISE NOTICE 'Added face_verified_at column';
  END IF;
END $$;

-- Step 2: Create face_verification_history table for tracking all attempts
CREATE TABLE IF NOT EXISTS face_verification_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  face_photo_url TEXT NOT NULL,
  verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_email VARCHAR(255),
  detection_confidence DECIMAL(3,2), -- AI confidence score (0.00 to 1.00)
  detected_issues JSONB DEFAULT '[]'::jsonb, -- Array of issues found
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Enhanced hostel media table for file uploads
CREATE TABLE IF NOT EXISTS hostel_media_files (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hostel_id VARCHAR NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size BIGINT,
  mime_type VARCHAR(100),
  upload_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by VARCHAR REFERENCES users(id),
  storage_path TEXT, -- Supabase Storage path
  public_url TEXT    -- Public accessible URL
);

-- Step 4: Add enhanced media columns to hostels
DO $$ 
BEGIN
  -- Add media_files_count for quick reference
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'media_files_count') THEN
    ALTER TABLE hostels ADD COLUMN media_files_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added media_files_count column';
  END IF;
  
  -- Add has_video flag for quick filtering
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'has_video') THEN
    ALTER TABLE hostels ADD COLUMN has_video BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added has_video column';
  END IF;
  
  -- Add featured_image_url for primary display
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'featured_image_url') THEN
    ALTER TABLE hostels ADD COLUMN featured_image_url TEXT;
    RAISE NOTICE 'Added featured_image_url column';
  END IF;
END $$;

-- Step 5: Create function to update media counts automatically
CREATE OR REPLACE FUNCTION update_hostel_media_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update media counts when files are added/removed
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE hostels SET
      media_files_count = (
        SELECT COUNT(*) FROM hostel_media_files WHERE hostel_id = NEW.hostel_id
      ),
      has_video = (
        SELECT COUNT(*) > 0 FROM hostel_media_files 
        WHERE hostel_id = NEW.hostel_id AND file_type = 'video'
      ),
      featured_image_url = (
        SELECT file_url FROM hostel_media_files 
        WHERE hostel_id = NEW.hostel_id AND file_type = 'image'
        ORDER BY upload_order ASC LIMIT 1
      )
    WHERE id = NEW.hostel_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE hostels SET
      media_files_count = (
        SELECT COUNT(*) FROM hostel_media_files WHERE hostel_id = OLD.hostel_id
      ),
      has_video = (
        SELECT COUNT(*) > 0 FROM hostel_media_files 
        WHERE hostel_id = OLD.hostel_id AND file_type = 'video'
      ),
      featured_image_url = (
        SELECT file_url FROM hostel_media_files 
        WHERE hostel_id = OLD.hostel_id AND file_type = 'image'
        ORDER BY upload_order ASC LIMIT 1
      )
    WHERE id = OLD.hostel_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create triggers for media count updates
DROP TRIGGER IF EXISTS trigger_update_media_counts_insert ON hostel_media_files;
CREATE TRIGGER trigger_update_media_counts_insert
  AFTER INSERT ON hostel_media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_hostel_media_counts();

DROP TRIGGER IF EXISTS trigger_update_media_counts_delete ON hostel_media_files;
CREATE TRIGGER trigger_update_media_counts_delete
  AFTER DELETE ON hostel_media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_hostel_media_counts();

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_face_verification_history_user_id ON face_verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_face_verification_history_status ON face_verification_history(verification_status);
CREATE INDEX IF NOT EXISTS idx_hostel_media_files_hostel_id ON hostel_media_files(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_media_files_type ON hostel_media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_users_face_verification_status ON users(face_verification_status);

-- Step 8: Create Supabase Storage buckets (if they don't exist)
-- Note: This might need to be done via Supabase Dashboard or API
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('face-verification', 'face-verification', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']),
  ('hostel-media', 'hostel-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/mov'])
ON CONFLICT (id) DO NOTHING;

-- Step 9: Set up RLS policies for storage buckets
CREATE POLICY "Agents can upload face verification photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'face-verification' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Agents can view their own face photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'face-verification' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Agents can upload hostel media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hostel-media' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Public can view hostel media" ON storage.objects
  FOR SELECT USING (bucket_id = 'hostel-media');

-- Step 10: Grant permissions
GRANT ALL ON face_verification_history TO authenticated;
GRANT ALL ON hostel_media_files TO authenticated;
GRANT ALL ON face_verification_history TO anon;
GRANT ALL ON hostel_media_files TO anon;

-- Step 11: Update existing users to set face verification status
UPDATE users 
SET face_verification_status = 'pending',
    face_verification_attempts = 0
WHERE role = 'agent' AND face_verification_status IS NULL;

-- Verification query
SELECT 'Face verification system ready!' as status,
       'Enhanced agent verification with file uploads' as feature,
       COUNT(*) as agent_count
FROM users WHERE role = 'agent';