-- Fix for trigger function configuration parameter error
-- This removes the problematic app.admin_email reference

-- Step 1: Drop existing problematic trigger and function
DROP TRIGGER IF EXISTS trigger_notify_verification_status ON users;
DROP FUNCTION IF EXISTS notify_agent_verification_status();

-- Step 2: Create corrected notification function WITHOUT app.admin_email
CREATE OR REPLACE FUNCTION notify_agent_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update verification queue when user verification status changes
  IF OLD.verified_status != NEW.verified_status AND NEW.role = 'agent' THEN
    UPDATE verification_queue 
    SET status = 'decided', updated_at = NOW()
    WHERE agent_id = NEW.id AND status IN ('pending', 'under_review');
    
    -- Log admin action WITHOUT the problematic configuration parameter
    INSERT INTO admin_actions (
      admin_email,
      agent_id, 
      action_type,
      reason,
      created_at
    ) VALUES (
      'admin@k-h.com', -- Use hardcoded admin email instead
      NEW.id,
      CASE WHEN NEW.verified_status THEN 'approved' ELSE 'rejected' END,
      'Verification status updated',
      NOW()
    );
    
    RAISE NOTICE 'Agent verification status updated: % for %', 
      CASE WHEN NEW.verified_status THEN 'approved' ELSE 'rejected' END,
      NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate trigger
CREATE TRIGGER trigger_notify_verification_status
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_agent_verification_status();

-- Step 4: Also fix the add_agent_to_verification_queue function if it has the same issue
CREATE OR REPLACE FUNCTION add_agent_to_verification_queue()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for new agent registrations
  IF NEW.role = 'agent' AND NEW.verified_status = false THEN
    INSERT INTO verification_queue (
      agent_id,
      submitted_at,
      decision_deadline,
      status,
      admin_email
    ) VALUES (
      NEW.id,
      NOW(),
      NOW() + INTERVAL '30 minutes',
      'pending',
      NULL -- Will be set when admin starts review
    );
    
    RAISE NOTICE 'Added agent % to verification queue with 30-minute deadline', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Ensure trigger exists
DROP TRIGGER IF EXISTS trigger_add_agent_to_queue ON users;
CREATE TRIGGER trigger_add_agent_to_queue
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION add_agent_to_verification_queue();

-- Step 6: Test the fix by checking functions
SELECT 'Trigger functions updated successfully!' as status,
       proname as function_name,
       prosecdef as security_definer
FROM pg_proc 
WHERE proname IN ('add_agent_to_verification_queue', 'notify_agent_verification_status');

-- Step 7: Verify tables exist and are accessible
SELECT 'Table check:' as info, 
       table_name, 
       CASE WHEN table_name IN (
         SELECT tablename FROM pg_tables WHERE schemaname = 'public'
       ) THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (VALUES 
  ('users'),
  ('admin_actions'), 
  ('verification_queue')
) AS t(table_name);