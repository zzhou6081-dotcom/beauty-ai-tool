'use client'
import { useState } from 'react'

interface Props {
  onGenerate: (cb: () => void) => void
  onDone: () => void
  onImageGenerated?: (images: { label: string; color: string }[]) => void
  onNext?: () => void
}

function ImageCard({ index }: { index: number }) {
  const [lightbox, setLightbox] = useState(false)
  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gray-50 aspect-[3/4] relative group flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button onClick={() => setLightbox(true)}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">
              放大
            </button>
            <a href="#" download onClick={(e) => e.preventDefault()}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">
              下载
            </a>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs font-medium text-gray-700">延展图 {index}</p>
        </div>
      </div>
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className="rounded-2xl overflow-hidden max-w-sm w-full aspect-[3/4] bg-gray-50" />
        </div>
      )}
    </>
  )
}

export function StepExpansion({ onGenerate, onDone, onImageGenerated, onNext }: Props) {
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [confirmed, setConfirmed] = useState(false)
  const [round, setRound] = useState(1)

  const handleGenerate = () => {
    onGenerate(() => {
      setStatus('generating')
      setTimeout(() => {
        setStatus('done')
        onImageGenerated?.([
          { label: `延展图 ${round * 2 - 1}`, color: '#f3f4f6' },
          { label: `延展图 ${round * 2}`, color: '#f3f4f6' },
        ])
        setRound((r) => r + 1)
      }, 2000)
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
          <span className="text-rose-600 font-bold text-lg">④</span>
          <h2 className="text-lg font-bold text-gray-900">同场景延展</h2>
        </div>
        <p className="text-sm text-gray-500">
          基于步骤③选定的基准图，生成不同场景的延展图，丰富案例展示
        </p>
      </div>

      {/* Base image preview */}
      <div className="mb-5 bg-gray-50 rounded-xl p-3 flex items-center gap-3">
        <div className="w-14 h-16 bg-rose-100 rounded-xl flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-gray-600">步骤③选定的基准图</p>
          <p className="text-xs text-gray-400 mt-0.5">将基于此图生成多场景延展</p>
        </div>
      </div>

      {status === 'idle' && (
        <button onClick={handleGenerate}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          生成延展图
        </button>
      )}

      {status === 'generating' && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">生成延展图中...</p>
        </div>
      )}

      {status === 'done' && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ImageCard index={(round - 1) * 2 - 1} />
            <ImageCard index={(round - 1) * 2} />
          </div>

          {!confirmed ? (
            <div className="space-y-2">
              <button onClick={() => { handleConfirm(); onNext?.() }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                进入恢复期 →
              </button>
              <div className="flex gap-2">
                <button onClick={handleGenerate}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  重新生成
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              延展图生成完成，可在资产库中查看和下载
            </div>
          )}
        </div>
      )}
    </div>
  )
}
