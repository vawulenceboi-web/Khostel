-- Migration Script: Sync Custom Users Table to Supabase Auth
-- This script creates users in auth.users table for each user in public.users table

-- STEP 1: Check current state
SELECT 
  'Custom Table (public.users)' as table_name,
  COUNT(*) as user_count,
  array_agg(DISTINCT role) as roles,
  MIN(created_at) as oldest_user,
  MAX(created_at) as newest_user
FROM public.users
WHERE email IS NOT NULL

UNION ALL

SELECT 
  'Supabase Auth (auth.users)' as table_name,
  COUNT(*) as user_count,
  array_agg(DISTINCT (raw_user_meta_data->>'role')) as roles,
  MIN(created_at) as oldest_user,
  MAX(created_at) as newest_user
FROM auth.users
WHERE email IS NOT NULL;

-- STEP 2: Show users that would be migrated
SELECT 
  u.id as custom_id,
  u.email,
  u.role,
  u.verified_status,
  u.created_at,
  CASE 
    WHEN au.email IS NOT NULL THEN 'Already in Supabase Auth'
    ELSE 'Needs Migration'
  END as status
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
ORDER BY u.created_at DESC;

-- STEP 3: Migration function (run this after reviewing above results)
-- Uncomment and run this block to perform actual migration:

/*
DO $$
DECLARE
    user_record RECORD;
    new_user_id UUID;
    instance_uuid UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Get the instance ID (or use default)
    SELECT id INTO instance_uuid FROM auth.instances LIMIT 1;
    IF instance_uuid IS NULL THEN
        instance_uuid := '00000000-0000-0000-0000-000000000000';
    END IF;
    
    RAISE NOTICE 'Starting migration with instance_id: %', instance_uuid;
    
    -- Loop through users in custom table that don't exist in auth.users
    FOR user_record IN 
        SELECT u.* 
        FROM public.users u
        LEFT JOIN auth.users au ON u.email = au.email
        WHERE au.email IS NULL  -- Only migrate users not already in auth.users
        ORDER BY u.created_at
    LOOP
        BEGIN
            -- Generate new UUID for auth.users (or use existing if valid UUID)
            BEGIN
                new_user_id := user_record.id::UUID;
            EXCEPTION WHEN OTHERS THEN
                new_user_id := gen_random_uuid();
            END;
            
            RAISE NOTICE 'Migrating user: % (% -> %)', user_record.email, user_record.id, new_user_id;
            
            -- Insert into auth.users
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                created_at,
                updated_at,
                raw_user_meta_data,
                raw_app_meta_data,
                is_super_admin,
                confirmed_at
            ) VALUES (
                instance_uuid,
                new_user_id,
                'authenticated',
                'authenticated',
                user_record.email,
                crypt('temp-password-' || user_record.id, gen_salt('bf')), -- Temporary password
                COALESCE(user_record.created_at, NOW()), -- Auto-confirm
                COALESCE(user_record.created_at, NOW()),
                NOW(),
                jsonb_build_object(
                    'first_name', user_record.first_name,
                    'last_name', user_record.last_name,
                    'phone', user_record.phone,
                    'role', user_record.role,
                    'school_id', user_record.school_id,
                    'business_reg_number', user_record.business_reg_number,
                    'address', user_record.address,
                    'profile_image_url', user_record.profile_image_url,
                    'face_photo_url', user_record.face_photo_url,
                    'verified_status', user_record.verified_status,
                    'terms_accepted', user_record.terms_accepted,
                    'migrated_from_custom', true
                ),
                jsonb_build_object(),
                false,
                COALESCE(user_record.created_at, NOW())
            );
            
            -- Update custom table with new auth ID and mark as migrated
            UPDATE public.users 
            SET 
                id = new_user_id::text,
                email_verified = true,
                updated_at = NOW()
            WHERE email = user_record.email;
            
            RAISE NOTICE 'Successfully migrated: %', user_record.email;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to migrate %: %', user_record.email, SQLERRM;
            CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'Migration completed!';
END $$;
*/

-- STEP 4: Verify migration results
-- Run this after migration to check results:
/*
SELECT 
  'Migration Results' as summary,
  COUNT(DISTINCT u.email) as users_in_custom_table,
  COUNT(DISTINCT au.email) as users_in_supabase_auth,
  COUNT(CASE WHEN u.email = au.email THEN 1 END) as users_in_both_tables
FROM public.users u
FULL OUTER JOIN auth.users au ON u.email = au.email;
*/