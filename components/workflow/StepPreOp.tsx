'use client'
import { useState } from 'react'
import { useGeneration } from '@/hooks/useGeneration'
import type { GenerationResult } from '@/lib/types'

interface ImageItem {
  id: number
  round: number
  url: string
}

interface Props {
  onGenerate: (cb: () => void) => void
  onDone: () => void
  onImageGenerated?: (images: { label: string; color: string }[]) => void
  uploadedImageUrl?: string | null
}

function ImageCard({ item }: { item: ImageItem }) {
  const [lightbox, setLightbox] = useState(false)
  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-green-50 aspect-[3/4] relative group flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={`术前标准照 ${item.id}`} className="w-full h-full object-cover" />
          {item.round > 1 && (
            <span className="absolute top-2 left-2 bg-gray-700/70 text-white text-xs px-1.5 py-0.5 rounded-full">
              第{item.round}次
            </span>
          )}
          {/* Hover actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => setLightbox(true)}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              放大
            </button>
            <a
              href={item.url}
              download={`术前标准照_${item.id}.jpg`}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              下载
            </a>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs font-medium text-gray-700">术前标准照 {item.id}</p>
          <p className="text-xs text-gray-400 mt-0.5">正面 · 标准光线</p>
        </div>
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="rounded-2xl overflow-hidden max-w-2xl w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={`术前标准照 ${item.id}`} className="w-full h-auto" />
          </div>
        </div>
      )}
    </>
  )
}

export function StepPreOp({ onGenerate, onDone, onImageGenerated, uploadedImageUrl }: Props) {
  const [confirmed, setConfirmed] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [round, setRound] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const { generate, status, queuePosition } = useGeneration({
    onComplete: (result: GenerationResult) => {
      const newImages = result.images.map((img, idx) => ({
        id: images.length + idx + 1,
        round,
        url: img.url,
      }))
      setImages((prev) => [...prev, ...newImages])
      onImageGenerated?.(
        result.images.map((_, idx) => ({
          label: `术前标准照 ${images.length + idx + 1}`,
          color: '#ecfdf5',
        }))
      )
      setRound((r) => r + 1)
      setError(null)
    },
    onError: (err) => {
      setError(err)
    },
  })

  const handleGenerate = () => {
    if (!uploadedImageUrl) {
      setError('请先上传参考图')
      return
    }

    onGenerate(() => {
      setError(null)
      generate({
        step: 3,
        imageUrl: uploadedImageUrl,
        variant: 'standard', // 默认生成标准单眼皮术前照
      })
    })
  }

  const isGenerating = status === 'submitting' || status === 'polling'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-rose-600 font-bold text-lg">②</span>
          <h2 className="text-lg font-bold text-gray-900">生成术前标准照</h2>
        </div>
        <p className="text-sm text-gray-500">
          基于参考图生成标准化术前照片，统一光线/角度/背景，便于术后对比
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Reference image */}
      <div className="mb-5 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
        <div className="w-14 h-16 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
          {uploadedImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={uploadedImageUrl} alt="参考图" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">步骤①上传的参考图</p>
          <p className="text-xs text-gray-400 mt-0.5">将基于此图生成标准术前照</p>
        </div>
      </div>

      {!isGenerating && images.length === 0 && (
        <button
          onClick={handleGenerate}
          disabled={!uploadedImageUrl}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {uploadedImageUrl ? '生成术前标准照' : '请先完成步骤①上传参考图'}
        </button>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">AI 生成中，请稍候...</p>
          {status === 'polling' && queuePosition !== null && (
            <p className="text-xs text-gray-400">队列位置：{queuePosition}</p>
          )}
          {status === 'polling' && queuePosition === null && (
            <p className="text-xs text-gray-400">通常需要 15-30 秒</p>
          )}
        </div>
      )}

      {images.length > 0 && !isGenerating && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {images.map((item) => (
              <ImageCard key={`${item.id}-${item.round}`} item={item} />
            ))}
          </div>

          {!confirmed ? (
            <div className="space-y-2">
              <button
                onClick={() => { setConfirmed(true); onDone() }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                确认此术前照，进入下一步 →
              </button>
              <button
                onClick={handleGenerate}
                className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                重新生成（保留当前结果）
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              术前标准照已确认，步骤③已解锁
            </div>
          )}
        </div>
      )}
    </div>
  )
}
