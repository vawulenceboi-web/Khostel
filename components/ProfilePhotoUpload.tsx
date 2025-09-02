'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Camera, 
  Upload, 
  User, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Shield,
  TrendingUp,
  Eye
} from "lucide-react"
import { toast } from 'sonner'

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string
  onPhotoUploaded: (photoUrl: string) => void
  userRole: 'agent' | 'student' | 'admin'
}

export default function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  onPhotoUploaded,
  userRole 
}: ProfilePhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit for profile photos)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    toast.success('Photo selected successfully!')
  }

  const uploadPhoto = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first')
      return
    }

    setIsUploading(true)

    try {
      console.log('📸 Starting validation and upload for:', selectedFile.name)
      
      // Step 1: Validate image quality first
      const reader = new FileReader()
      const imageDataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(selectedFile)
      })

      const validationResponse = await fetch('/api/validate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: imageDataUrl,
          fileName: selectedFile.name
        })
      })

      const validationResult = await validationResponse.json()
      
      if (!validationResult.success) {
        // Show specific validation error
        throw new Error(validationResult.message)
      }

      console.log('✅ Image validation passed, proceeding with upload...')

      // Step 2: Upload the validated image
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload-profile', {
        method: 'POST',
        body: formData
      })

      console.log('📡 Upload response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Upload failed with status:', response.status, errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 Upload result:', result)

      if (result.success) {
        toast.success(`Profile photo updated successfully! Quality score: ${result.data.qualityScore}%`)
        onPhotoUploaded(result.data.publicUrl)
        setSelectedFile(null)
        setPreviewUrl('')
        
        // Force session refresh to show new photo immediately
        console.log('🔄 Refreshing session to display new photo...')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        // Show specific error messages for image quality issues
        if (result.message.includes('blurry')) {
          toast.error('📷 The photo upload is blurry, please select a clear image with good lighting and focus.')
        } else if (result.message.includes('quality')) {
          toast.error('📷 The image quality is too low. Please upload a clearer, higher resolution photo.')
        } else if (result.message.includes('size')) {
          toast.error('📷 The image file is too small or large. Please select a different photo.')
        } else {
          toast.error(result.message || 'Upload failed - please try a different photo')
        }
      }
    } catch (error) {
      console.error('❌ Profile photo upload error:', error)
      
      if (error.message?.includes('Failed to fetch')) {
        toast.error('🌐 Network error - please check your connection and try again')
      } else if (error.message?.includes('413')) {
        toast.error('📷 Image file is too large. Please select a smaller photo (under 5MB)')
      } else if (error.message?.includes('timeout')) {
        toast.error('⏱️ Upload timed out. Please try with a smaller image or check your connection')
      } else {
        toast.error('📷 Upload failed. Please try again with a different photo.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const resetSelection = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Profile Photo
        </CardTitle>
        <CardDescription>
          {userRole === 'agent' 
            ? 'Upload a professional photo to build trust with students'
            : 'Add a profile photo to personalize your account'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Photo Display */}
        <div className="text-center">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-border bg-secondary mb-4">
            {currentPhotoUrl ? (
              <img
                src={currentPhotoUrl}
                alt="Current profile photo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {currentPhotoUrl ? (
            <Badge variant="default" className="mb-4">
              <CheckCircle className="w-3 h-3 mr-1" />
              Photo Added
            </Badge>
          ) : (
            <Badge variant="secondary" className="mb-4">
              <AlertTriangle className="w-3 h-3 mr-1" />
              No Photo
            </Badge>
          )}
        </div>

        {/* Trust Indicator for Agents */}
        {userRole === 'agent' && !currentPhotoUrl && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    Upload Your Profile Photo to Gain More Trust
                  </h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>• Students prefer agents with professional photos</p>
                    <p>• Increases booking inquiries by up to 60%</p>
                    <p>• Shows transparency and builds credibility</p>
                    <p>• Helps students feel more comfortable contacting you</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Interface */}
        <div className="space-y-4">
          {!previewUrl ? (
            <div className="text-center">
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Upload Profile Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click to select a professional photo from your device
                </p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden border-2 border-border mb-4">
                <img
                  src={previewUrl}
                  alt="Profile photo preview"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={uploadPhoto}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Profile Photo
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={resetSelection}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Choose Different Photo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Professional Guidelines */}
        <Card className="bg-secondary/50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Professional Photo Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-600 mb-2">✅ Best Practices:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Professional business attire</li>
                  <li>• Clear, well-lit photo</li>
                  <li>• Neutral or office background</li>
                  <li>• Friendly, approachable expression</li>
                  <li>• High resolution image</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-red-600 mb-2">❌ Avoid:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Casual or party photos</li>
                  <li>• Sunglasses or hats</li>
                  <li>• Group photos or selfies</li>
                  <li>• Blurry or dark images</li>
                  <li>• Inappropriate backgrounds</li>
                </ul>
              </div>
            </div>
            
            {userRole === 'agent' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Professional photos increase student trust and booking rates by 60%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}