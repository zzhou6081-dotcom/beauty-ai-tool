'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'

const MOCK_IMAGES = [
  { id: '1', type: '术后即刻', variant: '效果图', case: '案例 · 张女士', time: '10分钟前', step: 'POST_OP', color: '#fce7f3' },
  { id: '2', type: '恢复期', variant: '第7天', case: '案例 · 张女士', time: '1小时前', step: 'RECOVERY', color: '#fef3c7' },
  { id: '3', type: '术前标准照', variant: '', case: '案例 · 李女士', time: '2小时前', step: 'PRE_OP', color: '#ecfdf5' },
  { id: '4', type: '术后即刻', variant: '效果图', case: '案例 · 李女士', time: '2小时前', step: 'POST_OP', color: '#fce7f3' },
  { id: '5', type: '恢复期', variant: '第3天', case: '案例 · 王女士', time: '昨天', step: 'RECOVERY', color: '#fef3c7' },
  { id: '6', type: '医患合影', variant: '', case: '案例 · 王女士', time: '昨天', step: 'COMPOSITE', color: '#eff6ff' },
  { id: '7', type: '术后即刻', variant: '效果图', case: '案例 · 陈女士', time: '2天前', step: 'POST_OP', color: '#fce7f3' },
  { id: '8', type: '同场景延展', variant: '延展图', case: '案例 · 陈女士', time: '2天前', step: 'EXPANSION', color: '#f3f4f6' },
]

const STEP_COLORS: Record<string, string> = {
  PRE_OP: 'bg-green-100 text-green-700',
  POST_OP: 'bg-rose-100 text-rose-700',
  RECOVERY: 'bg-amber-100 text-amber-700',
  EXPANSION: 'bg-gray-100 text-gray-700',
  COMPOSITE: 'bg-blue-100 text-blue-700',
}

const STEP_FILTER_MAP: Record<string, string> = {
  '术前标准照': 'PRE_OP',
  '术后即刻': 'POST_OP',
  '恢复期': 'RECOVERY',
  '同场景延展': 'EXPANSION',
  '医患合影': 'COMPOSITE',
}

export default function AssetsPage() {
  const [search, setSearch] = useState('')
  const [stepFilter, setStepFilter] = useState('全部步骤')
  const [favorited, setFavorited] = useState<Set<string>>(new Set())

  const filtered = MOCK_IMAGES.filter((img) => {
    const matchStep = stepFilter === '全部步骤' || img.step === STEP_FILTER_MAP[stepFilter]
    const matchSearch = !search || img.case.includes(search) || img.type.includes(search)
    return matchStep && matchSearch
  })

  const toggleFav = (id: string) => {
    setFavorited((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
            <p className="text-sm text-gray-500 mt-0.5">快速访问核心功能</p>
          </div>
        </div>

        {/* 4 Large entrance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/generate/select-category"
            className="group bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-2xl p-6 text-white transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="text-3xl mb-3">✦</div>
            <h3 className="text-lg font-bold mb-1">生成</h3>
            <p className="text-white/80 text-sm">Generate</p>
          </Link>

          <Link
            href="/generate/mock-session-001"
            className="group bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-2xl p-6 text-white transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold mb-1">工作流</h3>
            <p className="text-white/80 text-sm">Workflow</p>
          </Link>

          <button
            onClick={() => {
              const assetsSection = document.getElementById('assets-section')
              assetsSection?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-2xl p-6 text-white transition-all hover:shadow-xl hover:-translate-y-1 text-left"
          >
            <div className="text-3xl mb-3">🗂</div>
            <h3 className="text-lg font-bold mb-1">资产库</h3>
            <p className="text-white/80 text-sm">Assets</p>
          </button>

          <Link
            href="/billing"
            className="group bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-2xl p-6 text-white transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="text-3xl mb-3">💎</div>
            <h3 className="text-lg font-bold mb-1">商城</h3>
            <p className="text-white/80 text-sm">Shop</p>
          </Link>
        </div>

        {/* Assets section header */}
        <div id="assets-section" className="flex items-center justify-between mb-6 scroll-mt-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">我的资产</h2>
            <p className="text-sm text-gray-500 mt-0.5">管理您的所有生成图片</p>
          </div>
          <Link
            href="/generate"
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + 新建生成
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索案例名称..."
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[160px] focus:outline-none focus:border-rose-400"
          />
          <select
            value={stepFilter}
            onChange={(e) => setStepFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
          >
            <option>全部步骤</option>
            <option>术前标准照</option>
            <option>术后即刻</option>
            <option>恢复期</option>
            <option>同场景延展</option>
            <option>医患合影</option>
          </select>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            <span>已使用</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: '4%' }} />
            </div>
            <span className="font-medium text-gray-700">8 / 200 张</span>
          </div>
        </div>

        {/* Image grid */}
        {filtered.length > 0 ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map((img) => (
              <div
                key={img.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden break-inside-avoid group"
              >
                <div
                  className="w-full aspect-[3/4] flex items-center justify-center relative"
                  style={{ backgroundColor: img.color }}
                >
                  <div className="w-12 h-12 rounded-full bg-white/20" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button className="bg-white text-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50">下载</button>
                    <button className="bg-white text-gray-700 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50">分享</button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={['text-xs font-medium px-2 py-0.5 rounded-full', STEP_COLORS[img.step]].join(' ')}>
                      {img.type}
                    </span>
                    <button
                      onClick={() => toggleFav(img.id)}
                      className={['text-sm transition-colors', favorited.has(img.id) ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'].join(' ')}
                    >
                      ★
                    </button>
                  </div>
                  {img.variant && <p className="text-xs text-gray-500 mt-1">{img.variant}</p>}
                  <p className="text-xs text-gray-400 mt-1 truncate">{img.case}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{img.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">没有符合条件的图片</p>
          </div>
        )}

        <div className="mt-8 text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm mb-3">生成更多案例图片</p>
          <Link href="/generate" className="text-rose-600 text-sm font-medium hover:underline">
            + 新建生成
          </Link>
        </div>
      </main>
    </div>
  )
}
