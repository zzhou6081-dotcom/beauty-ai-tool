'use client'
import { useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false)
  const [type, setType] = useState('功能建议')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    setSubmitted(true)
    setTitle('')
    setBody('')
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">建议中心</h1>
          <p className="text-gray-500 mt-1">您的每一条反馈都会帮助我们改进产品</p>
        </div>

        {/* Feedback form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">提交反馈</h2>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">✓</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">反馈已收到</p>
              <p className="text-xs text-gray-400 mt-1">感谢您的意见，我们会认真阅读每一条反馈</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">反馈类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {['功能建议', '问题反馈', '其他'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={[
                        'flex items-center justify-center gap-1.5 border rounded-xl py-2 text-sm transition-colors',
                        type === t
                          ? 'border-rose-400 bg-rose-50 text-rose-600 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50',
                      ].join(' ')}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">
                  标题 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="简短描述您的问题或建议"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">详细描述</label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="请详细描述您的使用体验、遇到的问题或改进建议..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">截图附件（可选）</label>
                <label className="block border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-gray-300 transition-colors">
                  <p className="text-xs text-gray-400">点击上传截图（最多3张）</p>
                  <input type="file" accept="image/*" multiple className="hidden" />
                </label>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                提交反馈
              </button>
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">我的历史反馈</h2>
          <div className="space-y-3">
            {[
              { title: '希望支持批量下载功能', type: '功能建议', status: '已收到', time: '2026-07-18', statusColor: 'bg-blue-100 text-blue-700' },
              { title: '术后即刻图生成速度较慢', type: '问题反馈', status: '处理中', time: '2026-07-15', statusColor: 'bg-amber-100 text-amber-700' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.type} · {item.time}</p>
                </div>
                <span className={['text-xs font-medium px-2 py-0.5 rounded-full', item.statusColor].join(' ')}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
