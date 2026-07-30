'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { ContentGenerator } from '@/components/ip/ContentGenerator'
import { DataAnalyzer } from '@/components/ip/DataAnalyzer'
import { CalendarPlanner } from '@/components/ip/CalendarPlanner'
import type { IPAgent } from '@/lib/ip/types'

export default function IPAgentPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.agentId as string

  const [agent, setAgent] = useState<IPAgent | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'data' | 'calendar'>('content')

  useEffect(() => {
    // 从 localStorage 加载 IP 信息
    const stored = localStorage.getItem('ip-agents')
    if (stored) {
      const agents: IPAgent[] = JSON.parse(stored)
      const found = agents.find((a) => a.id === agentId)
      if (found) {
        setAgent(found)
      } else {
        router.push('/ip-dashboard')
      }
    } else {
      router.push('/ip-dashboard')
    }
  }, [agentId, router])

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push('/ip-dashboard')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← 返回
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={[
                'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl',
                agent.type === 'founder'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-teal-100 text-teal-600',
              ].join(' ')}
            >
              {agent.type === 'founder' ? '👔' : '👨‍⚕️'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{agent.info.positioning}</p>
            </div>
          </div>
        </div>

        {/* IP Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">目标人群</p>
              <p className="text-sm text-gray-900">{agent.info.targetAudience}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">内容风格</p>
              <p className="text-sm text-gray-900">{agent.info.contentStyle}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">关键词</p>
              <div className="flex flex-wrap gap-1">
                {agent.info.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('content')}
              className={[
                'flex-1 py-4 text-sm font-medium transition-colors relative',
                activeTab === 'content'
                  ? 'text-rose-600'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              📝 选题 → 文案
              {activeTab === 'content' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={[
                'flex-1 py-4 text-sm font-medium transition-colors relative',
                activeTab === 'data'
                  ? 'text-rose-600'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              📊 数据 → 分析
              {activeTab === 'data' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={[
                'flex-1 py-4 text-sm font-medium transition-colors relative',
                activeTab === 'calendar'
                  ? 'text-rose-600'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              📅 周期规划
              {activeTab === 'calendar' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
              )}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'content' && <ContentGenerator agent={agent} />}
            {activeTab === 'data' && <DataAnalyzer agent={agent} />}
            {activeTab === 'calendar' && <CalendarPlanner agent={agent} />}
          </div>
        </div>
      </main>
    </div>
  )
}
