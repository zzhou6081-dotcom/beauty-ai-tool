'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'

const COUNT_OPTIONS = [1, 2, 4]
const RATIO_OPTIONS = [
  { id: '1:1', label: '1:1', desc: '方形' },
  { id: '3:4', label: '3:4', desc: '竖版' },
  { id: '4:3', label: '4:3', desc: '横版' },
  { id: '9:16', label: '9:16', desc: '手机屏' },
  { id: '16:9', label: '16:9', desc: '宽屏' },
]
const QUALITY_OPTIONS = [
  { id: '2k', label: '2K', cost: 10 },
  { id: '4k', label: '4K', cost: 20 },
]

const SESSION_KEY = 'generate_page_state'

type Stage = 'idle' | 'generating' | 'done'

interface SavedState {
  prompt: string
  count: number
  ratio: string
  quality: string
  stage: Stage
  resultCount: number
  uploadedPreview: string | null
}

function loadSaved(): Partial<SavedState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveToBrowser(state: SavedState) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
  } catch {}
}

export default function GeneratePage() {
  const saved = loadSaved()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(saved.uploadedPreview ?? null)
  const [dragOver, setDragOver] = useState(false)
  const [prompt, setPrompt] = useState(saved.prompt ?? '')
  const [count, setCount] = useState(saved.count ?? 2)
  const [ratio, setRatio] = useState(saved.ratio ?? '3:4')
  const [quality, setQuality] = useState(saved.quality ?? '2k')
  const [stage, setStage] = useState<Stage>(saved.stage === 'done' ? 'done' : 'idle')
  const [resultCount, setResultCount] = useState(saved.resultCount ?? 0)

  // 检查用户权限
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check')
        const data = await res.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // 检查用户是否有生成权限或有积分
  const canUseGenerate = user && (user.modules?.imageGeneration || user.credits > 0)

  // Persist state whenever it changes
  useEffect(() => {
    saveToBrowser({ prompt, count, ratio, quality, stage, resultCount, uploadedPreview })
  }, [prompt, count, ratio, quality, stage, resultCount, uploadedPreview])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evt) => setUploadedPreview(evt.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evt) => setUploadedPreview(evt.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = () => {
    // 检查权限
    if (!canUseGenerate) {
      setShowMemberModal(true)
      return
    }
    setStage('generating')
    setTimeout(() => {
      setResultCount((prev) => prev + count)
      setStage('done')
    }, 2800)
  }

  const handleRegenerate = () => {
    // 检查权限
    if (!canUseGenerate) {
      setShowMemberModal(true)
      return
    }
    setStage('generating')
    setTimeout(() => {
      setResultCount((prev) => prev + count)
      setStage('done')
    }, 2800)
  }

  const handleRestart = () => {
    setUploadedPreview(null)
    setPrompt('')
    setCount(2)
    setRatio('3:4')
    setQuality('2k')
    setStage('idle')
    setResultCount(0)
    sessionStorage.removeItem(SESSION_KEY)
  }

  const canGenerate = !!uploadedPreview && stage === 'idle'
  const canRegenerate = !!uploadedPreview && stage === 'done'
  const costPerBatch = QUALITY_OPTIONS.find((q) => q.id === quality)!.cost * count
  const currentBatchIndices = Array.from({ length: count }, (_, i) => resultCount - count + i + 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Member modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-rose-600 text-2xl">💎</span>
              </div>
              <h2 className="font-bold text-gray-900 mb-2">开通会员或充值积分</h2>
              <p className="text-sm text-gray-500">AI 生图需要会员权限或积分。开通会员后可无限次使用，或购买积分按次使用。</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowMemberModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                稍后再说
              </button>
              <a href="/billing"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-colors">
                立即开通
              </a>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI 生成</h1>
          <p className="text-sm text-gray-500 mt-1">上传参考照片，输入描述，AI 即时生成效果图</p>
        </div>

        <div className="flex gap-5 items-start">
          {/* Left: Upload + settings */}
          <div className="w-80 flex-shrink-0 space-y-4">

            {/* Upload area */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">参考图片</p>
              <label
                className={[
                  'block border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden',
                  dragOver ? 'border-rose-400 bg-rose-50' : uploadedPreview ? 'border-rose-300' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30',
                ].join(' ')}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {uploadedPreview ? (
                  <div className="aspect-square relative group">
                    <img src={uploadedPreview} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-lg">点击重新上传</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-gray-400">
                        <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">点击或拖拽上传</p>
                      <p className="text-xs text-gray-400 mt-0.5">JPG / PNG，最大 10MB</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>

            {/* Prompt */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">提示词</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要的效果，例如：自然双眼皮，眼型流畅，比例和谐..."
                rows={4}
                maxLength={500}
                className="w-full text-sm text-gray-800 placeholder-gray-300 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-rose-400 transition-colors leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-300">{prompt.length} / 500</p>
                <button onClick={() => setPrompt('')} className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
                  清空
                </button>
              </div>
            </div>

            {/* Count */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">生成张数</p>
              <div className="flex gap-2">
                {COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={[
                      'flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                      count === n ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 text-gray-600 hover:border-gray-300',
                    ].join(' ')}
                  >
                    {n} 张
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">图片质量</p>
              <div className="flex gap-2">
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    className={[
                      'flex-1 py-3 rounded-xl border-2 transition-all',
                      quality === q.id ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <p className={['text-sm font-bold', quality === q.id ? 'text-rose-600' : 'text-gray-700'].join(' ')}>{q.label}</p>
                    <p className={['text-xs mt-0.5', quality === q.id ? 'text-rose-400' : 'text-gray-400'].join(' ')}>{q.cost} 积分/张</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ratio */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">图片规格</p>
              <div className="grid grid-cols-5 gap-1.5">
                {RATIO_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRatio(r.id)}
                    className={[
                      'flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 transition-all',
                      ratio === r.id ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-gray-300',
                    ].join(' ')}
                  >
                    <RatioThumb ratio={r.id} active={ratio === r.id} />
                    <span className={['text-xs font-medium', ratio === r.id ? 'text-rose-600' : 'text-gray-500'].join(' ')}>{r.label}</span>
                    <span className="text-xs text-gray-300 leading-none">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost summary + Generate button */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">本次消耗</span>
                <span className="font-semibold text-gray-900">{costPerBatch} 积分</span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {!uploadedPreview ? '请先上传参考图' : stage === 'generating' ? '生成中...' : stage === 'done' ? '点击「重新生成」可继续' : '开始生成'}
              </button>
            </div>
          </div>

          {/* Right: Result area */}
          <div className="flex-1 min-w-0">
            {stage === 'idle' && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex items-center justify-center" style={{ minHeight: '520px' }}>
                <div className="text-center px-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-300">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a.75.75 0 0 0-1.06 0l-8.69 8.69A.75.75 0 0 1 7.5 21.44l-4.5-5.38Zm10.125-7.81a.75.75 0 0 0-1.5 0 2.25 2.25 0 1 1-4.5 0 .75.75 0 0 0-1.5 0 3.75 3.75 0 0 0 7.5 0Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">效果图将在这里显示</p>
                  <p className="text-gray-300 text-xs mt-1">上传参考图后点击「开始生成」</p>
                </div>
              </div>
            )}

            {stage === 'generating' && (
              <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center" style={{ minHeight: '520px' }}>
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-rose-500 font-bold text-sm">AI</div>
                  </div>
                  <p className="text-base font-semibold text-gray-800">AI 生成中</p>
                  <p className="text-sm text-gray-400 mt-1">通常需要 15–30 秒，请稍候</p>
                  <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-auto mt-4">
                    <div className="h-full bg-rose-400 rounded-full animate-pulse" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            )}

            {stage === 'done' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">生成完成</h2>
                    <p className="text-xs text-gray-400 mt-0.5">本次 {count} 张 · {quality.toUpperCase()} · {ratio} · 累计 {resultCount} 张</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerate}
                      disabled={!canRegenerate}
                      className="text-sm text-rose-600 hover:text-rose-700 border border-rose-200 bg-rose-50 px-3 py-1.5 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                    >
                      重新生成
                    </button>
                    <button
                      onClick={handleRestart}
                      className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      重新开始
                    </button>
                  </div>
                </div>

                <div className={[
                  'grid gap-3',
                  count === 1 ? 'grid-cols-1 max-w-xs' : count === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4',
                ].join(' ')}>
                  {currentBatchIndices.map((idx) => (
                    <ResultCard key={idx} index={idx} ratio={ratio} />
                  ))}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 mt-4">
                  图片已保存至资产库
                  <a href="/assets" className="ml-2 underline font-medium text-rose-600">查看资产库</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function RatioThumb({ ratio, active }: { ratio: string; active: boolean }) {
  const dims: Record<string, { w: number; h: number }> = {
    '1:1': { w: 20, h: 20 }, '3:4': { w: 15, h: 20 }, '4:3': { w: 20, h: 15 },
    '9:16': { w: 11, h: 20 }, '16:9': { w: 20, h: 11 },
  }
  const d = dims[ratio] ?? { w: 16, h: 16 }
  return (
    <div
      className={['rounded border flex-shrink-0', active ? 'border-rose-400 bg-rose-100' : 'border-gray-300 bg-gray-100'].join(' ')}
      style={{ width: d.w, height: d.h }}
    />
  )
}

function ResultCard({ index, ratio }: { index: number; ratio: string }) {
  const [lightbox, setLightbox] = useState(false)
  const aspectMap: Record<string, string> = {
    '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '4:3': 'aspect-[4/3]',
    '9:16': 'aspect-[9/16]', '16:9': 'aspect-[16/9]',
  }
  const aspect = aspectMap[ratio] ?? 'aspect-[3/4]'
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
        <div
          className={['bg-rose-50 flex items-center justify-center relative cursor-pointer', aspect].join(' ')}
          onClick={() => setLightbox(true)}
        >
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">放大</button>
            <a href="#" download onClick={(e) => e.preventDefault()} className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">下载</a>
          </div>
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full">#{index}</div>
        </div>
      </div>
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className={['rounded-2xl overflow-hidden bg-rose-50 flex items-center justify-center max-w-lg w-full', aspect].join(' ')} />
        </div>
      )}
    </>
  )
}
