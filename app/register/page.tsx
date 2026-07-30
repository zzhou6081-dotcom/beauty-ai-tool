'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (!agreed) {
      setError('请同意用户协议和隐私政策')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址')
      return
    }
    if (password.length < 8) {
      setError('密码至少需要8位')
      return
    }

    setLoading(true)

    try {
      // Register API call
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || email.split('@')[0] }),
      })

      const data = await res.json()

      if (res.ok) {
        // 注册成功，跳转到登录页并自动填充邮箱
        router.push(`/login?email=${encodeURIComponent(email)}`)
      } else {
        setError(data.error || '注册失败，请重试')
      }
    } catch (error) {
      console.error('Register error:', error)
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-bold text-3xl">BeautyGen</Link>
          <p className="text-gray-400 text-sm mt-2">创建您的账号</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5 text-xs text-blue-700">
            注册后即可登录使用。开通会员后可使用完整功能和获得积分额度。
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                姓名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="您的姓名"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                邮箱 <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                密码 <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少8位字符"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                确认密码 <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                disabled={loading}
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-rose-600"
                disabled={loading}
              />
              <span className="text-xs text-gray-500">
                我已阅读并同意{' '}
                <a href="#" className="text-rose-600 hover:underline">《用户协议》</a>
                {' '}和{' '}
                <a href="#" className="text-rose-600 hover:underline">《隐私政策》</a>
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {loading ? '注册中...' : '立即注册'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            已有账号？{' '}
            <Link href="/login" className="text-rose-600 font-medium hover:underline">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
