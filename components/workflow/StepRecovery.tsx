'use client'
import { useState } from 'react'

const RECOVERY_DAYS = [
  { day: 1, label: '术后第1天', desc: '严重肿胀淤青，缝线明显' },
  { day: 3, label: '术后第3天', desc: '肿胀高峰，眼皮厚重' },
  { day: 5, label: '术后第5天', desc: '肿胀消退，淤青转黄' },
  { day: 7, label: '术后第7天', desc: '拆线，眼型初现' },
  { day: 10, label: '术后第10天', desc: '基本恢复，自然状态' },
  { day: 0, label: '完全恢复', desc: '最终效果，消肿完成' },
]

interface Props {
  onGenerate: (cb: () => void) => void
  onDone: () => void
  onImageGenerated?: (images: { label: string; color: string }[]) => void
  onNext?: () => void
}

function ImageCard({ label, onRegenerate }: { label: string; onRegenerate: () => void }) {
  const [lightbox, setLightbox] = useState(false)
  const [regenStatus, setRegenStatus] = useState<'idle' | 'loading'>('idle')

  const handleRegen = () => {
    setRegenStatus('loading')
    setTimeout(() => setRegenStatus('idle'), 1800)
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-amber-50 aspect-[3/4] relative group flex items-center justify-center">
          {regenStatus === 'loading' ? (
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-100" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => setLightbox(true)}
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-lg"
            >
              放大
            </button>
            <a
              href="#"
              download
              className="bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-lg"
              onClick={(e) => e.preventDefault()}
            >
              下载
            </a>
          </div>
        </div>
        <div className="p-2 space-y-1.5">
          <p className="text-xs font-medium text-gray-700">{label}</p>
          <button
            onClick={handleRegen}
            disabled={regenStatus === 'loading'}
            className="w-full text-xs border border-gray-200 text-gray-500 py-1 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {regenStatus === 'loading' ? '生成中...' : '重新生成'}
          </button>
        </div>
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="rounded-2xl overflow-hidden max-w-sm w-full aspect-[3/4] bg-amber-50" />
        </div>
      )}
    </>
  )
}

export function StepRecovery({ onGenerate, onDone, onImageGenerated, onNext }: Props) {
  const [selected, setSelected] = useState<number[]>([1, 3, 5, 7, 10, 0])
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [generated, setGenerated] = useState<number[]>([])
  const [round, setRound] = useState(1)

  const toggle = (day: number) => {
    if (status !== 'idle') return
    setSelected((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleGenerate = () => {
    if (selected.length === 0) return
    onGenerate(() => {
      setStatus('generating')
      const newGenerated: number[] = []
      setGenerated([])
      const days = selected.slice().sort((a, b) => a - b)
      let i = 0

      const interval = setInterval(() => {
        newGenerated.push(days[i])
        setGenerated([...newGenerated])
        i++
        if (i >= days.length) {
          clearInterval(interval)
          setStatus('done')
          onImageGenerated?.(
            RECOVERY_DAYS.filter((d) => days.includes(d.day)).map((d) => ({
              label: `${d.label} (第${round}轮)`,
              color: '#fef3c7',
            }))
          )
          setRound((r) => r + 1)
        }
      }, 600)
    })
  }

  const handleReset = () => {
    setStatus('idle')
    setGenerated([])
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-rose-600 font-bold text-lg">⑤</span>
          <h2 className="text-lg font-bold text-gray-900">恢复时间线</h2>
        </div>
        <p className="text-sm text-gray-500">
          在选定的基准图基础上，生成各恢复阶段效果，帮助患者了解完整恢复过程
        </p>
      </div>

      {/* Base image reference - Current base image from Step 3 */}
      <div className="mb-5 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-rose-700 mb-3">当前基准图</p>
        <div className="flex items-center gap-3">
          <div className="w-20 h-24 bg-white border-2 border-rose-300 rounded-xl flex-shrink-0 shadow-sm" />
          <div>
            <p className="text-sm font-medium text-gray-700">步骤③选定的术后即刻图</p>
            <p className="text-xs text-gray-500 mt-1">将基于此图生成各阶段恢复效果</p>
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">选择要生成的阶段</p>
          <div className="flex gap-2">
            <button onClick={() => setSelected(RECOVERY_DAYS.map((d) => d.day))} className="text-xs text-rose-600 hover:underline">全选</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:underline">清空</button>
          </div>
        </div>
        <div className="space-y-2">
          {RECOVERY_DAYS.map(({ day, label, desc }) => {
            const isSelected = selected.includes(day)
            const isDone = generated.includes(day)
            return (
              <label
                key={day}
                className={[
                  'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                  isSelected ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-white hover:bg-gray-50',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(day)}
                  className="accent-rose-600 flex-shrink-0"
                  disabled={status !== 'idle'}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                {isDone && <span className="text-green-500 text-xs font-medium flex-shrink-0">完成</span>}
                {status === 'generating' && isSelected && !isDone && (
                  <div className="w-4 h-4 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin flex-shrink-0" />
                )}
              </label>
            )
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600">
        已选 <span className="font-medium text-gray-800">{selected.length}</span> 个阶段
      </div>

      {status === 'idle' && (
        <button
          onClick={handleGenerate}
          disabled={selected.length === 0}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {selected.length === 0 ? '请至少选择1个阶段' : '生成恢复时间线'}
        </button>
      )}

      {status === 'done' && generated.length > 0 && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {RECOVERY_DAYS.filter((d) => generated.includes(d.day)).map((d) => (
              <ImageCard
                key={d.day}
                label={d.label}
                onRegenerate={() => {}}
              />
            ))}
          </div>
          <div className="space-y-2">
            <button onClick={() => { onDone(); onNext?.() }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              进入医患合影 →
            </button>
            <button onClick={handleReset}
              className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              重新选择
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
