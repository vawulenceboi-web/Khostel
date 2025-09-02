'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Camera, 
  Video, 
  X, 
  Plus,
  FileImage,
  Play,
  Trash2,
  Eye
} from "lucide-react"
import { toast } from 'sonner'

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
  uploaded?: boolean
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
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null, type?: 'image' | 'video') => {
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
      const maxSize = fileType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB for video, 10MB for image
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name} (max ${maxSize / (1024 * 1024)}MB)`)
        return
      }

      // Check if we're at the limit
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
      toast.success(`${newFiles.length} file(s) added`)
      
      // Automatically upload files after selection
      setTimeout(() => {
        uploadNewFiles(newFiles)
      }, 500)
    }
  }

  const uploadNewFiles = async (filesToUpload: MediaFile[]) => {
    setIsUploading(true)

    try {
      console.log('📤 Auto-uploading', filesToUpload.length, 'files...')

      const uploadPromises = filesToUpload.map(async (mediaFile) => {
        const formData = new FormData()
        formData.append('file', mediaFile.file)
        formData.append('type', 'hostel-media')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ File uploaded:', mediaFile.file.name, '→', result.data.publicUrl)
          return {
            ...mediaFile,
            uploaded: true,
            url: result.data.publicUrl
          }
        } else {
          console.error('❌ Upload failed for:', mediaFile.file.name, result.message)
          throw new Error(`Upload failed for ${mediaFile.file.name}: ${result.message}`)
        }
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      
      // Update media files with uploaded URLs
      setMediaFiles(prev => prev.map(mf => {
        const uploaded = uploadedFiles.find(uf => uf.file.name === mf.file.name)
        return uploaded || mf
      }))

      // Immediately notify parent component with uploaded URLs
      const allFiles = [...mediaFiles.filter(mf => mf.uploaded), ...uploadedFiles]
      const urls = allFiles.map(mf => mf.url).filter(Boolean) as string[]
      const types = allFiles.map(mf => mf.type)
      
      console.log('📊 Notifying parent with URLs:', urls)
      onMediaChange(urls, types)

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`)

    } catch (error) {
      console.error('❌ Auto-upload error:', error)
      toast.error('Some files failed to upload. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const uploadFiles = async () => {
    const unuploadedFiles = mediaFiles.filter(mf => !mf.uploaded)
    
    if (unuploadedFiles.length === 0) {
      toast.error('No new files to upload')
      return
    }

    await uploadNewFiles(unuploadedFiles)
  }

  const removeFile = (index: number) => {
    const fileToRemove = mediaFiles[index]
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(fileToRemove.preview)
    
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    setMediaFiles(newFiles)
    
    // Update parent component
    const urls = newFiles.map(mf => mf.url).filter(Boolean) as string[]
    const types = newFiles.map(mf => mf.type)
    onMediaChange(urls, types)
    
    toast.success('File removed')
  }

  return (
    <div className="space-y-6">
      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <FileImage className="w-4 h-4 mr-2" />
          Add Photos
        </Button>
        
        {acceptVideo && (
          <Button
            type="button"
            variant="outline"
            onClick={() => videoInputRef.current?.click()}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            Add Videos
          </Button>
        )}

        {mediaFiles.some(mf => !mf.uploaded) && (
          <Button
            type="button"
            onClick={uploadFiles}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files ({mediaFiles.filter(mf => !mf.uploaded).length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

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
                  
                  {/* Upload Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant={mediaFile.uploaded ? 'default' : 'secondary'}>
                      {mediaFile.uploaded ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Uploaded
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* File Type Badge */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h5 className="font-medium text-green-600 mb-1">✅ Good Photos:</h5>
              <ul className="space-y-1">
                <li>• Well-lit, clear images</li>
                <li>• Multiple room angles</li>
                <li>• Bathroom and kitchen views</li>
                <li>• Exterior building shots</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-600 mb-1">🎥 Video Tips:</h5>
              <ul className="space-y-1">
                <li>• Virtual room tours</li>
                <li>• Smooth camera movement</li>
                <li>• Good lighting and audio</li>
                <li>• Max 50MB per video</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}