-- Safe fix for school foreign key constraint error
-- This will make school_id optional and fix the registration issue

-- Step 1: Make school_id nullable (safe operation)
DO $$ 
BEGIN
  -- Check if school_id column exists and modify constraint
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'school_id') THEN
    -- Drop the foreign key constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_users_school_id') THEN
      ALTER TABLE users DROP CONSTRAINT fk_users_school_id;
      RAISE NOTICE 'Dropped foreign key constraint fk_users_school_id';
    END IF;
    
    -- Make school_id nullable
    ALTER TABLE users ALTER COLUMN school_id DROP NOT NULL;
    RAISE NOTICE 'Made school_id nullable';
    
    -- Add back foreign key constraint but allow NULL values
    ALTER TABLE users ADD CONSTRAINT fk_users_school_id 
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added back foreign key constraint with NULL support';
  END IF;
END $$;

-- Step 2: Ensure we have some schools in the database
INSERT INTO schools (id, name, city, state) VALUES 
  ('school_unilag', 'University of Lagos', 'Lagos', 'Lagos'),
  ('school_ui', 'University of Ibadan', 'Ibadan', 'Oyo'),
  ('school_abu', 'Ahmadu Bello University', 'Zaria', 'Kaduna'),
  ('school_uniben', 'University of Benin', 'Benin City', 'Edo'),
  ('school_unn', 'University of Nigeria Nsukka', 'Nsukka', 'Enugu'),
  ('school_oau', 'Obafemi Awolowo University', 'Ile-Ife', 'Osun'),
  ('school_futa', 'Federal University of Technology Akure', 'Akure', 'Ondo'),
  ('school_covenant', 'Covenant University', 'Ota', 'Ogun'),
  ('school_babcock', 'Babcock University', 'Ilishan-Remo', 'Ogun'),
  ('school_lasu', 'Lagos State University', 'Lagos', 'Lagos'),
  ('school_eksu', 'Ekiti State University', 'Ado-Ekiti', 'Ekiti'),
  ('school_funaab', 'Federal University of Agriculture Abeokuta', 'Abeokuta', 'Ogun')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update any existing users with invalid school_id to NULL
UPDATE users 
SET school_id = NULL 
WHERE school_id IS NOT NULL 
  AND school_id NOT IN (SELECT id FROM schools);

-- Step 4: Add some locations for the schools
INSERT INTO locations (school_id, name, latitude, longitude) VALUES
  ('school_unilag', 'Akoka', 6.5158, 3.3898),
  ('school_unilag', 'Yaba', 6.5075, 3.3712),
  ('school_ui', 'Bodija', 7.4347, 3.9159),
  ('school_ui', 'Sango', 7.4539, 3.9470),
  ('school_abu', 'Samaru', 11.1667, 7.6833),
  ('school_uniben', 'Ugbowo', 6.4003, 5.6037),
  ('school_unn', 'University Town', 6.8747, 7.4037),
  ('school_oau', 'Ile-Ife', 7.4905, 4.5521)
ON CONFLICT DO NOTHING;

-- Verify the fix
SELECT 'Schools count:' as info, COUNT(*) as count FROM schools
UNION ALL
SELECT 'Users with valid school_id:' as info, COUNT(*) as count FROM users WHERE school_id IS NOT NULL
UNION ALL  
SELECT 'Users with NULL school_id:' as info, COUNT(*) as count FROM users WHERE school_id IS NULL;