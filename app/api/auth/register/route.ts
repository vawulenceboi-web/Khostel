import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerUserSchema } from '@/lib/schema'

export async function POST(request: NextRequest) {
  console.log('🔍 Registration API called')
  
  try {
    // Check environment variables first
    if (!process.env.SUPABASE_URL) {
      console.error('❌ SUPABASE_URL not set')
      return NextResponse.json(
        { success: false, message: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    if (!process.env.SUPABASE_ANON_KEY) {
      console.error('❌ SUPABASE_ANON_KEY not set')
      return NextResponse.json(
        { success: false, message: 'Supabase anon key missing' },
        { status: 500 }
      )
    }

    console.log('✅ Environment variables check passed')

    const body = await request.json()
    console.log('📝 Request body received:', { ...body, password: '[HIDDEN]' })
    
    // Validate input
    const validatedData = registerUserSchema.parse(body)
    console.log('✅ Input validation passed')
    
    console.log('✅ Using Supabase client for database operations')
    
    // Check if user already exists
    console.log('🔍 Checking if user exists...')
    const existingUser = await db.users.findByEmail(validatedData.email)
    
    if (existingUser) {
      console.log('❌ User already exists:', validatedData.email)
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    console.log('✅ Email is available')

    // Hash password
    console.log('🔐 Hashing password...')
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds)
    console.log('✅ Password hashed')

    // Create user
    console.log('👤 Creating user in database...')
    const newUser = await db.users.create({
      email: validatedData.email,
      password_hash: passwordHash,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      phone: validatedData.phone,
      role: validatedData.role,
      school_id: validatedData.schoolId,
      business_reg_number: validatedData.businessRegNumber,
      verified_status: validatedData.role === 'agent' ? false : true, // Agents need verification
    })

    console.log('✅ User created successfully:', newUser.email)

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Registration successful'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Registration error details:', error)
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      console.error('❌ Validation error:', error.issues)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data',
          details: error.issues 
        },
        { status: 400 }
      )
    }

    // Handle database connection errors
    if (error.message?.includes('connect') || error.message?.includes('ENOTFOUND')) {
      console.error('❌ Database connection error')
      return NextResponse.json(
        { success: false, message: 'Database connection failed. Please check your DATABASE_URL.' },
        { status: 500 }
      )
    }

    // Handle database constraint errors
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      console.error('❌ Duplicate email error')
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      )
    }

    // Handle missing table errors
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.error('❌ Database tables not found - SQL schema may not have been run')
      return NextResponse.json(
        { success: false, message: 'Database tables not found. Please run the SQL schema in Supabase first.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}