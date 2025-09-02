'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  User
} from "lucide-react"
import { toast } from 'sonner'

interface FaceVerificationProps {
  onVerificationComplete: (photoUrl: string) => void
  currentStatus?: 'pending' | 'approved' | 'rejected' | 'needs_retry'
  rejectionReason?: string
  attempts?: number
}

export default function FaceVerification({ 
  onVerificationComplete, 
  currentStatus = 'pending',
  rejectionReason,
  attempts = 0
}: FaceVerificationProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isUsingCamera, setIsUsingCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera preferred
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsUsingCamera(true)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      toast.error('Could not access camera. Please use file upload instead.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsUsingCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    if (context) {
      context.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `face-verification-${Date.now()}.jpg`, { type: 'image/jpeg' })
          setSelectedFile(file)
          setPreviewUrl(URL.createObjectURL(blob))
          stopCamera()
          toast.success('Photo captured successfully!')
        }
      }, 'image/jpeg', 0.8)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    toast.success('File selected successfully!')
  }

  const validateAndUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select or capture a photo first')
      return
    }

    setIsValidating(true)
    setIsUploading(true)

    try {
      // Step 1: Upload file to Supabase Storage
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', 'face-verification')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Upload failed')
      }

      // Step 2: Validate face detection
      const validationResponse = await fetch('/api/face-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadResult.data.publicUrl,
          fileName: selectedFile.name
        })
      })

      const validationResult = await validationResponse.json()

      if (validationResult.success && validationResult.data.faceDetected) {
        toast.success('Face verification successful!')
        onVerificationComplete(uploadResult.data.publicUrl)
      } else {
        toast.error(validationResult.message || 'Face not detected clearly. Please try again.')
        // Keep the interface open for retry
      }

    } catch (error) {
      console.error('Face verification error:', error)
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsValidating(false)
      setIsUploading(false)
    }
  }

  const resetVerification = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Face Verification Required
        </CardTitle>
        <CardDescription>
          Upload a clear photo of your face for identity verification. 
          {attempts > 0 && ` (Attempt ${attempts + 1})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        {currentStatus !== 'pending' && (
          <Card className={`border-2 ${
            currentStatus === 'approved' ? 'border-green-500 bg-green-50' :
            currentStatus === 'rejected' ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {currentStatus === 'approved' && <CheckCircle className="w-6 h-6 text-green-600" />}
                {currentStatus === 'rejected' && <XCircle className="w-6 h-6 text-red-600" />}
                {currentStatus === 'needs_retry' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                
                <div>
                  <h4 className="font-semibold">
                    {currentStatus === 'approved' && 'Face Verification Approved'}
                    {currentStatus === 'rejected' && 'Face Verification Rejected'}
                    {currentStatus === 'needs_retry' && 'Please Try Again'}
                  </h4>
                  {rejectionReason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Reason:</strong> {rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Take Photo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use your device camera to take a live photo
              </p>
              <Button onClick={startCamera} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Open Camera
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Upload from Gallery</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a photo from your device gallery
              </p>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>

        {/* Camera Interface */}
        {isUsingCamera && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md mx-auto rounded-lg border-2 border-border mb-4"
                />
                <div className="flex justify-center space-x-4">
                  <Button onClick={capturePhoto}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {previewUrl && (
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">Preview</h4>
              <div className="text-center">
                {selectedFile?.type.startsWith('video/') ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-border mb-4"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Face verification preview"
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-border mb-4"
                  />
                )}
                
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={validateAndUpload}
                    disabled={isUploading || isValidating}
                  >
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Validating Face...
                      </>
                    ) : isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit for Verification
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={resetVerification}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        <Card className="bg-secondary/50">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">Photo Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-600 mb-2">✅ Required:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clear, well-lit photo of your face</li>
                  <li>• Face should be clearly visible</li>
                  <li>• Look directly at the camera</li>
                  <li>• Any background is acceptable</li>
                  <li>• High resolution preferred</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-red-600 mb-2">❌ Not Allowed:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Sunglasses or dark glasses</li>
                  <li>• Heavy filters or effects</li>
                  <li>• Face masks or coverings</li>
                  <li>• Blurry or dark photos</li>
                  <li>• Multiple people in photo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}