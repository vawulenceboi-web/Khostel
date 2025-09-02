-- Safe schema enhancement for real-time hostel posting with media
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Add enhanced media columns to hostels table
DO $$ 
BEGIN
  -- Add media_urls column for photos and videos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'media_urls') THEN
    ALTER TABLE hostels ADD COLUMN media_urls JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added media_urls column for photos/videos';
  END IF;
  
  -- Add media_types column to track file types
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'media_types') THEN
    ALTER TABLE hostels ADD COLUMN media_types JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added media_types column';
  END IF;
  
  -- Add status column for draft/published hostels
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'status') THEN
    ALTER TABLE hostels ADD COLUMN status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'suspended'));
    RAISE NOTICE 'Added status column for hostel publishing';
  END IF;
  
  -- Add last_updated for real-time tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'last_updated') THEN
    ALTER TABLE hostels ADD COLUMN last_updated TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added last_updated column';
  END IF;
  
  -- Add verification_attempts column to users for resubmission tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_attempts') THEN
    ALTER TABLE users ADD COLUMN verification_attempts INTEGER DEFAULT 0;
    RAISE NOTICE 'Added verification_attempts column';
  END IF;
  
  -- Add last_verification_attempt timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_verification_attempt') THEN
    ALTER TABLE users ADD COLUMN last_verification_attempt TIMESTAMP;
    RAISE NOTICE 'Added last_verification_attempt column';
  END IF;
END $$;

-- Step 2: Create function to update hostel timestamps automatically
CREATE OR REPLACE FUNCTION update_hostel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger for hostel updates
DROP TRIGGER IF EXISTS trigger_update_hostel_timestamp ON hostels;
CREATE TRIGGER trigger_update_hostel_timestamp
  BEFORE UPDATE ON hostels
  FOR EACH ROW
  EXECUTE FUNCTION update_hostel_timestamp();

-- Step 4: Update existing hostels with current timestamp
UPDATE hostels 
SET last_updated = NOW() 
WHERE last_updated IS NULL;

-- Step 5: Create function to track verification attempts
CREATE OR REPLACE FUNCTION track_verification_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Track when agents attempt verification
  IF NEW.role = 'agent' AND OLD.verified_status = NEW.verified_status AND NEW.verified_status = false THEN
    -- This is a resubmission attempt
    NEW.verification_attempts = COALESCE(OLD.verification_attempts, 0) + 1;
    NEW.last_verification_attempt = NOW();
    RAISE NOTICE 'Agent % resubmission attempt #%', NEW.email, NEW.verification_attempts;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for verification attempts
DROP TRIGGER IF EXISTS trigger_track_verification_attempt ON users;
CREATE TRIGGER trigger_track_verification_attempt
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION track_verification_attempt();

-- Step 7: Create media upload tracking table
CREATE TABLE IF NOT EXISTS hostel_media (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hostel_id VARCHAR NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_size BIGINT,
  upload_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  uploaded_by VARCHAR REFERENCES users(id)
);

-- Step 8: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_hostels_agent_id ON hostels(agent_id);
CREATE INDEX IF NOT EXISTS idx_hostels_status ON hostels(status);
CREATE INDEX IF NOT EXISTS idx_hostels_last_updated ON hostels(last_updated);
CREATE INDEX IF NOT EXISTS idx_hostel_media_hostel_id ON hostel_media(hostel_id);
CREATE INDEX IF NOT EXISTS idx_users_verification_attempts ON users(verification_attempts);

-- Step 9: Grant permissions
GRANT ALL ON hostel_media TO authenticated;
GRANT ALL ON hostel_media TO anon;

-- Step 10: Update existing hostels with media from images column
DO $$
DECLARE
    hostel_record RECORD;
    image_url TEXT;
    i INTEGER;
BEGIN
    FOR hostel_record IN SELECT id, images FROM hostels WHERE images IS NOT NULL AND jsonb_array_length(images) > 0 LOOP
        -- Convert existing images to new media format
        FOR i IN 0..jsonb_array_length(hostel_record.images)-1 LOOP
            image_url := hostel_record.images->>i;
            IF image_url IS NOT NULL AND image_url != '' THEN
                INSERT INTO hostel_media (hostel_id, media_url, media_type, upload_order)
                VALUES (hostel_record.id, image_url, 'image', i)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Migrated existing hostel images to media table';
END $$;

-- Verification query
SELECT 'Enhanced hostel media system ready!' as status,
       COUNT(*) as hostel_count,
       COUNT(CASE WHEN media_urls IS NOT NULL THEN 1 END) as hostels_with_media
FROM hostels;