-- Safe SQL snippet for profile photo system
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Create profile-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Step 2: Set up RLS policies for profile photos
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profiles' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can view their own profile photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-photos' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profiles' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Public can view all profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'profiles' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Step 3: Add profile completeness tracking
DO $$ 
BEGIN
  -- Add profile_completeness_score column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_completeness_score') THEN
    ALTER TABLE users ADD COLUMN profile_completeness_score INTEGER DEFAULT 0;
    RAISE NOTICE 'Added profile_completeness_score column';
  END IF;
  
  -- Add trust_level column for agents
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trust_level') THEN
    ALTER TABLE users ADD COLUMN trust_level VARCHAR(20) DEFAULT 'basic' 
      CHECK (trust_level IN ('basic', 'standard', 'premium', 'verified_plus'));
    RAISE NOTICE 'Added trust_level column';
  END IF;
END $$;

-- Step 4: Create function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
    trust_level VARCHAR(20) := 'basic';
BEGIN
    -- Base score for required fields
    IF NEW.first_name IS NOT NULL AND NEW.first_name != '' THEN score := score + 10; END IF;
    IF NEW.last_name IS NOT NULL AND NEW.last_name != '' THEN score := score + 10; END IF;
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN score := score + 10; END IF;
    
    -- Additional points for optional but important fields
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN score := score + 15; END IF;
    IF NEW.address IS NOT NULL AND NEW.address != '' THEN score := score + 15; END IF;
    IF NEW.profile_image_url IS NOT NULL AND NEW.profile_image_url != '' THEN score := score + 20; END IF;
    
    -- Agent-specific scoring
    IF NEW.role = 'agent' THEN
        IF NEW.business_reg_number IS NOT NULL AND NEW.business_reg_number != '' THEN score := score + 10; END IF;
        IF NEW.verified_status = true THEN score := score + 10; END IF;
        IF NEW.face_verification_status = 'approved' THEN score := score + 10; END IF;
    END IF;
    
    -- Determine trust level based on score
    IF score >= 90 THEN trust_level := 'verified_plus';
    ELSIF score >= 70 THEN trust_level := 'premium';
    ELSIF score >= 50 THEN trust_level := 'standard';
    ELSE trust_level := 'basic';
    END IF;
    
    -- Update the record
    NEW.profile_completeness_score := score;
    NEW.trust_level := trust_level;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger for profile completeness
DROP TRIGGER IF EXISTS trigger_calculate_profile_completeness ON users;
CREATE TRIGGER trigger_calculate_profile_completeness
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION calculate_profile_completeness();

-- Step 6: Update existing users with completeness scores
UPDATE users SET updated_at = NOW() WHERE role = 'agent';

-- Verification query
SELECT 'Profile photo system ready!' as status,
       'Trust and safety indicators configured' as feature,
       COUNT(*) as agent_count
FROM users WHERE role = 'agent';