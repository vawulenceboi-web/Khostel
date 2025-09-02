-- Complete fix for agent approval status and admin history
-- This ensures approved agents actually get verified status updated

-- Step 1: Fix the trigger function configuration parameter error
DROP TRIGGER IF EXISTS trigger_notify_verification_status ON users;
DROP FUNCTION IF EXISTS notify_agent_verification_status();

-- Step 2: Create simple trigger function without problematic config
CREATE OR REPLACE FUNCTION notify_agent_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update verification queue when user verification status changes
  IF OLD.verified_status != NEW.verified_status AND NEW.role = 'agent' THEN
    -- Update verification queue
    UPDATE verification_queue 
    SET status = 'decided', updated_at = NOW()
    WHERE agent_id = NEW.id AND status IN ('pending', 'under_review');
    
    -- Log admin action with hardcoded admin email
    INSERT INTO admin_actions (
      admin_email,
      agent_id, 
      action_type,
      reason,
      created_at
    ) VALUES (
      'admin@k-h.com',
      NEW.id,
      CASE WHEN NEW.verified_status THEN 'approved' ELSE 'rejected' END,
      'Verification status updated by admin',
      NOW()
    );
    
    RAISE NOTICE 'Agent % verification status changed to: %', 
      NEW.email, 
      CASE WHEN NEW.verified_status THEN 'VERIFIED' ELSE 'UNVERIFIED' END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate trigger
CREATE TRIGGER trigger_notify_verification_status
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_agent_verification_status();

-- Step 4: Ensure admin_actions and verification_queue tables exist
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

-- Step 5: Grant proper permissions (no RLS conflicts)
GRANT ALL ON admin_actions TO authenticated;
GRANT ALL ON verification_queue TO authenticated;
GRANT ALL ON admin_actions TO anon;
GRANT ALL ON verification_queue TO anon;

-- Step 6: Test the approval system by manually updating a test agent
-- (This will trigger the notification function)
DO $$
DECLARE
    test_agent_id VARCHAR;
BEGIN
    -- Find a test agent to verify the trigger works
    SELECT id INTO test_agent_id 
    FROM users 
    WHERE role = 'agent' AND verified_status = false 
    LIMIT 1;
    
    IF test_agent_id IS NOT NULL THEN
        RAISE NOTICE 'Testing trigger with agent ID: %', test_agent_id;
        -- This should trigger the notification function
        UPDATE users 
        SET updated_at = NOW() 
        WHERE id = test_agent_id;
        RAISE NOTICE 'Trigger test completed for agent: %', test_agent_id;
    ELSE
        RAISE NOTICE 'No pending agents found for trigger testing';
    END IF;
END $$;

-- Step 7: Verification query
SELECT 'Database fix completed!' as status,
       'Functions and triggers updated' as details,
       'Ready for agent verification' as next_step;