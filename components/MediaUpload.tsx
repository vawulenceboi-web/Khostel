'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Camera, 
  Video, 
  Plus,
  FileImage,
  Trash2,
  CheckCircle,
  Clock
} from "lucide-react"
import { toast } from 'sonner'

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
  uploaded: boolean
  url?: string
}

interface MediaUploadProps {
  onMediaChange: (mediaUrls: string[], mediaTypes: string[]) => void
  maxFiles?: number
  acceptVideo?: boolean
}

export default function MediaUpload({ 
  onMediaChange, 
  maxFiles = 10, 
  acceptVideo = true 
}: MediaUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newFiles: MediaFile[] = []
    
    Array.from(files).forEach(file => {
      // Validate file type
      const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : null

      if (!fileType) {
        toast.error(`Invalid file type: ${file.name}`)
        return
      }

      if (fileType === 'video' && !acceptVideo) {
        toast.error('Video uploads are not allowed')
        return
      }

      // Validate file size
      const maxSize = fileType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`)
        return
      }

      // Check file limit
      if (mediaFiles.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: fileType,
        uploaded: false
      })
    })

    if (newFiles.length > 0) {
      setMediaFiles(prev => [...prev, ...newFiles])
      toast.success(`${newFiles.length} file(s) selected`)
      
      // Auto-upload the new files
      uploadFiles(newFiles)
    }
  }

  const uploadFiles = async (filesToUpload?: MediaFile[]) => {
    const targetFiles = filesToUpload || mediaFiles.filter(mf => !mf.uploaded)
    
    if (targetFiles.length === 0) {
      return
    }

    setIsUploading(true)

    try {
      console.log('📤 Uploading', targetFiles.length, 'files...')

      for (const mediaFile of targetFiles) {
        try {
          const formData = new FormData()
          formData.append('file', mediaFile.file)
          formData.append('type', 'hostel-media')

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          const result = await response.json()

          if (result.success) {
            console.log('✅ Uploaded:', mediaFile.file.name, '→', result.data.publicUrl)
            
            // Update the specific file as uploaded
            setMediaFiles(prev => {
              const updated = prev.map(mf => 
                mf.file.name === mediaFile.file.name 
                  ? { ...mf, uploaded: true, url: result.data.publicUrl }
                  : mf
              )
              
              // Immediately call parent callback with updated URLs
              const uploadedFiles = updated.filter(mf => mf.uploaded)
              const urls = uploadedFiles.map(mf => mf.url).filter(Boolean) as string[]
              const types = uploadedFiles.map(mf => mf.type)
              
              console.log('📊 Immediate callback - URLs:', urls)
              onMediaChange(urls, types)
              
              return updated
            })
          } else {
            console.error('❌ Upload failed:', mediaFile.file.name, result.message)
            toast.error(`Failed to upload ${mediaFile.file.name}`)
          }
        } catch (fileError) {
          console.error('❌ File upload error:', fileError)
          toast.error(`Error uploading ${mediaFile.file.name}`)
        }
      }

      // Update parent component with all uploaded URLs
      setTimeout(() => {
        updateParentComponent()
      }, 1000)

      toast.success('Files uploaded successfully!')

    } catch (error) {
      console.error('❌ Upload error:', error)
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const updateParentComponent = () => {
    const uploadedFiles = mediaFiles.filter(mf => mf.uploaded)
    const urls = uploadedFiles.map(mf => mf.url).filter(Boolean) as string[]
    const types = uploadedFiles.map(mf => mf.type)
    
    console.log('📊 Sending to parent:', urls.length, 'URLs')
    onMediaChange(urls, types)
  }

  const removeFile = (index: number) => {
    const fileToRemove = mediaFiles[index]
    URL.revokeObjectURL(fileToRemove.preview)
    
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    setMediaFiles(newFiles)
    
    // Update parent immediately
    const urls = newFiles.filter(mf => mf.uploaded).map(mf => mf.url).filter(Boolean) as string[]
    const types = newFiles.filter(mf => mf.uploaded).map(mf => mf.type)
    onMediaChange(urls, types)
    
    toast.success('File removed')
  }

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Photos & Videos
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptVideo ? "image/*,video/*" : "image/*"}
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Uploading files...</p>
        </div>
      )}

      {/* Media Preview Grid */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaFiles.map((mediaFile, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-secondary relative">
                  {mediaFile.type === 'video' ? (
                    <video
                      src={mediaFile.preview}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaFile.preview}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Upload Status */}
                  <div className="absolute top-2 left-2">
                    <Badge variant={mediaFile.uploaded ? 'default' : 'secondary'}>
                      {mediaFile.uploaded ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Uploaded
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Uploading...
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* File Type */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline">
                      {mediaFile.type === 'video' ? (
                        <Video className="w-3 h-3 mr-1" />
                      ) : (
                        <Camera className="w-3 h-3 mr-1" />
                      )}
                      {mediaFile.type}
                    </Badge>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => removeFile(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="p-3">
                  <p className="text-xs text-muted-foreground truncate">
                    {mediaFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(mediaFile.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Guidelines */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">Media Guidelines</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Upload high-quality photos and videos of your hostel</p>
            <p>• Include room interiors, bathrooms, kitchen, and exterior views</p>
            <p>• Videos are great for virtual tours (max 50MB)</p>
            <p>• Photos should be clear and well-lit (max 10MB)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}