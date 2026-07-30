'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface UserModules {
  ipAssistant: boolean
  imageGeneration: boolean
  workflow: boolean
  assets: boolean
}

interface User {
  email: string
  name: string
  modules: UserModules
  credits: number
}

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()

      if (data.authenticated && data.user) {
        setUser(data.user)

        // 检查当前页面权限
        const hasPermission = checkModulePermission(pathname, data.user.modules)
        if (!hasPermission) {
          alert('您暂无此功能的使用权限，请联系管理员开通')
          router.push('/ip-dashboard')
        }
      } else {
        // 未登录，跳转到登录页
        if (pathname !== '/login' && pathname !== '/admin') {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      if (pathname !== '/login' && pathname !== '/admin') {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const checkModulePermission = (path: string, modules: UserModules): boolean => {
    // 允许访问的公共页面
    const publicPaths = ['/login', '/admin', '/profile', '/billing', '/feedback']
    if (publicPaths.includes(path)) return true

    // 检查各模块权限
    if (path.startsWith('/ip-dashboard') || path.startsWith('/ip-agent')) {
      return modules.ipAssistant
    }
    if (path.startsWith('/generate')) {
      return modules.imageGeneration
    }
    if (path.startsWith('/workflow')) {
      return modules.workflow
    }
    if (path.startsWith('/assets') || path.startsWith('/dashboard')) {
      return modules.assets
    }

    return true
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return { user, loading, logout, checkAuth }
}
