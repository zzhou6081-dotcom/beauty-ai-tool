'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface NavEntry {
  href: string
  label: string
  en: string
  icon: React.ReactNode
  module: 'imageGeneration' | 'workflow' | 'ipAssistant' | 'assets' | 'shop'
}

const NAV_ENTRIES: NavEntry[] = [
  {
    href: '/ip-dashboard',
    label: 'IP助手',
    en: 'IP Assistant',
    module: 'ipAssistant',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
      </svg>
    ),
  },
  {
    href: '/generate',
    label: 'AI生图',
    en: 'Generate',
    module: 'imageGeneration',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
      </svg>
    ),
  },
  {
    href: '/workflow',
    label: '工作流',
    en: 'Workflow',
    module: 'workflow',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M3 4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H6.414l2.293 2.293a1 1 0 0 1-1.414 1.414L5 6.414V8a1 1 0 0 1-2 0V4Zm9 1a1 1 0 1 0 0 2h1.586l-2.293 2.293a1 1 0 0 0 1.414 1.414L15 8.414V10a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1h-4Zm-9 7a1 1 0 0 1 1 1v1.586l2.293-2.293a1 1 0 1 1 1.414 1.414L6.414 15H8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1v-4Zm13-1a1 1 0 0 0-1 1v1.586l-2.293-2.293a1 1 0 0 0-1.414 1.414L14.586 15H13a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: '/assets',
    label: '资产库',
    en: 'Assets',
    module: 'assets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: '/billing',
    label: '充值',
    en: 'Billing',
    module: 'shop',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M1 4.25a3.25 3.25 0 0 1 3.25-3.25h11.5A3.25 3.25 0 0 1 19 4.25v11.5A3.25 3.25 0 0 1 15.75 19H4.25A3.25 3.25 0 0 1 1 15.75V4.25Zm3.25-1.75A1.75 1.75 0 0 0 2.5 4.25v11.5c0 .966.784 1.75 1.75 1.75h11.5a1.75 1.75 0 0 0 1.75-1.75V4.25a1.75 1.75 0 0 0-1.75-1.75H4.25ZM10 8.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM8.75 10a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm3 1.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm1.25 1.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm-3 1.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
      </svg>
    ),
  },
]

const AVATAR_MENU = [
  { label: '👤 个人中心', href: '/profile' },
  { label: '💎 充值中心', href: '/billing' },
  { label: '💬 建议中心', href: '/feedback' },
]

export function Navbar() {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 检查是否已登录
  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await fetch('/api/auth/check')
        const data = await res.json()
        setIsLoggedIn(data.authenticated)
      } catch (error) {
        console.error('Failed to check login:', error)
      }
    }
    checkLogin()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // 所有导航项对已登录用户都可见
  const IS_LOGGED_IN = isLoggedIn

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={IS_LOGGED_IN ? '/generate' : '/'} className="flex items-center gap-2 flex-shrink-0">
          <span className="text-rose-600 font-bold text-lg tracking-tight">BeautyGen</span>
          <span className="text-xs text-gray-400 hidden sm:block">医美AI</span>
        </Link>

        {/* 4 main nav entries — only shown when logged in */}
        {IS_LOGGED_IN && !isLanding && (
          <nav className="flex items-center gap-1">
            {NAV_ENTRIES.map(({ href, label, en, icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    active
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span className={active ? 'text-rose-600' : 'text-gray-400'}>{icon}</span>
                  <span>{label}</span>
                  <span className={['text-xs hidden md:block', active ? 'text-rose-400' : 'text-gray-300'].join(' ')}>{en}</span>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {IS_LOGGED_IN && !isLanding ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-900">user@example.com</p>
                <p className="text-xs text-gray-400">
                  <span className="text-rose-600 font-semibold">320</span> 积分
                </p>
              </div>

              {/* Avatar dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-sm font-bold hover:bg-rose-200 transition-colors focus:outline-none"
                >
                  U
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                    {AVATAR_MENU.map(({ label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1.5 pt-1.5">
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        退出登录
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                登录
              </Link>
              <Link href="/register" className="px-4 py-1.5 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
