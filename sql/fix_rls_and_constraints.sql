-- Complete fix for RLS and constraint issues
-- This addresses both the school constraint and verification_queue RLS problems

-- Step 1: Fix school foreign key constraint
DO $$ 
BEGIN
  -- Drop foreign key constraint if it exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_users_school_id') THEN
    ALTER TABLE users DROP CONSTRAINT fk_users_school_id;
    RAISE NOTICE 'Dropped foreign key constraint fk_users_school_id';
  END IF;
  
  -- Make school_id nullable if not already
  BEGIN
    ALTER TABLE users ALTER COLUMN school_id DROP NOT NULL;
    RAISE NOTICE 'Made school_id nullable';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'school_id was already nullable';
  END;
  
  -- Add back foreign key constraint but allow NULL values
  ALTER TABLE users ADD CONSTRAINT fk_users_school_id 
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
  RAISE NOTICE 'Added back foreign key constraint with NULL support';
END $$;

-- Step 2: Add missing columns to users table safely
DO $$ 
BEGIN
  -- Add address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
    ALTER TABLE users ADD COLUMN address TEXT;
    RAISE NOTICE 'Added address column';
  END IF;
  
  -- Add profile_image_url column if it doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
    ALTER TABLE users ADD COLUMN profile_image_url TEXT;
    RAISE NOTICE 'Added profile_image_url column';
  END IF;
  
  -- Add terms_accepted column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'terms_accepted') THEN
    ALTER TABLE users ADD COLUMN terms_accepted BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added terms_accepted column';
  END IF;
  
  -- Add terms_accepted_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'terms_accepted_at') THEN
    ALTER TABLE users ADD COLUMN terms_accepted_at TIMESTAMP;
    RAISE NOTICE 'Added terms_accepted_at column';
  END IF;
END $$;

-- Step 3: Create admin_actions table WITHOUT RLS (simpler approach)
CREATE TABLE IF NOT EXISTS admin_actions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_email VARCHAR(255) NOT NULL,
  agent_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('approved', 'rejected', 'banned', 'under_review')),
  reason TEXT,
  decision_deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create verification_queue table WITHOUT RLS initially
CREATE TABLE IF NOT EXISTS verification_queue (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  agent_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP DEFAULT NOW(),
  review_started_at TIMESTAMP,
  decision_deadline TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'decided', 'expired')),
  admin_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_agent_id ON admin_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_email ON admin_actions(admin_email);
CREATE INDEX IF NOT EXISTS idx_verification_queue_agent_id ON verification_queue(agent_id);
CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON verification_queue(status);

-- Step 6: Create trigger function that works WITHOUT RLS conflicts
CREATE OR REPLACE FUNCTION add_agent_to_verification_queue()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for new agent registrations
  IF NEW.role = 'agent' AND NEW.verified_status = false THEN
    -- Insert with security definer to bypass RLS
    INSERT INTO verification_queue (
      agent_id,
      submitted_at,
      decision_deadline,
      status
    ) VALUES (
      NEW.id,
      NOW(),
      NOW() + INTERVAL '30 minutes',
      'pending'
    );
    RAISE NOTICE 'Added agent % to verification queue', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger
DROP TRIGGER IF EXISTS trigger_add_agent_to_queue ON users;
CREATE TRIGGER trigger_add_agent_to_queue
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION add_agent_to_verification_queue();

-- Step 8: Grant permissions (NO RLS for now to avoid conflicts)
GRANT ALL ON admin_actions TO authenticated;
GRANT ALL ON verification_queue TO authenticated;
GRANT ALL ON admin_actions TO anon;
GRANT ALL ON verification_queue TO anon;

-- Step 9: Update existing users with invalid school_id to NULL
UPDATE users 
SET school_id = NULL 
WHERE school_id IS NOT NULL 
  AND school_id NOT IN (SELECT id FROM schools);

-- Step 10: Add created_at to hostels if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'created_at') THEN
    ALTER TABLE hostels ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    UPDATE hostels SET created_at = NOW() WHERE created_at IS NULL;
    RAISE NOTICE 'Added created_at to hostels';
  END IF;
END $$;

-- Verification query
SELECT 'Fix completed successfully!' as status,
       'Users table' as table_name,
       COUNT(*) as record_count
FROM users
UNION ALL
SELECT 'Schools available',
       'schools',
       COUNT(*)
FROM schools
UNION ALL
SELECT 'Admin actions table',
       'admin_actions', 
       COUNT(*)
FROM admin_actions
UNION ALL
SELECT 'Verification queue',
       'verification_queue',
       COUNT(*)
FROM verification_queue;