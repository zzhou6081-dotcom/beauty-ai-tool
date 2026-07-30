'use client'
import { useState } from 'react'

interface Props {
  onGenerate: (cb: () => void) => void
  onDone: () => void
  onImageGenerated?: (images: { label: string; color: string }[]) => void
  sessionImages?: { label: string; color: string }[]
}

export function StepComposite({ onGenerate, onDone, onImageGenerated, sessionImages = [] }: Props) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [doctorPreview, setDoctorPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [lightbox, setLightbox] = useState(false)

  const mockImages = sessionImages.length > 0 ? sessionImages : [
    { label: '术后即刻图 1', color: '#fce7f3' },
    { label: '术前标准照 1', color: '#ecfdf5' },
    { label: '延展图 1', color: '#f3f4f6' },
  ]

  const handleDoctorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setDoctorPreview(URL.createObjectURL(file))
  }

  const handleGenerate = () => {
    if (selectedImage === null) return
    onGenerate(() => {
      setStatus('generating')
      setTimeout(() => {
        setStatus('done')
        onImageGenerated?.([{ label: '医患合影', color: '#dbeafe' }])
      }, 2000)
    })
  }

  const canGenerate = selectedImage !== null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-rose-600 font-bold text-lg">⑥</span>
          <h2 className="text-lg font-bold text-gray-900">医患合影</h2>
        </div>
        <p className="text-sm text-gray-500">
          从本次工作流已生成的图片中选一张，上传医生照片，AI 合成医患合影
        </p>
      </div>

      {/* Step 1: select a generated image */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          第一步：选择一张已生成的图片
        </p>
        <div className="grid grid-cols-3 gap-2">
          {mockImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={[
                'rounded-xl border-2 overflow-hidden transition-all text-left',
                selectedImage === idx ? 'border-rose-500 shadow-md' : 'border-gray-100 hover:border-rose-200',
              ].join(' ')}
            >
              <div
                className="aspect-[3/4] flex items-center justify-center relative"
                style={{ backgroundColor: img.color }}
              >
                <div className="w-10 h-10 rounded-full bg-white/30" />
                {selectedImage === idx && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <div className="px-2 py-1.5">
                <p className="text-xs text-gray-600 truncate">{img.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: upload doctor photo */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          第二步：上传医生照片
        </p>
        <label className={[
          'block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          doctorPreview ? 'border-rose-300 bg-rose-50' : 'border-gray-200 hover:border-gray-300',
        ].join(' ')}>
          {doctorPreview ? (
            <div className="flex items-center gap-4">
              <img src={doctorPreview} alt="医生照片" className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 object-cover" />
              <div className="text-left">
                <p className="text-sm font-medium text-rose-700">已上传医生照片</p>
                <p className="text-xs text-gray-400 mt-1">点击可重新上传</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-gray-400">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">点击上传医生照片</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG / PNG，最大 10MB</p>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleDoctorUpload} />
        </label>
      </div>

      {status === 'idle' && (
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {!canGenerate ? '请先选择一张图片' : '生成医患合影'}
        </button>
      )}

      {status === 'generating' && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">AI 合成中...</p>
        </div>
      )}

      {status === 'done' && (
        <div>
          {/* Result */}
          <div
            className="rounded-2xl overflow-hidden border border-gray-100 mb-4 cursor-pointer relative group"
            onClick={() => setLightbox(true)}
          >
            <div className="bg-blue-50 aspect-video flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-20 h-24 bg-blue-100 rounded-xl mx-auto" />
                <p className="text-xs text-gray-500 mt-1">患者</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-24 bg-blue-200 rounded-xl mx-auto" />
                <p className="text-xs text-gray-500 mt-1">医生</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/90 text-gray-800 text-xs font-medium px-4 py-2 rounded-lg">点击放大</span>
            </div>
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setStatus('idle')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center">
              重新生成
            </button>
            <a href="#" download onClick={(e) => e.preventDefault()}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center">
              下载
            </a>
          </div>

          <button
            onClick={() => onDone()}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors mb-3">
            完成工作流
          </button>

          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            所有步骤已完成，工作流生成的图片已保存至资产库。
            <a href="/assets" className="ml-2 underline font-medium">查看资产库</a>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className="rounded-2xl overflow-hidden max-w-2xl w-full aspect-video bg-blue-50 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-32 h-40 bg-blue-100 rounded-xl mx-auto" />
              <p className="text-sm text-gray-500 mt-2">患者</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-40 bg-blue-200 rounded-xl mx-auto" />
              <p className="text-sm text-gray-500 mt-2">医生</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
