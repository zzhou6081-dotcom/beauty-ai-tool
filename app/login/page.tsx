'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fill email from registration
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('请输入邮箱和密码')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      console.log('Login response:', { status: res.status, data })

      if (res.ok && data.success) {
        console.log('Login successful, redirecting to /ip-dashboard')
        // 登录成功，跳转到 IP 助手页面
        window.location.href = '/ip-dashboard'
      } else {
        setError(data.error || '登录失败，请检查邮箱和密码')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BeautyGen</h1>
        <p className="text-gray-500">IP 助手 & AI 生图平台</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱地址
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入您的邮箱"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入您的密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500 mb-3">
          还没有账号？
        </p>
        <Link
          href="/register"
          className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
        >
          立即注册 →
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
