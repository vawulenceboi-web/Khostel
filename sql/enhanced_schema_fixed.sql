-- Enhanced K-H Schema with Admin System and Agent Verification (FIXED)
-- Run this AFTER the existing schema.sql to add new features safely

-- Add new columns to existing users table (safe migration)
DO $$ 
BEGIN
  -- Add address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
    ALTER TABLE users ADD COLUMN address TEXT;
  END IF;
  
  -- Add profile_image_url column if it doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
    ALTER TABLE users ADD COLUMN profile_image_url TEXT;
  END IF;
  
  -- Add terms_accepted column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'terms_accepted') THEN
    ALTER TABLE users ADD COLUMN terms_accepted BOOLEAN DEFAULT false;
  END IF;
  
  -- Add terms_accepted_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'terms_accepted_at') THEN
    ALTER TABLE users ADD COLUMN terms_accepted_at TIMESTAMP;
  END IF;
END $$;

-- Create admin_actions table with VARCHAR agent_id to match users.id type
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

-- Create verification_queue table with VARCHAR agent_id to match users.id type
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_agent_id ON admin_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_email ON admin_actions(admin_email);
CREATE INDEX IF NOT EXISTS idx_verification_queue_agent_id ON verification_queue(agent_id);
CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON verification_queue(status);
CREATE INDEX IF NOT EXISTS idx_verification_queue_deadline ON verification_queue(decision_deadline);

-- Add created_at to hostels for real-time timestamps if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hostels' AND column_name = 'created_at') THEN
    ALTER TABLE hostels ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    -- Update existing hostels with current timestamp
    UPDATE hostels SET created_at = NOW() WHERE created_at IS NULL;
  END IF;
END $$;

-- Create or update the single admin user (hardcoded credentials)
-- Password: AdminK-H2024! (plain text for now, will be hashed in app)
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  verified_status,
  terms_accepted,
  terms_accepted_at,
  created_at
) VALUES (
  'admin@k-h.com',
  '$2a$12$LQv3c1yqBwlVHpGRwuaukONu5gCmjIWYpSJqDNE8VZvIhkQBOgFoO', -- AdminK-H2024!
  'System',
  'Administrator', 
  'admin',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  verified_status = EXCLUDED.verified_status;

-- Function to auto-add agents to verification queue
CREATE OR REPLACE FUNCTION add_agent_to_verification_queue()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for new agent registrations
  IF NEW.role = 'agent' AND NEW.verified_status = false THEN
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-adding agents to verification queue
DROP TRIGGER IF EXISTS trigger_add_agent_to_queue ON users;
CREATE TRIGGER trigger_add_agent_to_queue
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION add_agent_to_verification_queue();

-- Function to auto-expire verification decisions after 30 minutes
CREATE OR REPLACE FUNCTION expire_verification_decisions()
RETURNS void AS $$
BEGIN
  UPDATE verification_queue 
  SET status = 'expired'
  WHERE status IN ('pending', 'under_review') 
    AND decision_deadline < NOW();
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies for new tables
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_queue ENABLE ROW LEVEL SECURITY;

-- RLS policy for admin_actions (only admins can access)
CREATE POLICY "Admins can manage admin_actions" ON admin_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = auth.jwt() ->> 'email' 
      AND users.role = 'admin'
    )
  );

-- RLS policy for verification_queue (admins and related agents can view)
CREATE POLICY "Admins can manage verification_queue" ON verification_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = auth.jwt() ->> 'email' 
      AND (users.role = 'admin' OR users.id = verification_queue.agent_id)
    )
  );

-- Grant necessary permissions
GRANT ALL ON admin_actions TO authenticated;
GRANT ALL ON verification_queue TO authenticated;

-- Create notification function for agents
CREATE OR REPLACE FUNCTION notify_agent_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update verification queue when user verification status changes
  IF OLD.verified_status != NEW.verified_status AND NEW.role = 'agent' THEN
    UPDATE verification_queue 
    SET status = 'decided', updated_at = NOW()
    WHERE agent_id = NEW.id AND status IN ('pending', 'under_review');
    
    -- Log admin action
    INSERT INTO admin_actions (
      admin_email,
      agent_id, 
      action_type,
      reason,
      created_at
    ) VALUES (
      COALESCE(current_setting('app.admin_email'), 'system'),
      NEW.id,
      CASE WHEN NEW.verified_status THEN 'approved' ELSE 'rejected' END,
      'Verification status updated',
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification status changes
DROP TRIGGER IF EXISTS trigger_notify_verification_status ON users;
CREATE TRIGGER trigger_notify_verification_status
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_agent_verification_status();

-- View for admin dashboard (easier queries) - using VARCHAR for agent_id
CREATE OR REPLACE VIEW admin_pending_agents AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.phone,
  u.address,
  u.business_reg_number as cac_number,
  u.profile_image_url,
  u.created_at as registered_at,
  u.created_at as submitted_at,
  (u.created_at + INTERVAL '30 minutes') as decision_deadline,
  'pending' as queue_status,
  EXTRACT(EPOCH FROM ((u.created_at + INTERVAL '30 minutes') - NOW()))/60 as minutes_remaining
FROM users u
WHERE u.role = 'agent' 
  AND u.verified_status = false
  AND (u.created_at + INTERVAL '30 minutes') > NOW()
ORDER BY u.created_at ASC;

-- Grant access to the view
GRANT SELECT ON admin_pending_agents TO authenticated;

-- Update existing hostels to have created_at if missing
UPDATE hostels SET created_at = NOW() WHERE created_at IS NULL;

COMMENT ON TABLE admin_actions IS 'Tracks all admin verification decisions and actions';
COMMENT ON TABLE verification_queue IS 'Manages 30-minute decision window for agent verification';
COMMENT ON VIEW admin_pending_agents IS 'Easy view for admin dashboard showing pending agent verifications';