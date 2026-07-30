'use client'
import { useState, useEffect } from 'react'

interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export function ComplianceModal({ onConfirm, onCancel }: Props) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-sm font-bold flex-shrink-0">
            !
          </div>
          <h2 className="font-bold text-gray-900">重要提示</h2>
        </div>

        <div className="text-sm text-gray-600 space-y-2 mb-6">
          <p>本图像由 AI 生成，<strong>仅供医疗美容术前沟通参考，不代表实际手术效果。</strong></p>
          <p>请勿将此图像用于任何商业推广、虚假宣传或误导患者用途。</p>
          <p className="text-xs text-gray-400">使用即表示您已阅读并同意《使用规范》</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={countdown > 0}
            className={[
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
              countdown > 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white',
            ].join(' ')}
          >
            {countdown > 0 ? `${countdown}秒后可确认` : '确认并生成'}
          </button>
        </div>
      </div>
    </div>
  )
}
