'use client'
import { useState } from 'react'
import { useGeneration } from '@/hooks/useGeneration'
import type { GenerationResult } from '@/lib/types'

interface ImageItem {
  id: string
  round: number
  url: string
}

interface Props {
  onGenerate: (cb: () => void) => void
  onDone: () => void
  onImageGenerated?: (images: { label: string; color: string }[]) => void
  onNext?: () => void
  uploadedImageUrl: string | null
}

const COLORS = ['#fce7f3', '#fef3c7']

function ImageCard({ item, isSelected, canSelect, onSelect }: {
  item: ImageItem
  isSelected: boolean
  canSelect: boolean
  onSelect: () => void
}) {
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      <div className={[
        'rounded-2xl border-2 overflow-hidden transition-all',
        isSelected ? 'border-rose-500 shadow-md' : 'border-gray-100',
      ].join(' ')}>
        <div className="aspect-[3/4] relative group bg-gray-100">
          <img src={item.url} alt="术后即刻" className="w-full h-full object-cover" />
          {item.round > 1 && (
            <span className="absolute top-2 left-2 bg-gray-700/70 text-white text-xs px-1.5 py-0.5 rounded-full">
              第{item.round}次
            </span>
          )}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              基准图
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => setLightbox(true)}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              放大
            </button>
            <a href="#" download onClick={(e) => e.preventDefault()}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">
              下载
            </a>
          </div>
        </div>
        <div className="p-3">
          {canSelect && !isSelected && (
            <button onClick={onSelect}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors">
              选为基准图
            </button>
          )}
          {isSelected && (
            <button onClick={onSelect}
              className="w-full border border-rose-300 text-rose-600 text-xs font-medium py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
              已选为基准图（点击更换）
            </button>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className="rounded-2xl overflow-hidden max-w-sm w-full aspect-[3/4] bg-gray-100"
            onClick={(e) => e.stopPropagation()}>
            <img src={item.url} alt="术后即刻" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </>
  )
}

export function StepPostOp({ onGenerate, onDone, onImageGenerated, onNext, uploadedImageUrl }: Props) {
  const [round, setRound] = useState(1)
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { generate, status: genStatus, queuePosition } = useGeneration({
    onComplete: (result: GenerationResult) => {
      const newImages = result.images.map((img, idx) => ({
        id: `img-${round}-${idx + 1}`,
        round,
        url: img.url,
      }))
      setImages((prev) => [...prev, ...newImages])
      setRound((r) => r + 1)
      onImageGenerated?.([
        { label: '术后即刻图 1', color: COLORS[0] },
        { label: '术后即刻图 2', color: COLORS[1] },
      ])
      setError(null)
    },
    onError: (err) => setError(err),
  })

  const status = genStatus === 'submitting' || genStatus === 'polling' ? 'generating' :
                 images.length > 0 ? 'done' : 'idle'

  const handleGenerate = () => {
    if (!uploadedImageUrl) {
      setError('请先完成步骤①上传参考图')
      return
    }
    setError(null)
    onGenerate(() => {
      generate({
        step: 1,
        imageUrl: uploadedImageUrl,
        variant: 'default',
      })
    })
  }

  const handleConfirm = () => {
    setConfirmed(true)
    onDone()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-rose-600 font-bold text-lg">③</span>
          <h2 className="text-lg font-bold text-gray-900">生成术后即刻效果图</h2>
        </div>
        <p className="text-sm text-gray-500">
          AI 基于参考图生成术后即刻效果，选择一张作为后续步骤的基准图
        </p>
      </div>

      {/* Reference image */}
      <div className="mb-5 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
        {uploadedImageUrl ? (
          <>
            <img src={uploadedImageUrl} alt="参考图" className="w-14 h-16 bg-gray-200 rounded-xl flex-shrink-0 object-cover" />
            <div>
              <p className="text-xs font-medium text-gray-600">步骤①上传的参考图</p>
              <p className="text-xs text-gray-400 mt-0.5">将基于此图生成术后效果</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-600">未找到参考图</p>
              <p className="text-xs text-gray-400 mt-0.5">请先完成步骤①上传</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {status === 'idle' && (
        <button onClick={handleGenerate}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          生成术后即刻效果图
        </button>
      )}

      {status === 'generating' && (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">AI 生成中，请稍候...</p>
          {queuePosition !== null && queuePosition > 0 && (
            <p className="text-xs text-gray-400">队列位置: {queuePosition}</p>
          )}
          <p className="text-xs text-gray-400">通常需要 15-30 秒</p>
        </div>
      )}

      {images.length > 0 && status !== 'generating' && (
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {selectedBase ? '已选定基准图' : '请选择一张作为基准图'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {images.map((item) => (
              <ImageCard
                key={item.id}
                item={item}
                isSelected={selectedBase === item.id}
                canSelect={status === 'done'}
                onSelect={() => setSelectedBase(selectedBase === item.id ? null : item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {status === 'done' && !confirmed && (
        <div className="space-y-2">
          {selectedBase && (
            <div className="flex items-center gap-2 mb-3">
              <button onClick={handleConfirm}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                确认基准图，解锁后续步骤 →
              </button>
              <button
                onClick={() => { handleConfirm(); onNext?.() }}
                className="px-4 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                title="快速跳转到步骤④"
              >
                →④
              </button>
            </div>
          )}
          {!selectedBase && (
            <button disabled
              className="w-full bg-gray-200 text-gray-400 cursor-not-allowed font-semibold py-3 rounded-xl text-sm">
              请先选择一张基准图
            </button>
          )}
          <button onClick={handleGenerate}
            className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            重新生成（保留当前结果）
          </button>
        </div>
      )}

      {confirmed && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
          基准图已选定，步骤④⑤⑥同时解锁，可任意顺序完成
        </div>
      )}
    </div>
  )
}
