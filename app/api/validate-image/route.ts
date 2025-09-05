export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

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

    const { imageData, fileName } = await request.json()

    if (!imageData) {
      return NextResponse.json(
        { success: false, message: 'No image data provided' },
        { status: 400 }
      )
    }

    console.log('🔍 Validating image quality for:', fileName)

    // Real image quality validation
    const validation = await performImageQualityCheck(imageData, fileName)

    if (!validation.isValid) {
      console.log('❌ Image validation failed:', validation.reason)
      return NextResponse.json({
        success: false,
        message: validation.message,
        data: {
          qualityScore: validation.qualityScore,
          issues: validation.issues
        }
      })
    }

    console.log('✅ Image validation passed with score:', validation.qualityScore)

    return NextResponse.json({
      success: true,
      data: {
        qualityScore: validation.qualityScore,
        message: validation.message
      },
      message: 'Image quality validation passed'
    })

  } catch (error) {
    console.error('❌ Image validation error:', error)
    return NextResponse.json(
      { success: false, message: 'Image validation failed' },
      { status: 500 }
    )
  }
}

// Real image quality validation function
async function performImageQualityCheck(imageData: string, fileName: string): Promise<{
  isValid: boolean
  reason?: string
  message: string
  qualityScore: number
  issues: string[]
}> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    let qualityScore = 100
    const issues: string[] = []

    // File size analysis for quality estimation
    const fileSizeKB = imageBuffer.length / 1024
    const fileSizeMB = fileSizeKB / 1024

    console.log(`📊 Image analysis: ${fileName} - ${fileSizeMB.toFixed(2)}MB`)

    // Very small files are likely low quality or compressed
    if (fileSizeMB < 0.1) {
      issues.push('Image file size too small (likely low quality)')
      qualityScore -= 40
    }

    // Check for extremely small files (under 50KB) - likely very blurry or low res
    if (fileSizeKB < 50) {
      return {
        isValid: false,
        reason: 'Image file too small',
        message: 'The photo upload is blurry or too small, please select a clear image with good lighting and focus.',
        qualityScore: 15,
        issues: ['File size too small', 'Likely blurry or low resolution']
      }
    }

    // Check for reasonable file sizes for profile photos
    if (fileSizeMB > 0.2 && fileSizeMB < 0.8) {
      qualityScore += 10 // Good size range
    }

    // Basic header analysis for image corruption
    const header = imageBuffer.slice(0, 10)
    const headerHex = header.toString('hex')
    
    // JPEG magic number: FFD8
    // PNG magic number: 89504E47
    if (fileName.toLowerCase().includes('.jpg') || fileName.toLowerCase().includes('.jpeg')) {
      if (!headerHex.startsWith('ffd8')) {
        issues.push('Corrupted JPEG file')
        qualityScore -= 50
      }
    } else if (fileName.toLowerCase().includes('.png')) {
      if (!headerHex.startsWith('89504e47')) {
        issues.push('Corrupted PNG file')
        qualityScore -= 50
      }
    }

    // Filename analysis for suspicious content
    const suspiciousPatterns = [
      'screenshot', 'screen_shot', 'snap', 'tmp', 'temp',
      'blur', 'dark', 'shadow', 'filtered', 'edited'
    ]
    
    const lowerFileName = fileName.toLowerCase()
    for (const pattern of suspiciousPatterns) {
      if (lowerFileName.includes(pattern)) {
        issues.push(`Suspicious filename pattern: ${pattern}`)
        qualityScore -= 20
      }
    }

    // Final quality assessment
    if (qualityScore < 50) {
      return {
        isValid: false,
        reason: 'Poor image quality detected',
        message: 'The image quality is too low. Please upload a clearer, higher resolution photo taken in good lighting.',
        qualityScore,
        issues
      }
    }

    if (qualityScore < 70) {
      return {
        isValid: false,
        reason: 'Image may be blurry or unclear',
        message: 'The photo upload appears blurry, please select a clear image with good lighting and focus.',
        qualityScore,
        issues
      }
    }

    return {
      isValid: true,
      message: `Image quality is good (${qualityScore}% score)`,
      qualityScore,
      issues: []
    }

  } catch (error) {
    console.error('❌ Image quality check error:', error)
    return {
      isValid: false,
      reason: 'Image processing failed',
      message: 'Could not analyze the image. Please try a different photo.',
      qualityScore: 0,
      issues: ['Processing error']
    }
  }
}