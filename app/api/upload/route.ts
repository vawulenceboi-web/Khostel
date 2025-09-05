import { NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/lib/session'

import { supabase } from '@/lib/db'


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as string // 'face-verification' or 'hostel-media'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = {
      'face-verification': ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
      'hostel-media': ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/mov']
    }

    const allowedMimeTypes = allowedTypes[uploadType as keyof typeof allowedTypes]
    if (!allowedMimeTypes?.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = uploadType === 'face-verification' ? 10 * 1024 * 1024 : 50 * 1024 * 1024 // 10MB or 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: `File size must be less than ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    console.log(`📁 Uploading ${uploadType} file:`, file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Create unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}/${uploadType}-${Date.now()}.${fileExt}`
    
    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(uploadType)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError)
      return NextResponse.json(
        { success: false, message: 'File upload failed' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(uploadType)
      .getPublicUrl(fileName)

    console.log('✅ File uploaded successfully:', publicUrlData.publicUrl)

    // Store file metadata in database
    if (uploadType === 'hostel-media') {
      // Will be linked to hostel when hostel is created
      console.log('📊 Hostel media uploaded, will be linked during hostel creation')
    } else if (uploadType === 'face-verification') {
      // Store in face verification history
      const { error: historyError } = await supabase
        .from('face_verification_history')
        .insert({
          user_id: session.user.id,
          face_photo_url: publicUrlData.publicUrl,
          verification_status: 'pending',
          submitted_at: new Date().toISOString()
        })

      if (historyError) {
        console.warn('⚠️ Could not save to verification history:', historyError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        fileName: uploadData.path,
        publicUrl: publicUrlData.publicUrl,
        fileSize: file.size,
        fileType: file.type,
        uploadType
      },
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    )
  }
}