import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Camera as CameraIcon, Upload, X } from 'lucide-react'
import { compressImage, fileToBase64 } from '@/lib/utils/image'

interface CameraProps {
  onChange: (imageData: string) => void
}

export function Camera({ onChange }: CameraProps) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleGalleryClick = () => {
    galleryInputRef.current?.click()
  }

  const handleFileSelect = async (file: File) => {
    setError(null)
    setLoading(true)

    try {
      const compressed = await compressImage(file, 1024 * 1024)
      const base64 = await fileToBase64(new File([compressed], file.name, { type: 'image/jpeg' }))
      setPreview(base64)
      onChange(base64)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
    } finally {
      setLoading(false)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRetake = () => {
    setPreview(null)
    setError(null)
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''
    }
  }

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white">{t('common.loading')}</div>
            </div>
          )}
        </div>
        <Button
          onClick={handleRetake}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          <X className="mr-2 h-4 w-4" />
          {t('aiAnalysis.retake')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGallerySelect}
        className="hidden"
      />
      
      <Button
        onClick={handleCameraClick}
        className="w-full"
        disabled={loading}
      >
        <CameraIcon className="mr-2 h-4 w-4" />
        {t('aiAnalysis.takePhoto')}
      </Button>
      
      <Button
        onClick={handleGalleryClick}
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {t('aiAnalysis.selectFromGallery')}
      </Button>

      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}
