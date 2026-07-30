import { Navbar } from '@/components/ui/Navbar'

const PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    nameEn: 'Monthly',
    price: 498,
    period: '月',
    badge: null,
    credits: 1000,
    creditsLabel: '赠送 1000 积分',
    features: [
      '无限次工作流生成',
      '所有品项无限制使用',
      '生成图片永久保存',
      '优先处理队列',
      '邮件客服支持',
      '高清图片下载',
    ],
    recommended: false,
  },
  {
    id: 'yearly',
    name: '年度会员',
    nameEn: 'Annual',
    price: 2980,
    period: '年',
    badge: '节省 ¥2996',
    perMonth: '约 ¥248/月',
    credits: 5000,
    creditsLabel: '赠送 5000 积分',
    features: [
      '无限次工作流生成',
      '所有品项无限制使用',
      '生成图片永久保存',
      '优先处理队列',
      '专属一对一客服支持',
      '新功能优先体验权',
      '批量生成与导出',
      'API 接口访问权限',
    ],
    recommended: true,
  },
]

const PACKS = [
  { credits: 1000, price: 100, perCredit: '0.1', badge: null },
  { credits: 2200, price: 200, perCredit: '0.09', badge: '性价比' },
  { credits: 5500, price: 500, perCredit: '0.09', badge: null },
]

const LEDGER = [
  { time: '2026-07-21 14:32', type: '消耗', note: '步骤③ 术后即刻图', amount: -10, balance: 320 },
  { time: '2026-07-21 14:28', type: '消耗', note: '步骤② 术前标准照', amount: -10, balance: 330 },
  { time: '2026-07-20 09:00', type: '订阅', note: '年度会员 积分发放', amount: +5000, balance: 340 },
  { time: '2026-07-15 16:20', type: '消耗', note: '步骤⑤ 恢复时间线', amount: -60, balance: 400 },
]

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">会员与积分</h1>
          <p className="text-gray-500 mt-1">管理您的订阅套餐和积分余额</p>
        </div>

        {/* Current status */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: '当前套餐', value: '年度会员', sub: '到期：2027-07-20', color: 'text-rose-600' },
            { label: '积分余额', value: '320 积分', sub: '会员期内可用', color: 'text-gray-900' },
            { label: '积分包余额', value: '0 积分', sub: '永久有效', color: 'text-gray-900' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={['text-xl font-bold', color].join(' ')}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Plans */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">订阅套餐</h2>
        <div className="grid md:grid-cols-2 gap-5 mb-10 max-w-2xl">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={[
                'bg-white rounded-2xl border-2 p-6 relative',
                plan.recommended ? 'border-rose-400' : 'border-gray-200',
              ].join(' ')}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  当前套餐
                </div>
              )}
              {plan.badge && (
                <div className="absolute top-4 right-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                <span className="text-xs text-gray-400 uppercase tracking-wider">{plan.nameEn}</span>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-bold text-gray-900">¥{plan.price}</span>
                <span className="text-sm text-gray-400">/{plan.period}</span>
              </div>
              {plan.perMonth && (
                <p className="text-xs text-rose-500 mb-2">{plan.perMonth}</p>
              )}
              {!plan.perMonth && <div className="mb-2" />}

              {/* Credits info */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs font-semibold text-amber-800">
                  {plan.creditsLabel}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">订阅即发放，会员期内有效</p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-4" />

              <ul className="space-y-2.5 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="text-rose-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={[
                  'w-full py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  plan.recommended
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-rose-600 hover:bg-rose-700 text-white',
                ].join(' ')}
                disabled={plan.recommended}
              >
                {plan.recommended ? '当前方案' : '切换至此套餐'}
              </button>
            </div>
          ))}
        </div>

        {/* Credit packs */}
        <h2 className="text-lg font-bold text-gray-900 mb-1">积分包（永久有效）</h2>
        <p className="text-sm text-gray-500 mb-4">积分包不随会员到期失效，消耗优先级低于订阅积分</p>
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl">
          {PACKS.map((pack) => (
            <div key={pack.price} className="bg-white rounded-2xl border-2 border-gray-200 p-5 relative hover:border-rose-200 transition-colors">
              {pack.badge && (
                <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pack.badge}
                </span>
              )}
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {pack.credits}
                <span className="text-sm text-gray-400 font-normal"> 积分</span>
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-4">每积分约 ¥{pack.perCredit}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">¥{pack.price}</span>
                <button className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  购买
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">常见问题</h2>
          <div className="space-y-3">
            {[
              { q: '积分如何消耗？', a: '所有 AI 生成操作均消耗积分：2K 图 10 积分/张，4K 图 20 积分/张。工作流中每个步骤的生成也正常消耗积分，与单独生成计费方式相同。' },
              { q: '订阅积分和积分包有什么区别？', a: '订阅积分在开通会员时一次性发放，仅在会员有效期内可用，会员到期后余额冻结无法使用；积分包随时购买、永久有效，不受会员状态影响。' },
              { q: '积分会过期吗？', a: '订阅积分随会员到期一同失效，到期前请确保用完；积分包中的积分永久有效，不受会员到期影响。建议先行使用订阅积分，再消耗积分包。' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-800">{q}</p>
                <p className="text-xs text-gray-500 mt-1">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">积分明细</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
            {['全部', '消耗', '充值', '赠送'].map((f) => (
              <button key={f} className={['text-xs font-medium px-3 py-1 rounded-full transition-colors', f === '全部' ? 'bg-rose-100 text-rose-600' : 'text-gray-500 hover:text-gray-700'].join(' ')}>
                {f}
              </button>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {LEDGER.map((row, i) => (
              <div key={i} className="flex items-center px-5 py-3.5">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{row.note}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{row.time}</p>
                </div>
                <div className="text-right">
                  <p className={['font-semibold text-sm', row.amount > 0 ? 'text-green-600' : 'text-gray-900'].join(' ')}>
                    {row.amount > 0 ? '+' : ''}{row.amount}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">余额 {row.balance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
