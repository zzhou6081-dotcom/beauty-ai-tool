'use client'
import { useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'

export default function CompareTestPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const [qwenResult, setQwenResult] = useState<string | null>(null)
  const [fluxResult, setFluxResult] = useState<string | null>(null)

  const [qwenLoading, setQwenLoading] = useState(false)
  const [fluxLoading, setFluxLoading] = useState(false)

  const [qwenTime, setQwenTime] = useState<number>(0)
  const [fluxTime, setFluxTime] = useState<number>(0)

  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!imageFile) {
      setError('请先选择图片')
      return
    }

    setError(null)
    console.log('开始上传图片...')

    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('上传响应状态:', res.status)
      const data = await res.json()
      console.log('上传响应数据:', data)

      if (!res.ok) throw new Error(data.error)

      setUploadedUrl(data.url)
      console.log('上传成功！')
      alert('✅ 上传成功！现在可以测试生成了')
    } catch (err: any) {
      console.error('上传失败:', err)
      setError(`上传失败: ${err.message}`)
    }
  }

  const testQwen = async () => {
    if (!uploadedUrl) return

    setQwenLoading(true)
    setQwenResult(null)
    setError(null)
    const startTime = Date.now()

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 1,
          imageUrl: uploadedUrl,
          variant: 'parallel',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setQwenTime(Date.now() - startTime)
      setQwenResult(data.result.images[0].url)
    } catch (err: any) {
      setError(`Qwen错误: ${err.message}`)
    } finally {
      setQwenLoading(false)
    }
  }

  const testFlux = async () => {
    if (!uploadedUrl) return

    setFluxLoading(true)
    setFluxResult(null)
    setError(null)
    const startTime = Date.now()

    const prompt = `Professional cosmetic surgery result photography. Create natural-looking parallel double eyelid fold on this person's eyes.
The double eyelid crease should run parallel to the upper eyelid edge at medium height, creating a symmetric, even fold visible from inner to outer corner.
Simulate fresh post-surgery appearance with mild swelling along the eyelid and slight redness at the crease line.
CRITICAL: Keep this person's face, skin tone, hair, nose, mouth, and all other facial features completely unchanged and identical. Only modify the eyelids to add the double fold.
High definition clinical photography, professional medical lighting, photorealistic detail, natural skin texture preserved.`

    try {
      const res = await fetch('/api/flux-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          prompt: prompt,
          strength: 0.65,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.details)

      setFluxTime(Date.now() - startTime)
      setFluxResult(data.result.images[0].url)
    } catch (err: any) {
      setError(`Flux错误: ${err.message}`)
    } finally {
      setFluxLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI模型对比测试</h1>
          <p className="text-gray-600">对比 SiliconFlow Qwen vs Replicate Flux.1 Pro 的双眼皮生成效果</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">① 上传测试图片</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />
          {imagePreview && (
            <div className="mb-4">
              <img src={imagePreview} alt="预览" className="w-64 h-64 object-cover rounded-xl" />
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={!imageFile || !!uploadedUrl}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {uploadedUrl ? '✓ 已上传' : '上传图片'}
          </button>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">② 开始测试</h2>
          <div className="flex gap-4">
            <button
              onClick={testQwen}
              disabled={!uploadedUrl || qwenLoading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {qwenLoading ? '生成中...' : '测试 Qwen-Image-Edit'}
            </button>
            <button
              onClick={testFlux}
              disabled={!uploadedUrl || fluxLoading}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {fluxLoading ? '生成中...' : '测试 Flux.1 Pro ⭐'}
            </button>
          </div>
        </div>

        {/* Results Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Original */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">原始图片</h3>
            {imagePreview && (
              <img src={imagePreview} alt="原始" className="w-full rounded-xl mb-4" />
            )}
          </div>

          {/* Qwen Result */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Qwen-Image-Edit</h3>
            <p className="text-sm text-gray-500 mb-4">
              {qwenTime > 0 && `耗时: ${(qwenTime / 1000).toFixed(1)}秒`}
            </p>
            {qwenLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
              </div>
            )}
            {qwenResult && (
              <img src={qwenResult} alt="Qwen结果" className="w-full rounded-xl" />
            )}
            {!qwenLoading && !qwenResult && (
              <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                等待生成
              </div>
            )}
          </div>

          {/* Flux Result */}
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Flux.1 Pro ⭐</h3>
            <p className="text-sm text-gray-500 mb-4">
              {fluxTime > 0 && `耗时: ${(fluxTime / 1000).toFixed(1)}秒`}
            </p>
            {fluxLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
              </div>
            )}
            {fluxResult && (
              <img src={fluxResult} alt="Flux结果" className="w-full rounded-xl" />
            )}
            {!fluxLoading && !fluxResult && (
              <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                等待生成
              </div>
            )}
          </div>
        </div>

        {/* Analysis */}
        {qwenResult && fluxResult && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 对比分析</h3>
            <div className="space-y-2 text-sm">
              <p><strong>生成速度:</strong> Qwen {(qwenTime / 1000).toFixed(1)}秒 vs Flux {(fluxTime / 1000).toFixed(1)}秒</p>
              <p><strong>请仔细对比:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                <li>双眼皮是否明显？</li>
                <li>变化是否自然？</li>
                <li>脸部其他特征是否保持不变？</li>
                <li>整体效果是否接近Motoidea？</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
