'use client'
import { useState } from 'react'
import { useImageUpload } from '@/hooks/useImageUpload'

interface Props {
  onDone: () => void
  onUploadComplete?: (url: string) => void
}

export function StepUpload({ onDone, onUploadComplete }: Props) {
  const [uploaded, setUploaded] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [refBUploaded, setRefBUploaded] = useState(false)
  const { upload, isUploading, uploadError } = useImageUpload()

  const handleFile = async (file: File) => {
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    const url = await upload(file)
    if (url) {
      setUploaded(true)
      onUploadComplete?.(url)
    }
  }

  const handleDone = () => {
    if (uploaded) {
      onDone()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-rose-600 font-bold text-lg">①</span>
          <h2 className="text-lg font-bold text-gray-900">上传原始照片</h2>
        </div>
        <p className="text-sm text-gray-500">上传患者正面人像作为 AI 参考图，建议遮住眼睛区域</p>
      </div>

      {uploadError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Ref A */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">A</span>
            <span className="text-sm font-medium text-gray-700">身份参考图</span>
            <span className="text-xs text-rose-500">必填</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">患者正面照，用于锁定面部特征</p>
          <label
            className={[
              'block border-2 border-dashed rounded-2xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer transition-colors',
              isUploading ? 'opacity-50 cursor-wait' : '',
              uploaded ? 'border-rose-300 bg-rose-50' : 'border-gray-200 hover:border-rose-200 hover:bg-rose-50/30',
            ].join(' ')}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="预览" className="w-full h-full object-cover rounded-2xl" />
            ) : isUploading ? (
              <>
                <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-2" />
                <p className="text-xs font-medium text-gray-600">上传中...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-100 mb-2" />
                <p className="text-xs font-medium text-gray-600">点击上传 / 拖放</p>
                <p className="text-xs text-gray-400 mt-1">JPG · PNG · 最大 10MB</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
          <div className="mt-2 text-xs text-gray-400 space-y-0.5">
            <p>正面朝向，无遮挡</p>
            <p>光线均匀，无背光</p>
            <p>建议遮住眼睛区域</p>
          </div>
        </div>

        {/* Ref B */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-bold bg-gray-400 text-white px-1.5 py-0.5 rounded">B</span>
            <span className="text-sm font-medium text-gray-700">风格参考图</span>
            <span className="text-xs text-gray-400">可选</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">目标风格参照图，不上传则使用默认提示词</p>
          <label
            className={[
              'block border-2 border-dashed rounded-2xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer transition-colors',
              refBUploaded ? 'border-gray-300 bg-gray-50' : 'border-gray-200 hover:border-gray-300',
            ].join(' ')}
          >
            {refBUploaded ? (
              <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-sm text-gray-500 font-medium">已上传</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-100 mb-2 opacity-40" />
                <p className="text-xs font-medium text-gray-400">点击上传风格参考</p>
                <p className="text-xs text-gray-300 mt-1">或从样式库选取</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={() => setRefBUploaded(true)} />
          </label>
          <button disabled className="mt-2 w-full text-xs text-gray-400 border border-gray-200 rounded-xl py-2 cursor-not-allowed">
            从样式库选取（即将上线）
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-100">
        <button
          onClick={handleDone}
          disabled={!uploaded || isUploading}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {isUploading ? '上传中...' : uploaded ? '确认上传，进入下一步 →' : '请先上传身份参考图（图A）'}
        </button>
      </div>
    </div>
  )
}
