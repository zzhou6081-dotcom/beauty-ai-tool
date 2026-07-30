'use client'
import { useState, useCallback } from 'react'
import { useWorkflowStore } from '@/lib/store'

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const setStep1Upload = useWorkflowStore((s) => s.setStep1Upload)

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true)
      setUploadError(null)

      try {
        const preview = URL.createObjectURL(file)
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || '上传失败')

        setStep1Upload(data.url as string, preview)
        return data.url as string
      } catch (err) {
        const msg = err instanceof Error ? err.message : '上传出错'
        setUploadError(msg)
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [setStep1Upload]
  )

  return { upload, isUploading, uploadError }
}
