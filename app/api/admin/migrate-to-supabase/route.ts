export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('🔄 MIGRATION: ===== MIGRATING USERS TO SUPABASE AUTH =====')
  
  try {
    const { adminKey, dryRun = true } = await request.json()
    
    if (adminKey !== 'migrate-to-supabase-2024') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 MIGRATION: Dry run mode:', dryRun)

    // Get all users from custom table
    console.log('🔄 MIGRATION: Fetching users from custom table...')
    const { data: customUsers, error: fetchError } = await db.supabase
      .from('users')
      .select('*')

    if (fetchError) {
      console.error('❌ MIGRATION ERROR: Failed to fetch custom users:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch users', error: fetchError.message },
        { status: 500 }
      )
    }

    console.log('🔄 MIGRATION: Found', customUsers?.length || 0, 'users in custom table')

    if (!customUsers || customUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in custom table',
        migrated: 0
      })
    }

    const results = []
    let migratedCount = 0

    for (const user of customUsers) {
      try {
        console.log('🔄 MIGRATION: Processing user:', user.email)

        if (dryRun) {
          console.log('🔄 MIGRATION: [DRY RUN] Would migrate:', user.email)
          results.push({
            email: user.email,
            action: 'would_migrate',
            success: true
          })
          continue
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await db.supabase.auth.admin.createUser({
          email: user.email,
          password: 'temp-password-' + Math.random().toString(36), // They'll need to reset
          email_confirm: true, // Auto-confirm since they're migrated
          user_metadata: {
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            school_id: user.school_id,
            business_reg_number: user.business_reg_number,
            address: user.address,
            profile_image_url: user.profile_image_url,
            verified_status: user.verified_status,
            terms_accepted: user.terms_accepted,
            terms_accepted_at: user.terms_accepted_at,
            migrated_from_custom_table: true,
            original_created_at: user.created_at
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log('ℹ️ MIGRATION: User already exists in Supabase Auth:', user.email)
            results.push({
              email: user.email,
              action: 'already_exists',
              success: true
            })
          } else {
            console.error('❌ MIGRATION ERROR for', user.email, ':', authError)
            results.push({
              email: user.email,
              action: 'failed',
              success: false,
              error: authError.message
            })
          }
        } else {
          console.log('✅ MIGRATION SUCCESS:', user.email)
          migratedCount++
          results.push({
            email: user.email,
            action: 'migrated',
            success: true,
            newUserId: authData.user?.id
          })
        }

      } catch (error) {
        console.error('❌ MIGRATION EXCEPTION for', user.email, ':', error)
        results.push({
          email: user.email,
          action: 'exception',
          success: false,
          error: (error as Error).message
        })
      }
    }

    console.log('🔄 MIGRATION: Migration completed')
    console.log('✅ MIGRATION: Successfully migrated:', migratedCount, 'users')

    return NextResponse.json({
      success: true,
      message: dryRun 
        ? `Dry run completed. ${customUsers.length} users would be migrated.`
        : `Migration completed. ${migratedCount} users migrated successfully.`,
      totalUsers: customUsers.length,
      migrated: migratedCount,
      dryRun,
      results
    })

  } catch (error) {
    console.error('❌ MIGRATION EXCEPTION:', error)
    return NextResponse.json(
      { success: false, message: 'Migration failed', error: (error as Error).message },
      { status: 500 }
    )
  }
}