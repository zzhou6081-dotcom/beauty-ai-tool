'use client'
import type { GeneratedImage } from '@/lib/types'

interface Props {
  image: GeneratedImage
  label?: string
  isSelected?: boolean
  onSelect?: () => void
  showSelectButton?: boolean
}

export function ImageCard({ image, label, isSelected, onSelect, showSelectButton }: Props) {
  const handleDownload = async () => {
    try {
      const res = await fetch(image.url)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `beauty-ai-${Date.now()}.jpg`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(image.url, '_blank')
    }
  }

  return (
    <div
      className={[
        'relative rounded-2xl overflow-hidden border-2 transition-all duration-200 group',
        isSelected ? 'border-violet-500 shadow-lg shadow-violet-200' : 'border-transparent',
      ].join(' ')}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={label ?? '生成结果'}
        className="w-full object-cover"
        style={{ aspectRatio: '3/4', objectPosition: 'center top' }}
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-between p-2 gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 bg-white/90 hover:bg-white text-zinc-800 text-xs font-medium px-2.5 py-1.5 rounded-full shadow transition-colors"
          aria-label="下载图片"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </button>

        {showSelectButton && (
          <button
            onClick={onSelect}
            className={[
              'flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full shadow transition-colors',
              isSelected
                ? 'bg-violet-500 text-white'
                : 'bg-white/90 hover:bg-white text-zinc-800',
            ].join(' ')}
            aria-label={isSelected ? '已选中' : '选为基准图'}
            aria-pressed={isSelected}
          >
            {isSelected ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                已选中
              </>
            ) : (
              '选为基准'
            )}
          </button>
        )}
      </div>

      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shadow">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {label && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <p className="text-white text-xs font-medium">{label}</p>
        </div>
      )}
    </div>
  )
}
