export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  console.log('🔄 SYNC USERS: ===== SYNCING EXISTING USERS TO SUPABASE AUTH =====')
  
  try {
    const { adminKey, dryRun = true } = await request.json()
    
    if (adminKey !== 'sync-existing-users-2024') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 SYNC USERS: Dry run mode:', dryRun)

    // Get all users from custom table
    console.log('🔄 SYNC USERS: Fetching users from custom table...')
    const { data: customUsers, error: fetchError } = await db.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('❌ SYNC USERS ERROR: Failed to fetch custom users:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch users', error: fetchError.message },
        { status: 500 }
      )
    }

    console.log('🔄 SYNC USERS: Found', customUsers?.length || 0, 'users in custom table')

    if (!customUsers || customUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in custom table',
        synced: 0
      })
    }

    const results = []
    let syncedCount = 0

    for (const user of customUsers) {
      try {
        console.log('🔄 SYNC USERS: Processing user:', user.email)

        if (dryRun) {
          console.log('🔄 SYNC USERS: [DRY RUN] Would sync:', user.email)
          results.push({
            email: user.email,
            customId: user.id,
            role: user.role,
            action: 'would_sync',
            success: true
          })
          continue
        }

        // Create user in Supabase Auth with same ID
        console.log('🔄 SYNC USERS: Creating in Supabase Auth:', user.email)
        const { data: authData, error: authError } = await db.supabase.auth.admin.createUser({
          email: user.email,
          password: 'temp-password-' + Math.random().toString(36).substring(2), // They'll use forgot password
          email_confirm: true, // Auto-confirm migrated users
          user_metadata: {
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            school_id: user.school_id,
            business_reg_number: user.business_reg_number,
            address: user.address,
            profile_image_url: user.profile_image_url,
            face_photo_url: user.face_photo_url,
            verified_status: user.verified_status,
            terms_accepted: user.terms_accepted,
            terms_accepted_at: user.terms_accepted_at,
            migrated_from_custom: true,
            original_custom_id: user.id,
            migration_date: new Date().toISOString()
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log('ℹ️ SYNC USERS: User already exists in Supabase Auth:', user.email)
            results.push({
              email: user.email,
              customId: user.id,
              role: user.role,
              action: 'already_exists_in_supabase',
              success: true
            })
          } else {
            console.error('❌ SYNC USERS ERROR for', user.email, ':', authError)
            results.push({
              email: user.email,
              customId: user.id,
              role: user.role,
              action: 'failed_to_create_in_supabase',
              success: false,
              error: authError.message
            })
          }
        } else {
          console.log('✅ SYNC USERS SUCCESS: Created in Supabase Auth:', user.email)
          
          // Update the custom table to link to the new Supabase Auth ID
          const { error: updateError } = await db.supabase
            .from('users')
            .update({
              id: authData.user.id, // Update to match Supabase Auth ID
              email_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('email', user.email)

          if (updateError) {
            console.error('❌ SYNC USERS ERROR: Failed to update custom table ID:', updateError)
          } else {
            console.log('✅ SYNC USERS SUCCESS: Updated custom table with Supabase Auth ID')
          }

          syncedCount++
          results.push({
            email: user.email,
            oldCustomId: user.id,
            newSupabaseId: authData.user.id,
            role: user.role,
            action: 'synced_successfully',
            success: true
          })
        }

      } catch (error) {
        console.error('❌ SYNC USERS EXCEPTION for', user.email, ':', error)
        results.push({
          email: user.email,
          customId: user.id,
          role: user.role,
          action: 'exception',
          success: false,
          error: (error as Error).message
        })
      }
    }

    console.log('🔄 SYNC USERS: Sync completed')
    console.log('✅ SYNC USERS: Successfully synced:', syncedCount, 'users')

    return NextResponse.json({
      success: true,
      message: dryRun 
        ? `Dry run completed. ${customUsers.length} users would be synced.`
        : `Sync completed. ${syncedCount} users synced successfully.`,
      totalCustomUsers: customUsers.length,
      synced: syncedCount,
      dryRun,
      results
    })

  } catch (error) {
    console.error('❌ SYNC USERS EXCEPTION:', error)
    return NextResponse.json(
      { success: false, message: 'Sync failed', error: (error as Error).message },
      { status: 500 }
    )
  }
}