'use client'
import { useRef, useState, DragEvent } from 'react'

interface Props {
  onFile: (file: File) => void
  preview?: string | null
  disabled?: boolean
  hint?: string
}

export function ImageUploader({ onFile, preview, disabled, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) onFile(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="上传参考图片"
      className={[
        'relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden',
        isDragging ? 'border-violet-400 bg-violet-50' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50',
        disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
      ].join(' ')}
      style={{ minHeight: 200 }}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {preview ? (
        <div className="relative w-full" style={{ minHeight: 200 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="已上传参考图"
            className="w-full h-full object-cover rounded-2xl"
            style={{ maxHeight: 320 }}
          />
          <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded-2xl">
            <span className="text-xs bg-black/60 text-white px-3 py-1 rounded-full">点击更换图片</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-600">点击或拖拽上传图片</p>
            <p className="text-xs text-zinc-400 mt-1">{hint ?? 'JPG / PNG，最大 10MB'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
