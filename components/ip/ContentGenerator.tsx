'use client'
import { useState } from 'react'
import type { IPAgent } from '@/lib/ip/types'

export function ContentGenerator({ agent }: { agent: IPAgent }) {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    title: string
    body: string
    conclusion: string
    tags: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('请输入选题')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ip-ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipInfo: agent.info,
          topic: topic.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      setResult(data.content)

      // 保存到历史
      const historyKey = `ip-content-history-${agent.id}`
      const stored = localStorage.getItem(historyKey)
      const history = stored ? JSON.parse(stored) : []
      history.unshift({
        id: Date.now().toString(),
        topic: topic.trim(),
        content: data.content,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20))) // 只保留最近20条
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const handleExport = () => {
    if (!result) return

    const content = `# ${result.title}

${result.body}

---

${result.conclusion}

标签：${result.tags.join(' ')}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">输入选题</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="例如：如何选择适合自己的双眼皮术式"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            {loading ? '生成中...' : '生成文案'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          基于 IP 定位和你的文案规则，AI 将自动生成标题、正文和标签
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          生成失败：{error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">AI 正在创作中...</p>
          <p className="text-gray-400 text-xs mt-1">通常需要 5-15 秒</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Title */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">标题</span>
              <button
                onClick={() => handleCopy(result.title)}
                className="text-xs text-rose-600 hover:underline"
              >
                复制
              </button>
            </div>
            <h4 className="text-lg font-bold text-gray-900">{result.title}</h4>
          </div>

          {/* Body */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">正文</span>
              <button
                onClick={() => handleCopy(result.body)}
                className="text-xs text-rose-600 hover:underline"
              >
                复制
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.body}
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">结尾</span>
              <button
                onClick={() => handleCopy(result.conclusion)}
                className="text-xs text-rose-600 hover:underline"
              >
                复制
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {result.conclusion}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">标签</span>
              <button
                onClick={() => handleCopy(result.tags.join(' '))}
                className="text-xs text-rose-600 hover:underline"
              >
                复制
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-rose-100 text-rose-700 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              导出文案
            </button>
            <button
              onClick={() => {
                setResult(null)
                setTopic('')
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              重新创作
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
