export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('🔍 USER CHECK: ===== CHECKING DUAL AUTH SYSTEMS =====')
  
  try {
    const { email, adminKey } = await request.json()
    
    if (adminKey !== 'check-dual-auth-2024') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 USER CHECK: Checking email:', email)

    // Check 1: Custom users table (old system)
    console.log('🔍 USER CHECK: Checking custom users table...')
    const customUser = await db.users.findByEmail(email)
    console.log('🔍 USER CHECK: Custom table result:', customUser)

    // Check 2: Supabase Auth users (new system)
    console.log('🔍 USER CHECK: Checking Supabase Auth users...')
    const { data: authUsers, error } = await db.supabase.auth.admin.listUsers()
    const supabaseUser = authUsers?.users.find(u => u.email === email)
    console.log('🔍 USER CHECK: Supabase Auth result:', !!supabaseUser)
    
    if (supabaseUser) {
      console.log('🔍 USER CHECK: Supabase user details:', {
        id: supabaseUser.id,
        email: supabaseUser.email,
        email_confirmed_at: supabaseUser.email_confirmed_at,
        created_at: supabaseUser.created_at,
        user_metadata: supabaseUser.user_metadata
      })
    }

    // Check 3: Count total users in both systems
    const { data: allCustomUsers, error: customError } = await db.supabase
      .from('users')
      .select('id, email, role, verified_status, created_at')
      .limit(10)

    console.log('🔍 USER CHECK: Custom table users count:', allCustomUsers?.length || 0)
    console.log('🔍 USER CHECK: Supabase Auth users count:', authUsers?.users.length || 0)

    return NextResponse.json({
      success: true,
      data: {
        email,
        customUser: {
          exists: !!customUser,
          data: customUser
        },
        supabaseUser: {
          exists: !!supabaseUser,
          data: supabaseUser ? {
            id: supabaseUser.id,
            email: supabaseUser.email,
            email_confirmed_at: supabaseUser.email_confirmed_at,
            user_metadata: supabaseUser.user_metadata
          } : null
        },
        summary: {
          totalCustomUsers: allCustomUsers?.length || 0,
          totalSupabaseUsers: authUsers?.users.length || 0,
          userExistsInCustomTable: !!customUser,
          userExistsInSupabaseAuth: !!supabaseUser,
          authSystemUsed: customUser && !supabaseUser ? 'custom' : 
                          !customUser && supabaseUser ? 'supabase' : 
                          customUser && supabaseUser ? 'both' : 'none'
        }
      }
    })

  } catch (error) {
    console.error('❌ USER CHECK ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Check failed', error: (error as Error).message },
      { status: 500 }
    )
  }
}