export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This endpoint helps migrate users created before email confirmation was disabled
export async function POST(request: NextRequest) {
  console.log('🔄 USER MIGRATION: ===== MIGRATION STARTED =====')
  console.log('🔄 USER MIGRATION: Timestamp:', new Date().toISOString())
  
  try {
    // Simple admin check - you can enhance this
    const { adminKey } = await request.json()
    
    if (adminKey !== 'migrate-users-2024') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 USER MIGRATION: Getting unconfirmed users...')
    
    // Get all unconfirmed users (this might need service role key)
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ USER MIGRATION ERROR: Failed to list users:', listError)
      return NextResponse.json(
        { success: false, message: 'Failed to access users', error: listError.message },
        { status: 500 }
      )
    }

    console.log('🔄 USER MIGRATION: Found', users.users.length, 'total users')
    
    // Find unconfirmed users
    const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at)
    console.log('🔄 USER MIGRATION: Found', unconfirmedUsers.length, 'unconfirmed users')
    
    if (unconfirmedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users need migration',
        confirmed: 0,
        total: users.users.length
      })
    }

    let confirmCount = 0
    const results = []

    // Confirm each user
    for (const user of unconfirmedUsers) {
      try {
        console.log('🔄 USER MIGRATION: Confirming user:', user.email)
        
        const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true
        })

        if (confirmError) {
          console.error('❌ USER MIGRATION ERROR: Failed to confirm', user.email, confirmError)
          results.push({ email: user.email, success: false, error: confirmError.message })
        } else {
          console.log('✅ USER MIGRATION SUCCESS: Confirmed', user.email)
          confirmCount++
          results.push({ email: user.email, success: true })
        }
      } catch (error) {
        console.error('❌ USER MIGRATION EXCEPTION for', user.email, error)
        results.push({ email: user.email, success: false, error: (error as Error).message })
      }
    }

    console.log('✅ USER MIGRATION COMPLETED:', confirmCount, 'users confirmed')

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${confirmCount} users confirmed.`,
      confirmed: confirmCount,
      total: unconfirmedUsers.length,
      results: results
    })

  } catch (error) {
    console.error('❌ USER MIGRATION EXCEPTION:', error)
    return NextResponse.json(
      { success: false, message: 'Migration failed', error: (error as Error).message },
      { status: 500 }
    )
  } finally {
    console.log('🔄 USER MIGRATION: ===== MIGRATION COMPLETED =====')
  }
}