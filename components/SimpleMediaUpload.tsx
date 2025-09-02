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
  Trash2,
  CheckCircle,
  Clock
} from "lucide-react"
import { toast } from 'sonner'

interface SimpleMediaUploadProps {
  uploadedUrls: string[]
  uploadedTypes: string[]
  onUrlsChange: (urls: string[], types: string[]) => void
}

export default function SimpleMediaUpload({ 
  uploadedUrls, 
  uploadedTypes, 
  onUrlsChange 
}: SimpleMediaUploadProps) {
  const [uploading, setUploading] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`Invalid file type: ${file.name}`)
        continue
      }

      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`)
        continue
      }

      // Add to uploading list
      setUploading(prev => [...prev, file.name])

      try {
        console.log('📤 Uploading:', file.name)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'hostel-media')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ Upload successful:', file.name, '→', result.data.publicUrl)
          
          // Directly update parent component
          const newUrls = [...uploadedUrls, result.data.publicUrl]
          const newTypes = [...uploadedTypes, file.type.startsWith('video/') ? 'video' : 'image']
          
          console.log('📊 Updating parent with URLs:', newUrls)
          onUrlsChange(newUrls, newTypes)
          
          toast.success(`${file.name} uploaded successfully!`)
        } else {
          console.error('❌ Upload failed:', file.name, result.message)
          toast.error(`Failed to upload ${file.name}`)
        }
      } catch (error) {
        console.error('❌ Upload error:', error)
        toast.error(`Error uploading ${file.name}`)
      } finally {
        // Remove from uploading list
        setUploading(prev => prev.filter(name => name !== file.name))
      }
    }
  }

  const removeFile = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index)
    const newTypes = uploadedTypes.filter((_, i) => i !== index)
    onUrlsChange(newUrls, newTypes)
    toast.success('File removed')
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading.length > 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          {uploading.length > 0 ? 'Uploading...' : 'Add Photos & Videos'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Uploading Status */}
      {uploading.length > 0 && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Uploading {uploading.length} file(s)...
          </p>
        </div>
      )}

      {/* Current Files Display */}
      <div className="space-y-2">
        <h4 className="font-semibold">Uploaded Files ({uploadedUrls.length})</h4>
        
        {uploadedUrls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedUrls.map((url, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-secondary relative">
                    {uploadedTypes[index] === 'video' ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline">
                        {uploadedTypes[index] === 'video' ? (
                          <Video className="w-3 h-3 mr-1" />
                        ) : (
                          <Camera className="w-3 h-3 mr-1" />
                        )}
                        {uploadedTypes[index]}
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Guidelines */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Upload high-quality photos and videos</p>
            <p>• Files will upload automatically after selection</p>
            <p>• You need at least 1 photo or video to publish</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}