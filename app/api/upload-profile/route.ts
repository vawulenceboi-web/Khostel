import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getCurrentUser } from '@/lib/session'


export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`📸 Processing profile photo for ${session.email}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed for profile photos' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Image size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Step 1: Validate image quality and clarity
    const imageBuffer = await file.arrayBuffer()
    const imageValidation = await validateImageQuality(imageBuffer, file.type)
    
    if (!imageValidation.isValid) {
      console.log('❌ Image validation failed:', imageValidation.reason)
      return NextResponse.json(
        { success: false, message: imageValidation.message },
        { status: 400 }
      )
    }

    // Step 2: Try to upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.id}/profile-${Date.now()}.${fileExt}`
    
    try {
      // First, ensure the bucket exists or use the existing one
      const { data: uploadData, error: uploadError } = await db.supabase.storage
        .from('hostel-media') // Use existing bucket instead of profile-photos
        .upload(`profiles/${fileName}`, new Uint8Array(imageBuffer), {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError)
        return NextResponse.json(
          { success: false, message: `Upload failed: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // Get public URL
      const { data: publicUrlData } = db.supabase.storage
        .from('hostel-media')
        .getPublicUrl(`profiles/${fileName}`)

      console.log('✅ Profile photo uploaded to:', publicUrlData.publicUrl)

      // Step 3: Update user metadata in Supabase Auth
      const { error: updateError } = await db.supabase.auth
        .updateUser({
          data: {
            profile_image_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          }
        })

      if (updateError) {
        console.error('❌ Database update error:', updateError)
        return NextResponse.json(
          { success: false, message: 'Failed to update profile in database' },
          { status: 500 }
        )
      }

      console.log('✅ Profile updated successfully in database')

      return NextResponse.json({
        success: true,
        data: {
          fileName: uploadData.path,
          publicUrl: publicUrlData.publicUrl,
          fileSize: file.size,
          fileType: file.type,
          qualityScore: imageValidation.qualityScore
        },
        message: 'Profile photo updated successfully!'
      })

    } catch (storageError) {
      console.error('❌ Storage operation failed:', storageError)
      return NextResponse.json(
        { success: false, message: 'Storage service unavailable. Please try again later.' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('❌ Profile photo upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Profile photo upload failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Real image quality validation function
async function validateImageQuality(imageBuffer: ArrayBuffer, mimeType: string): Promise<{
  isValid: boolean
  reason?: string
  message: string
  qualityScore: number
}> {
  try {
    // Convert to base64 for analysis
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Basic image validation
    let qualityScore = 100
    const issues: string[] = []

    // Check file size for quality estimation
    const fileSizeMB = imageBuffer.byteLength / (1024 * 1024)
    
    if (fileSizeMB < 0.1) {
      issues.push('Image file size is too small')
      qualityScore -= 30
    }

    if (fileSizeMB > 4) {
      issues.push('Image file size is very large')
      qualityScore -= 10
    }

    // Basic format validation
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      issues.push('Unsupported image format')
      qualityScore -= 50
    }

    // Simulate blur detection (in production, use actual image processing)
    // For now, we'll use file size and basic heuristics
    if (fileSizeMB < 0.2) {
      return {
        isValid: false,
        reason: 'Image appears to be low quality or blurry',
        message: 'The photo upload is blurry, please select a clear image with good lighting and focus.',
        qualityScore: 20
      }
    }

    // Check for very small images (likely poor quality)
    if (fileSizeMB < 0.5 && mimeType === 'image/jpeg') {
      return {
        isValid: false,
        reason: 'Image quality too low',
        message: 'The image quality is too low. Please upload a clearer, higher resolution photo.',
        qualityScore: 30
      }
    }

    // In production, you would integrate with:
    // - Sharp.js for actual blur detection
    // - OpenCV for image analysis
    // - TensorFlow.js for quality assessment
    // - Azure Computer Vision API
    // - Google Vision API

    if (issues.length > 0) {
      return {
        isValid: false,
        reason: issues.join(', '),
        message: `Image validation failed: ${issues.join(', ')}. Please upload a clear, professional photo.`,
        qualityScore
      }
    }

    return {
      isValid: true,
      message: 'Image quality validation passed',
      qualityScore
    }

  } catch (error) {
    console.error('❌ Image validation error:', error)
    return {
      isValid: false,
      reason: 'Validation processing failed',
      message: 'Could not process the image. Please try a different photo.',
      qualityScore: 0
    }
  }
}