'use client'
import { useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'

export default function ProfilePage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
          <p className="text-gray-500 mt-1">管理您的账号信息和会员状态</p>
        </div>

        {/* Avatar + name */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 flex items-center gap-5">
          <label className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-2xl font-bold flex-shrink-0 cursor-pointer hover:bg-rose-200 transition-colors">
            U
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">user@example.com</p>
            <p className="text-xs text-gray-400 mt-0.5">注册于 2026-07-01</p>
          </div>
          <label className="text-sm text-rose-600 hover:underline cursor-pointer">
            修改头像
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>

        {/* Member status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">会员状态</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-rose-600 text-lg">年度会员</p>
              <p className="text-xs text-gray-400 mt-0.5">到期时间：2027-07-20</p>
            </div>
            <a href="/billing" className="border border-rose-300 text-rose-600 hover:bg-rose-50 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              查看套餐
            </a>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            {[
              { label: '积分余额', value: '320' },
              { label: '积分包', value: '0' },
              { label: '生成次数', value: '47' },
              { label: '资产库使用', value: '8/200' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-bold text-gray-900 text-lg mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">账号设置</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">邮箱</label>
              <input
                type="email"
                defaultValue="user@example.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">手机号（可选）</label>
              <input
                type="tel"
                placeholder="未绑定"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              保存修改
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">已保存</span>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
