import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (only images for profile photos)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed for profile photos' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit for profile photos)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Image size must be less than 5MB' },
        { status: 400 }
      )
    }

    console.log(`📸 Uploading profile photo for user:`, session.user.email, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Create unique file path for profile photos
    const fileExt = file.name.split('.').pop()
    const fileName = `profiles/${session.user.id}/profile-${Date.now()}.${fileExt}`
    
    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage (profile-photos bucket)
    const { data: uploadData, error: uploadError } = await db.supabase.storage
      .from('profile-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true // Allow overwriting existing profile photos
      })

    if (uploadError) {
      console.error('❌ Profile photo upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'Profile photo upload failed' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicUrlData } = db.supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName)

    console.log('✅ Profile photo uploaded successfully:', publicUrlData.publicUrl)

    // Update user profile in database
    const { error: updateError } = await db.supabase
      .from('users')
      .update({
        profile_image_url: publicUrlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('✅ User profile updated with new photo')

    return NextResponse.json({
      success: true,
      data: {
        fileName: uploadData.path,
        publicUrl: publicUrlData.publicUrl,
        fileSize: file.size,
        fileType: file.type
      },
      message: 'Profile photo updated successfully!'
    })

  } catch (error) {
    console.error('❌ Profile photo upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Profile photo upload failed' },
      { status: 500 }
    )
  }
}