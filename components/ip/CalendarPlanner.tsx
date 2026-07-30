'use client'
import { useState } from 'react'
import type { IPAgent } from '@/lib/ip/types'

interface CalendarPlan {
  date: string
  topic: string
  angle: string
  outline: string[]
}

export function CalendarPlanner({ agent }: { agent: IPAgent }) {
  const [days, setDays] = useState<7 | 14 | 30>(14)
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<CalendarPlan[]>([])
  const [error, setError] = useState<string | null>(null)

  const handlePlan = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ip-ai/plan-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipInfo: agent.info,
          days,
          context: context.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '规划失败')
      }

      setPlans(data.plans)

      // 保存到历史
      const historyKey = `ip-calendar-history-${agent.id}`
      const stored = localStorage.getItem(historyKey)
      const history = stored ? JSON.parse(stored) : []
      history.unshift({
        id: Date.now().toString(),
        days,
        plans: data.plans,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 5)))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (plans.length === 0) return

    let content = `# ${agent.name} - ${days}天选题日历\n\n生成时间：${new Date().toLocaleString('zh-CN')}\n\n`

    plans.forEach((plan, idx) => {
      content += `## ${idx + 1}. ${plan.topic}\n`
      content += `📅 日期：${plan.date}\n`
      content += `💡 角度：${plan.angle}\n\n`
      content += `内容框架：\n`
      plan.outline.forEach((point) => {
        content += `- ${point}\n`
      })
      content += `\n---\n\n`
    })

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agent.name}-${days}天选题日历.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">生成周期选题</h3>

        {/* Days Selection */}
        <div className="flex gap-3 mb-4">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d as 7 | 14 | 30)}
              className={[
                'flex-1 py-3 rounded-xl font-medium transition-all border-2',
                days === d
                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300',
              ].join(' ')}
              disabled={loading}
            >
              {d} 天
            </button>
          ))}
        </div>

        {/* Context */}
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="补充信息（可选）：例如近期行业热点、特殊节日、账号当前痛点等"
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 resize-none mb-3"
          disabled={loading}
        />

        <button
          onClick={handlePlan}
          disabled={loading}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? '规划中...' : `生成 ${days} 天选题日历`}
        </button>

        <p className="text-xs text-gray-400 mt-2">
          AI 将基于 IP 定位和内容策略，生成多样化的选题方案
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          规划失败：{error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">AI 正在规划选题日历...</p>
          <p className="text-gray-400 text-xs mt-1">通常需要 15-30 秒</p>
        </div>
      )}

      {plans.length > 0 && !loading && (
        <div>
          {/* Calendar View */}
          <div className="space-y-3 mb-4">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-rose-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-xs text-gray-400">
                      {new Date(plan.date).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-lg font-bold text-gray-500">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {plan.topic}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{plan.angle}</p>
                    <div className="space-y-1">
                      {plan.outline.map((point, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-500 flex items-start gap-2"
                        >
                          <span className="text-rose-400 flex-shrink-0">•</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const text = `${plan.topic}\n\n${plan.angle}\n\n${plan.outline.join('\n')}`
                      navigator.clipboard.writeText(text)
                      alert('已复制')
                    }}
                    className="text-xs text-rose-600 hover:underline flex-shrink-0"
                  >
                    复制
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              导出日历
            </button>
            <button
              onClick={() => {
                setPlans([])
                setContext('')
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              重新规划
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
