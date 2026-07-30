'use client'
import { useState } from 'react'
import type { IPAgent } from '@/lib/ip/types'

export function DataAnalyzer({ agent }: { agent: IPAgent }) {
  const [dataInput, setDataInput] = useState('')
  const [dataDescription, setDataDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    accountMetrics: string
    contentMetrics: string
    optimization: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!dataInput.trim()) {
      alert('请输入或上传数据')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 尝试解析为 JSON，否则作为文本
      let data: any
      try {
        data = JSON.parse(dataInput)
      } catch {
        data = dataInput
      }

      const response = await fetch('/api/ip-ai/analyze-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipInfo: agent.info,
          data,
          dataDescription: dataDescription.trim() || undefined,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || '分析失败')
      }

      setResult(responseData.analysis)

      // 保存到历史
      const historyKey = `ip-data-history-${agent.id}`
      const stored = localStorage.getItem(historyKey)
      const history = stored ? JSON.parse(stored) : []
      history.unshift({
        id: Date.now().toString(),
        dataSource: dataDescription.trim() || '数据分析',
        analysis: responseData.analysis,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 10)))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setDataInput(text)
      setDataDescription(file.name)
    }
    reader.readAsText(file)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const handleExport = () => {
    if (!result) return

    const content = `# ${agent.name} 数据分析报告

生成时间：${new Date().toLocaleString('zh-CN')}

## 账号整体分析
${result.accountMetrics}

## 内容与互动分析
${result.contentMetrics}

## 优化建议
${result.optimization}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agent.name}-数据分析-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">上传运营数据</h3>

        {/* Data Description */}
        <input
          type="text"
          value={dataDescription}
          onChange={(e) => setDataDescription(e.target.value)}
          placeholder="数据说明（可选）：例如 2024年7-9月运营数据"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 mb-3"
          disabled={loading}
        />

        {/* File Upload */}
        <div className="mb-3">
          <label className="block border-2 border-dashed border-gray-200 hover:border-rose-300 rounded-xl p-6 text-center cursor-pointer transition-all">
            <input
              type="file"
              accept=".txt,.csv,.json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
            <div className="text-3xl mb-2">📄</div>
            <p className="text-sm text-gray-600">点击上传文件</p>
            <p className="text-xs text-gray-400 mt-1">支持 TXT / CSV / JSON 格式</p>
          </label>
        </div>

        {/* Or Text Input */}
        <div className="text-center text-xs text-gray-400 mb-3">或直接粘贴数据</div>

        <textarea
          value={dataInput}
          onChange={(e) => setDataInput(e.target.value)}
          placeholder={`粘贴你的运营数据，例如：

日期,曝光量,点赞数,评论数,转发数,涨粉数
2024-07-01,5000,120,35,8,25
2024-07-02,6200,150,42,12,30
...

或 JSON 格式数据，或纯文本描述`}
          rows={8}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 resize-none font-mono text-sm"
          disabled={loading}
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !dataInput.trim()}
          className="w-full mt-3 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? '分析中...' : '开始分析'}
        </button>

        <p className="text-xs text-gray-400 mt-2">
          AI 将分析账号表现、内容质量，并提供具体优化建议
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          分析失败：{error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">AI 正在分析数据...</p>
          <p className="text-gray-400 text-xs mt-1">通常需要 10-20 秒</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Account Metrics */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-xl">📊</span>
                账号整体分析
              </h4>
              <button
                onClick={() => handleCopy(result.accountMetrics)}
                className="text-xs text-blue-600 hover:underline"
              >
                复制
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.accountMetrics}
            </div>
          </div>

          {/* Content Metrics */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-xl">📝</span>
                内容与互动分析
              </h4>
              <button
                onClick={() => handleCopy(result.contentMetrics)}
                className="text-xs text-purple-600 hover:underline"
              >
                复制
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.contentMetrics}
            </div>
          </div>

          {/* Optimization */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-xl">💡</span>
                优化建议
              </h4>
              <button
                onClick={() => handleCopy(result.optimization)}
                className="text-xs text-green-600 hover:underline"
              >
                复制
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.optimization}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              导出报告
            </button>
            <button
              onClick={() => {
                setResult(null)
                setDataInput('')
                setDataDescription('')
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              重新分析
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
