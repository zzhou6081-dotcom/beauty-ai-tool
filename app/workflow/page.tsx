'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { StepUpload } from '@/components/workflow/StepUpload'
import { StepPreOp } from '@/components/workflow/StepPreOp'
import { StepPostOp } from '@/components/workflow/StepPostOp'
import { StepExpansion } from '@/components/workflow/StepExpansion'
import { StepRecovery } from '@/components/workflow/StepRecovery'
import { StepComposite } from '@/components/workflow/StepComposite'

// ─── Category selection ───────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'double_eyelid',
    icon: null,
    name: '单眼皮 / 双眼皮',
    desc: '内双、单眼皮→双眼皮，支持多形态效果图',
    tag: '已上线',
    active: true,
  },
  {
    id: 'eye_advanced',
    icon: null,
    name: '眼部综合修复',
    desc: '开眼角、去眼袋、眼睑下垂等综合方案',
    tag: '开发中',
    active: false,
  },
  {
    id: 'nose',
    icon: null,
    name: '鼻部整形',
    desc: '隆鼻、鼻头修复、鞍鼻矫正等',
    tag: '开发中',
    active: false,
  },
  {
    id: 'face_contour',
    icon: null,
    name: '面部轮廓',
    desc: '下颌骨、颧骨、面部提升等',
    tag: '规划中',
    active: false,
  },
  {
    id: 'filler',
    icon: null,
    name: '针剂抗衰',
    desc: '玻尿酸、肉毒素、填充类等',
    tag: '规划中',
    active: false,
  },
  {
    id: 'skin',
    icon: null,
    name: '皮肤护理',
    desc: '光电类、刷酸类、水光针等',
    tag: '规划中',
    active: false,
  },
]

// ─── Workflow types ───────────────────────────────────────────────────────────

type StepStatus = 'locked' | 'idle' | 'generating' | 'done'

interface StepState {
  upload: StepStatus
  preop: StepStatus
  postop: StepStatus
  expansion: StepStatus
  recovery: StepStatus
  composite: StepStatus
}

interface GeneratedImage {
  step: string
  label: string
  color: string
  time: string
}

const STEP_LIST = [
  { id: 'upload' as const, num: '①', label: '上传原始照片', desc: '上传参考图' },
  { id: 'preop' as const, num: '②', label: '生成术前标准照', desc: '标准化图像' },
  { id: 'postop' as const, num: '③', label: '生成术后即刻', desc: 'AI 效果图' },
  { id: 'expansion' as const, num: '④', label: '同场景延展', desc: '多场景展示' },
  { id: 'recovery' as const, num: '⑤', label: '恢复时间线', desc: '1/3/5/7/10天' },
  { id: 'composite' as const, num: '⑥', label: '医患合影', desc: '合成合影' },
]

const STEP_LABEL_MAP: Record<string, string> = {
  upload: '上传',
  preop: '术前照',
  postop: '术后即刻',
  expansion: '延展图',
  recovery: '恢复',
  composite: '医患合影',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkflowPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  // 检查用户是否有工作流权限或有积分
  const canUseWorkflow = user && (user.modules?.workflow || user.credits > 0)

  // workflow state
  const [activeStep, setActiveStep] = useState<keyof StepState>('upload')
  const [stepStatus, setStepStatus] = useState<StepState>({
    upload: 'idle',
    preop: 'locked',
    postop: 'locked',
    expansion: 'locked',
    recovery: 'locked',
    composite: 'locked',
  })
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  // Persistent step data - preserved across step navigation
  const [stepData, setStepData] = useState<{
    upload?: { file: File | null; preview: string | null }
    preop?: { images: any[] }
    postop?: { images: any[]; selectedBase: string | null }
    expansion?: { images: any[]; round: number }
    recovery?: { generated: number[] }
    composite?: { result: boolean }
  }>({})

  const updateStepData = (step: keyof StepState, data: any) => {
    setStepData(prev => ({ ...prev, [step]: { ...prev[step], ...data } }))
  }

  const unlockStep = (step: keyof StepState) =>
    setStepStatus((prev) => ({ ...prev, [step]: 'idle' }))

  const markDone = (step: keyof StepState) =>
    setStepStatus((prev) => ({ ...prev, [step]: 'done' }))

  const handleGenerate = (_step: keyof StepState, callback: () => void) => {
    if (!canUseWorkflow) {
      setShowMemberModal(true)
      return
    }
    callback()
  }

  const addImages = (step: keyof StepState, images: { label: string; color: string }[]) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    setGeneratedImages((prev) => [
      ...prev,
      ...images.map((img) => ({ step: STEP_LABEL_MAP[step] ?? step, label: img.label, color: img.color, time: now })),
    ])
  }

  const isUnlocked = (id: keyof StepState) => stepStatus[id] !== 'locked'

  const enterWorkflow = () => {
    if (!selectedCategory) return
    setEntered(true)
  }

  const exitToCategories = () => {
    setEntered(false)
    setSelectedCategory(null)
    setActiveStep('upload')
    setStepStatus({ upload: 'idle', preop: 'locked', postop: 'locked', expansion: 'locked', recovery: 'locked', composite: 'locked' })
    setGeneratedImages([])
    setStepData({})
  }

  const selectedCat = CATEGORIES.find((c) => c.id === selectedCategory)

  // ─ Category selection screen ─
  if (!entered) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">工作流</h1>
            <p className="text-gray-500 mt-1 text-sm">选择品类，进入 6 步 AI 工作流，生成完整案例图集</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {CATEGORIES.map((cat) => {
              const selected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (!cat.active) return
                    setSelectedCategory(cat.id)
                    setEntered(true)
                  }}
                  disabled={!cat.active}
                  className={[
                    'text-left p-6 rounded-2xl border-2 transition-all',
                    cat.active
                      ? selected
                        ? 'border-rose-500 bg-rose-50 shadow-md'
                        : 'border-gray-200 hover:border-rose-300 hover:shadow-sm cursor-pointer bg-white'
                      : 'border-gray-100 opacity-50 cursor-not-allowed bg-white',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full invisible">placeholder</span>
                    <span className={[
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      cat.active ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400',
                    ].join(' ')}>
                      {cat.tag}
                    </span>
                  </div>
                  <h3 className={['font-semibold mb-1', selected ? 'text-rose-700' : 'text-gray-900'].join(' ')}>
                    {cat.name}
                  </h3>
                  <p className="text-sm text-gray-500">{cat.desc}</p>
                  {cat.active && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {['上传参考图', '术前标准照', '术后即刻', '延展图', '恢复时间线', '医患合影'].map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // ─ 6-step workflow screen ─
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {!canUseWorkflow && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            {user?.credits === 0
              ? '工作流功能需要积分或会员权限'
              : '工作流功能仅限会员使用'}
          </p>
          <a href="/billing" className="text-sm font-semibold text-rose-600 hover:underline whitespace-nowrap">
            立即开通会员 →
          </a>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <button
            onClick={() => generatedImages.length > 0 ? setShowExitConfirm(true) : exitToCategories()}
            className="hover:text-rose-600 transition-colors"
          >
            工作流
          </button>
          <span>/</span>
          <span className="text-gray-700 font-medium">{selectedCat?.name}</span>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="font-bold text-gray-900 mb-2">退出工作流？</h2>
            <p className="text-sm text-gray-500 mb-5">当前进度将会丢失，生成的图片仍保存在资产库中。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                继续工作流
              </button>
              <button
                onClick={() => { setShowExitConfirm(false); exitToCategories() }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-rose-600 text-2xl">💎</span>
              </div>
              <h2 className="font-bold text-gray-900 mb-2">开通会员或充值积分</h2>
              <p className="text-sm text-gray-500">工作流生图需要会员权限或积分。开通会员后可无限次使用，或购买积分按次使用。</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowMemberModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                稍后再说
              </button>
              <a href="/billing"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-semibold text-center transition-colors">
                立即订阅
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-4 gap-5">
        {/* Left: Step Nav */}
        <aside className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">步骤</p>
            </div>
            <nav className="p-2">
              {STEP_LIST.map(({ id, num, label, desc }) => {
                const status = stepStatus[id]
                const active = activeStep === id
                const unlocked = status !== 'locked'
                return (
                  <button
                    key={id}
                    onClick={() => unlocked && setActiveStep(id)}
                    disabled={!unlocked}
                    className={[
                      'w-full text-left px-3 py-3 rounded-xl mb-1 transition-all',
                      active ? 'bg-rose-50' : '',
                      unlocked && !active ? 'hover:bg-gray-50' : '',
                      !unlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <span className={[
                        'text-sm font-bold flex-shrink-0',
                        active ? 'text-rose-600' : unlocked ? 'text-gray-500' : 'text-gray-300',
                      ].join(' ')}>{num}</span>
                      <div className="flex-1 min-w-0">
                        <p className={['text-xs font-semibold truncate', active ? 'text-rose-700' : 'text-gray-700'].join(' ')}>
                          {label}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{desc}</p>
                      </div>
                      <StatusIcon status={status} />
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Center: Step Content */}
        <main className="flex-1 min-w-0">
          {activeStep === 'upload' && (
            <StepUpload
              onDone={() => {
                markDone('upload')
                addImages('upload', [{ label: '上传参考图', color: '#e5e7eb' }])
                unlockStep('preop')
                setActiveStep('preop')
              }}
              onUploadComplete={(url) => setUploadedImageUrl(url)}
            />
          )}
          {activeStep === 'preop' && (
            <StepPreOp
              onGenerate={(cb) => handleGenerate('preop', cb)}
              onDone={() => { markDone('preop'); unlockStep('postop'); setActiveStep('postop') }}
              onImageGenerated={(imgs) => addImages('preop', imgs)}
              uploadedImageUrl={uploadedImageUrl}
            />
          )}
          {activeStep === 'postop' && (
            <StepPostOp
              onGenerate={(cb) => handleGenerate('postop', cb)}
              onDone={() => { markDone('postop'); unlockStep('expansion'); unlockStep('recovery'); unlockStep('composite') }}
              onImageGenerated={(imgs) => addImages('postop', imgs)}
              onNext={() => setActiveStep('expansion')}
              uploadedImageUrl={uploadedImageUrl}
            />
          )}
          {activeStep === 'expansion' && (
            <StepExpansion
              onGenerate={(cb) => handleGenerate('expansion', cb)}
              onDone={() => markDone('expansion')}
              onImageGenerated={(imgs) => addImages('expansion', imgs)}
              onNext={() => setActiveStep('recovery')}
            />
          )}
          {activeStep === 'recovery' && (
            <StepRecovery
              onGenerate={(cb) => handleGenerate('recovery', cb)}
              onDone={() => markDone('recovery')}
              onImageGenerated={(imgs) => addImages('recovery', imgs)}
              onNext={() => setActiveStep('composite')}
            />
          )}
          {activeStep === 'composite' && (
            <StepComposite
              onGenerate={(cb) => handleGenerate('composite', cb)}
              onDone={() => markDone('composite')}
              onImageGenerated={(imgs) => addImages('composite', imgs)}
              sessionImages={generatedImages.map((g) => ({ label: g.label, color: g.color }))}
            />
          )}
        </main>

        {/* Right: Generated images panel */}
        <aside className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">本次生成</p>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {generatedImages.length}
              </span>
            </div>
            <div className="p-2 max-h-[calc(100vh-180px)] overflow-y-auto">
              {generatedImages.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs text-gray-400">生成的图片会<br />在这里显示</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {generatedImages.map((img, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className="w-10 h-12 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: img.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{img.label}</p>
                        <p className="text-xs text-gray-400">{img.step} · {img.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reference image selector hint */}
            {generatedImages.length > 0 && (activeStep === 'expansion' || activeStep === 'recovery') && (
              <div className="px-3 py-2 border-t border-gray-100 bg-blue-50">
                <p className="text-xs text-blue-700">
                  点击上方图片可设为当前步骤的参考图
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'locked') return <span className="text-gray-300 text-xs">—</span>
  if (status === 'done') return <span className="text-green-500 text-xs font-bold">✓</span>
  if (status === 'generating') return <span className="text-amber-500 text-xs">...</span>
  return null
}
