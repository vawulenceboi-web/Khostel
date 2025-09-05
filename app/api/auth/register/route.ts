import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import { registerUserSchema } from '@/lib/schema'

export const runtime = 'nodejs'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Request body received:', { ...body, password: '[HIDDEN]' })
    
    // Validate input
    const validatedData = registerUserSchema.parse(body)
    console.log('✅ Input validation passed')

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName || null,
          phone: validatedData.phone || null,
          role: validatedData.role,
          school_id: validatedData.schoolId || null,
          business_reg_number: validatedData.businessRegNumber || null,
          address: validatedData.address || null,
          profile_image_url: validatedData.profileImageUrl || null,
          terms_accepted: validatedData.termsAccepted,
          terms_accepted_at: new Date().toISOString(),
          verified_status: validatedData.role === 'agent' ? false : true,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('❌ Registration error:', error.message)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    console.log('✅ User registered successfully')
    
    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Registration successful! Please check your email to verify your account before signing in.'
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('❌ Registration error:', error)
    
    if (error instanceof Error) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid input data',
            details: (error as any).issues
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}