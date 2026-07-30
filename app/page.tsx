import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          opacity: 0.4
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-2xl tracking-tight">BeautyGen</span>
            <span className="text-xs text-white/60 hidden sm:block">医美AI</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all border border-white/20"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30"
            >
              注册
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            AI-Powered Aesthetic
            <br />
            Visualization
          </h1>

          <p className="text-2xl md:text-3xl text-white/80 mb-4 font-light">
            AI 医美效果图生成平台
          </p>

          <p className="text-base md:text-lg text-white/60 mb-12 max-w-2xl leading-relaxed">
            基于先进的人工智能技术，为医美机构提供专业的术前预览、术后效果模拟和完整工作流管理
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl text-base font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/40 hover:scale-105"
            >
              开始使用
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl text-base font-semibold text-white hover:bg-white/10 transition-all border-2 border-white/30 hover:border-white/50"
            >
              立即登录
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-rose-500">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">智能生成</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                一键生成高质量医美效果图，支持多场景、多角度、多阶段的专业级图像输出
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-rose-500">
                  <path fillRule="evenodd" d="M3 4a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2H6.414l2.293 2.293a1 1 0 0 1-1.414 1.414L5 6.414V8a1 1 0 0 1-2 0V4Zm9 1a1 1 0 1 0 0 2h1.586l-2.293 2.293a1 1 0 0 0 1.414 1.414L15 8.414V10a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1h-4Zm-9 7a1 1 0 0 1 1 1v1.586l2.293-2.293a1 1 0 1 1 1.414 1.414L6.414 15H8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1v-4Zm13-1a1 1 0 0 0-1 1v1.586l-2.293-2.293a1 1 0 0 0-1.414 1.414L14.586 15H13a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">完整工作流</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                从术前设计到术后恢复全流程覆盖，为医患沟通提供完整的视觉化解决方案
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-rose-500">
                  <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">资产管理</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                所有生成图片永久保存，支持分类管理、快速检索和多端同步访问
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-white/40 text-sm">
              © 2026 BeautyGen. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
