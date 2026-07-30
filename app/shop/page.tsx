'use client'
import { useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'

const CATEGORIES = ['全部', '眼部整形', '鼻部整形', '面部轮廓', '微整形', '皮肤美容', '医生形象']

const MOCK_ITEMS = [
  {
    id: '1',
    title: '亚裔眼部双眼皮参考照 A系列',
    desc: '12张高质量参考图，涵盖内双、单眼皮、欧式双眼皮多种形态',
    category: '眼部整形',
    price: 50,
    count: 12,
    color: '#fce7f3',
    tag: '热门',
    tagColor: 'bg-rose-100 text-rose-600',
    seller: '平台精选',
  },
  {
    id: '2',
    title: '自然鼻形参考图集 Vol.1',
    desc: '8张专业鼻型参考，适合隆鼻/鼻头修复术前沟通',
    category: '鼻部整形',
    price: 30,
    count: 8,
    color: '#f0fdf4',
    tag: '新品',
    tagColor: 'bg-green-100 text-green-600',
    seller: '平台精选',
  },
  {
    id: '3',
    title: '面部轮廓对比参考图',
    desc: '下颌骨、颧骨、颏部整形前后对比，10张高清图',
    category: '面部轮廓',
    price: 60,
    count: 10,
    color: '#eff6ff',
    tag: '精选',
    tagColor: 'bg-blue-100 text-blue-600',
    seller: '平台精选',
  },
  {
    id: '4',
    title: '玻尿酸填充效果参考 B套',
    desc: '苹果肌、法令纹、唇部填充，多角度展示，6张',
    category: '微整形',
    price: 20,
    count: 6,
    color: '#fdf4ff',
    tag: null,
    tagColor: '',
    seller: '平台精选',
  },
  {
    id: '5',
    title: '光电美肤项目参考图集',
    desc: '皮秒、热玛吉、超皮秒术后改善效果参考，15张',
    category: '皮肤美容',
    price: 40,
    count: 15,
    color: '#fff7ed',
    tag: '畅销',
    tagColor: 'bg-amber-100 text-amber-600',
    seller: '平台精选',
  },
  {
    id: '6',
    title: '医生形象标准照示范集',
    desc: '专业医生形象参考，适用于医患合影生成，8张',
    category: '医生形象',
    price: 30,
    count: 8,
    color: '#f0f9ff',
    tag: null,
    tagColor: '',
    seller: '平台精选',
  },
  {
    id: '7',
    title: '眼部综合修复参考图 高级版',
    desc: '开眼角、去眼袋、眼睑下垂综合效果参考，20张',
    category: '眼部整形',
    price: 80,
    count: 20,
    color: '#fce7f3',
    tag: '高级',
    tagColor: 'bg-purple-100 text-purple-600',
    seller: '平台精选',
  },
  {
    id: '8',
    title: '综合面部美化参考图集',
    desc: '整体面部美化，适用于多项目综合咨询，12张',
    category: '面部轮廓',
    price: 50,
    count: 12,
    color: '#ecfdf5',
    tag: null,
    tagColor: '',
    seller: '平台精选',
  },
]

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [purchasedItems, setPurchasedItems] = useState<string[]>([])
  const [confirmItem, setConfirmItem] = useState<string | null>(null)

  const filtered = activeCategory === '全部'
    ? MOCK_ITEMS
    : MOCK_ITEMS.filter((item) => item.category === activeCategory)

  const handleBuy = (id: string) => {
    setConfirmItem(id)
  }

  const confirmPurchase = () => {
    if (confirmItem) {
      setPurchasedItems((prev) => [...prev, confirmItem])
      setConfirmItem(null)
    }
  }

  const confirmingItem = MOCK_ITEMS.find((i) => i.id === confirmItem)
  const credits = 320

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">商城</h1>
            <p className="text-sm text-gray-500 mt-1">精选参考图资源，购买后可直接用于生成工作流</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <span className="text-sm text-gray-500">我的积分</span>
            <span className="text-rose-600 font-bold text-lg">{credits}</span>
            <a href="/billing" className="ml-2 text-xs text-rose-600 hover:underline font-medium">充值 →</a>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeCategory === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const owned = purchasedItems.includes(item.id)
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-md transition-all">
                {/* Thumbnail */}
                <div
                  className="aspect-[4/3] flex items-center justify-center relative"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-4xl opacity-30"></span>
                  {item.tag && (
                    <span className={['absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full', item.tagColor].join(' ')}>
                      {item.tag}
                    </span>
                  )}
                  {owned && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-white text-green-600 text-xs font-semibold px-3 py-1.5 rounded-lg">已购买</span>
                    </div>
                  )}
                  {/* Preview count badge */}
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.count} 张
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                    <span className="text-xs text-gray-300">{item.seller}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">{item.desc}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-rose-600 font-bold text-lg">{item.price}</span>
                      <span className="text-xs text-gray-400">积分</span>
                    </div>
                    {owned ? (
                      <button className="bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                        查看图片
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        购买
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">该分类暂无商品</p>
          </div>
        )}
      </main>

      {/* Purchase confirm modal */}
      {confirmItem && confirmingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="mb-4">
              <h2 className="font-bold text-gray-900 mb-1">确认购买</h2>
              <p className="text-sm text-gray-600 mb-3">{confirmingItem.title}</p>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">包含 {confirmingItem.count} 张参考图</p>
                  <p className="text-xs text-gray-500 mt-0.5">购买后永久可用</p>
                </div>
                <div className="text-right">
                  <p className="text-rose-600 font-bold text-xl">{confirmingItem.price}</p>
                  <p className="text-xs text-gray-400">积分</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-500">当前积分</span>
                <span className="font-semibold text-gray-800">{credits} 积分</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">购买后剩余</span>
                <span className={['font-semibold', credits - confirmingItem.price >= 0 ? 'text-gray-800' : 'text-red-500'].join(' ')}>
                  {credits - confirmingItem.price} 积分
                </span>
              </div>
              {credits < confirmingItem.price && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
                  积分不足。<a href="/billing" className="underline font-medium">前往充值 →</a>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmItem(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmPurchase}
                disabled={credits < confirmingItem.price}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                确认购买
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
